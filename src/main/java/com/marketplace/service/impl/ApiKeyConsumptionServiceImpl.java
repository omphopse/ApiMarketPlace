package com.marketplace.service.impl;

import com.marketplace.dto.ApiKeyAccessDecision;
import com.marketplace.entity.Api;
import com.marketplace.entity.ApiKey;
import com.marketplace.entity.ApiKeyStatus;
import com.marketplace.entity.ApiStatus;
import com.marketplace.entity.User;
import com.marketplace.entity.Subscription;
import com.marketplace.entity.SubscriptionStatus;
import com.marketplace.entity.UsageLog;
import com.marketplace.repository.ApiKeyRepository;
import com.marketplace.repository.SubscriptionRepository;
import com.marketplace.repository.UserRepository;
import java.util.Objects;
import com.marketplace.repository.UsageLogRepository;
import com.marketplace.security.api.ApiKeyPrincipal;
import com.marketplace.service.ApiKeyConsumptionService;
import jakarta.servlet.http.HttpServletRequest;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.time.LocalDateTime;
import java.util.Base64;
import java.util.Optional;
import lombok.RequiredArgsConstructor;
import org.springframework.data.mongodb.core.FindAndModifyOptions;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.data.mongodb.core.query.Update;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

@Service
@RequiredArgsConstructor
public class ApiKeyConsumptionServiceImpl implements ApiKeyConsumptionService {
    private final ApiKeyRepository apiKeyRepository;
    private final SubscriptionRepository subscriptionRepository;
    private final UserRepository userRepository;
    private final UsageLogRepository usageLogRepository;
    private final MongoTemplate mongoTemplate;

    @Override
    public ApiKeyAccessDecision validateRequest(Authentication authentication, HttpServletRequest request) {
        if (authentication == null || !(authentication.getPrincipal() instanceof ApiKeyPrincipal principal)) {
            return ApiKeyAccessDecision.builder()
                    .allowed(false)
                    .errorCode("AUTHENTICATION_REQUIRED")
                    .message("API key authentication required")
                    .statusCode(401)
                    .build();
        }

        Optional<ApiKey> apiKeyOptional = apiKeyRepository.findById(principal.apiKeyId());
        if (apiKeyOptional.isEmpty()) {
            return ApiKeyAccessDecision.builder()
                    .allowed(false)
                    .errorCode("INVALID_API_KEY")
                    .message("API key was not found")
                    .statusCode(401)
                    .build();
        }

        ApiKey apiKey = apiKeyOptional.get();
        if (apiKey.getStatus() != ApiKeyStatus.ACTIVE) {
            return ApiKeyAccessDecision.builder()
                    .allowed(false)
                    .errorCode("REVOKED_API_KEY")
                    .message("API key is revoked")
                    .statusCode(401)
                    .build();
        }

        Subscription subscription = apiKey.getSubscription();
        if (subscription == null) {
            return ApiKeyAccessDecision.builder()
                    .allowed(false)
                    .errorCode("SUBSCRIPTION_NOT_FOUND")
                    .message("Subscription was not found")
                    .statusCode(403)
                    .build();
        }

        if (subscription.getStatus() != SubscriptionStatus.ACTIVE) {
            return ApiKeyAccessDecision.builder()
                    .allowed(false)
                    .errorCode("SUBSCRIPTION_INACTIVE")
                    .message("Subscription is not active")
                    .statusCode(403)
                    .build();
        }

        if (subscription.getExpiresAt() != null && subscription.getExpiresAt().isBefore(LocalDateTime.now())) {
            return ApiKeyAccessDecision.builder()
                    .allowed(false)
                    .errorCode("SUBSCRIPTION_EXPIRED")
                    .message("Subscription has expired")
                    .statusCode(403)
                    .build();
        }

        Api api = apiKey.getApi();
        if (api == null || api.isDeleted() || api.getStatus() != ApiStatus.APPROVED) {
            return ApiKeyAccessDecision.builder()
                    .allowed(false)
                    .errorCode("API_NOT_AVAILABLE")
                    .message("This API is no longer available because its provider account has been deactivated.")
                    .statusCode(403)
                    .build();
        }

        if (api.getProviderId() == null || !userRepository.findById(api.getProviderId()).filter(User::isEnabled).isPresent()) {
            return ApiKeyAccessDecision.builder()
                    .allowed(false)
                    .errorCode("API_NOT_AVAILABLE")
                    .message("This API is no longer available because its provider account has been deactivated.")
                    .statusCode(403)
                    .build();
        }

        String requestedPathApiId = extractApiId(request);
        if (StringUtils.hasText(requestedPathApiId) && !requestedPathApiId.equals(api.getId())) {
            return ApiKeyAccessDecision.builder()
                    .allowed(false)
                    .errorCode("API_MISMATCH")
                    .message("API key is not valid for the requested API")
                    .statusCode(403)
                    .build();
        }

        Integer limit = subscription.getSubscriptionPlan() != null ? subscription.getSubscriptionPlan().getRequestLimit() : api.getRateLimit();
        if (limit == null || limit <= 0) {
            limit = api.getRateLimit() != null ? api.getRateLimit() : 60;
        }

        String rateLimitKey = buildRateLimitKey(subscription, api);
        Long remaining = checkRateLimit(rateLimitKey, limit);
        if (remaining != null && remaining < 0) {
            recordUsage(apiKey, subscription, api, request, 429, true);
            return ApiKeyAccessDecision.builder()
                    .allowed(false)
                    .errorCode("RATE_LIMIT_EXCEEDED")
                    .message("Rate limit exceeded")
                    .statusCode(429)
                    .limit(limit)
                    .remaining(0L)
                    .retryAfterSeconds(60L)
                    .rateLimitKey(rateLimitKey)
                    .apiKey(apiKey)
                    .subscription(subscription)
                    .api(api)
                    .build();
        }

        recordUsage(apiKey, subscription, api, request, 200, false);
        return ApiKeyAccessDecision.builder()
                .allowed(true)
                .limit(limit)
                .remaining(remaining)
                .rateLimitKey(rateLimitKey)
                .apiKey(apiKey)
                .subscription(subscription)
                .api(api)
                .build();
    }

    @Override
    public ApiKeyPrincipal resolvePrincipal(ApiKey apiKey) {
        return new ApiKeyPrincipal(apiKey.getId(), apiKey.getConsumer().getId(), apiKey.getSubscription().getId(), apiKey.getApi().getId());
    }

    @Override
    public Subscription resolveSubscription(ApiKey apiKey) {
        return apiKey.getSubscription();
    }

    @Override
    public Api resolveApi(ApiKey apiKey) {
        return apiKey.getApi();
    }

    private String buildRateLimitKey(Subscription subscription, Api api) {
        return String.join(":", Objects.requireNonNullElse(subscription.getConsumer(), new com.marketplace.entity.User()).getId(), api.getId(), subscription.getId());
    }

    private Long checkRateLimit(String key, int limit) {
        String window = java.time.LocalDateTime.now().withNano(0).format(java.time.format.DateTimeFormatter.ofPattern("yyyyMMddHHmm"));
        String rateLimitId = key + ":" + window;
        Query query = new Query(Criteria.where("_id").is(rateLimitId));
        org.bson.Document existing = mongoTemplate.findOne(query, org.bson.Document.class, "rate_limit_counters");
        long currentCount = existing != null && existing.get("count", Number.class) != null
                ? existing.get("count", Number.class).longValue()
                : 0L;

        if (currentCount >= limit) {
            return -1L;
        }

        Update update = new Update().inc("count", 1);
        org.bson.Document updated = mongoTemplate.findAndModify(
                query,
                update,
                FindAndModifyOptions.options().returnNew(true).upsert(true),
                org.bson.Document.class,
                "rate_limit_counters");
        Number count = updated != null ? updated.get("count", Number.class) : null;
        long countValue = count == null ? 0L : count.longValue();
        return limit - countValue;
    }

    private String extractApiId(HttpServletRequest request) {
        String uri = request.getRequestURI();
        int marker = uri.indexOf("/apis/");
        if (marker < 0) {
            return null;
        }
        String tail = uri.substring(marker + "/apis/".length());
        int slashIndex = tail.indexOf('/');
        return slashIndex >= 0 ? tail.substring(0, slashIndex) : tail;
    }

    private void recordUsage(ApiKey apiKey, Subscription subscription, Api api, HttpServletRequest request, int statusCode, boolean rateLimited) {
        UsageLog usageLog = UsageLog.builder()
                .consumer(apiKey.getConsumer())
                .api(api)
                .subscription(subscription)
                .endpoint(request.getRequestURI())
                .httpMethod(request.getMethod())
                .statusCode(statusCode)
                .responseTimeMs(0L)
                .timestamp(LocalDateTime.now())
                .build();
        usageLogRepository.save(usageLog);
    }
}
