package com.marketplace.service.impl;

import com.marketplace.constants.AppConstants;
import com.marketplace.dto.ApiDocumentationResponse;
import com.marketplace.dto.ApiKeyCreatedResponse;
import com.marketplace.dto.ApiKeyResponse;
import com.marketplace.dto.ApiMarketplaceCardResponse;
import com.marketplace.dto.ApiMarketplaceDetailsResponse;
import com.marketplace.dto.CategoryResponse;
import com.marketplace.dto.ConsumerDashboardResponse;
import com.marketplace.dto.ConsumerProfileResponse;
import com.marketplace.dto.ConsumerProfileUpdateRequest;
import com.marketplace.dto.CreateSubscriptionRequest;
import com.marketplace.dto.PagedResponse;
import com.marketplace.dto.SubscriptionActivationResponse;
import com.marketplace.dto.SubscriptionDetailsResponse;
import com.marketplace.dto.SubscriptionPlanResponse;
import com.marketplace.dto.SubscriptionResponse;
import com.marketplace.dto.UsageLogResponse;
import com.marketplace.dto.UsageSummaryResponse;
import com.marketplace.entity.Api;
import com.marketplace.entity.ApiDocumentation;
import com.marketplace.entity.ApiKey;
import com.marketplace.entity.ApiKeyStatus;
import com.marketplace.entity.ApiStatus;
import com.marketplace.entity.BillingCycle;
import com.marketplace.entity.Category;
import com.marketplace.entity.ConsumerProfile;
import com.marketplace.entity.Subscription;
import com.marketplace.entity.SubscriptionPlan;
import com.marketplace.entity.SubscriptionStatus;
import com.marketplace.entity.UsageLog;
import com.marketplace.entity.User;
import com.marketplace.exception.ApiKeyNotFoundException;
import com.marketplace.exception.ApiNotAvailableException;
import com.marketplace.exception.InvalidSubscriptionStateException;
import com.marketplace.exception.PlanNotAvailableException;
import com.marketplace.exception.ResourceNotFoundException;
import com.marketplace.exception.SubscriptionAlreadyExistsException;
import com.marketplace.exception.SubscriptionNotFoundException;
import com.marketplace.exception.UnauthorizedResourceAccessException;
import com.marketplace.repository.ApiDocumentationRepository;
import com.marketplace.repository.ApiKeyRepository;
import com.marketplace.repository.ApiRepository;
import com.marketplace.repository.CategoryRepository;
import com.marketplace.repository.ConsumerProfileRepository;
import com.marketplace.repository.SubscriptionPlanRepository;
import com.marketplace.repository.SubscriptionRepository;
import com.marketplace.repository.UsageLogRepository;
import com.marketplace.repository.UserRepository;
import com.marketplace.service.ConsumerService;
import jakarta.transaction.Transactional;
import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.Base64;
import java.util.List;
import java.util.Objects;
import java.util.Optional;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

@Service
@RequiredArgsConstructor
public class ConsumerServiceImpl implements ConsumerService {
    private static final String API_KEY_PREFIX = "amp_live_";
    private static final int MAX_PAGE_SIZE = 100;

    private final ConsumerProfileRepository consumerProfileRepository;
    private final UserRepository userRepository;
    private final ApiRepository apiRepository;
    private final CategoryRepository categoryRepository;
    private final SubscriptionPlanRepository subscriptionPlanRepository;
    private final SubscriptionRepository subscriptionRepository;
    private final ApiKeyRepository apiKeyRepository;
    private final ApiDocumentationRepository apiDocumentationRepository;
    private final UsageLogRepository usageLogRepository;

    @Override
    @Transactional
    public ConsumerProfileResponse getProfile() {
        User user = getCurrentUser();
        ConsumerProfile profile = consumerProfileRepository.findByUserId(user.getId())
                .orElseGet(() -> createDefaultProfile(user));
        return toProfileResponse(profile, user);
    }

    @Override
    @Transactional
    public ConsumerProfileResponse updateProfile(ConsumerProfileUpdateRequest request) {
        User user = getCurrentUser();
        ConsumerProfile profile = consumerProfileRepository.findByUserId(user.getId())
                .orElseGet(() -> createDefaultProfile(user));

        if (request.getDisplayName() != null) profile.setDisplayName(request.getDisplayName());
        if (request.getCompanyName() != null) profile.setCompanyName(request.getCompanyName());
        if (request.getWebsite() != null) profile.setWebsite(request.getWebsite());
        if (request.getCountry() != null) profile.setCountry(request.getCountry());
        if (request.getProfileImage() != null) profile.setProfileImage(request.getProfileImage());

        consumerProfileRepository.save(profile);
        return toProfileResponse(profile, user);
    }

    @Override
    @Transactional
    public PagedResponse<ApiMarketplaceCardResponse> browseMarketplace(int page, int size, String search, Long categoryId, String pricing, String sort) {
        size = validateSize(size);
        Pageable pageable = PageRequest.of(page, size);
        Specification<Api> spec = buildMarketplaceSpecification(search, categoryId, pricing);
        Page<Api> result = apiRepository.findAll(spec, pageable);
        return toPagedResponse(result, this::toMarketplaceCard);
    }

    @Override
    @Transactional
    public ApiMarketplaceDetailsResponse getMarketplaceApi(Long apiId) {
        Api api = apiRepository.findByIdAndDeletedFalse(apiId)
                .filter(a -> a.getStatus() == ApiStatus.APPROVED)
                .orElseThrow(() -> new ApiNotAvailableException("API is not available"));
        Category category = categoryRepository.findById(api.getCategoryId()).orElse(null);
        return ApiMarketplaceDetailsResponse.builder()
                .id(api.getId())
                .name(api.getName())
                .description(api.getDescription())
                .logoUrl(api.getLogo())
                .category(category != null ? CategoryResponse.builder().id(category.getId()).name(category.getName()).build() : null)
                .provider(new ApiMarketplaceDetailsResponse.ProviderSummary(api.getProviderId() != null ? String.valueOf(api.getProviderId()) : null, null))
                .version(api.getVersion())
                .documentationAvailable(apiDocumentationRepository.findByApiId(api.getId()).isPresent())
                .build();
    }

    @Override
    @Transactional
    public List<SubscriptionPlanResponse> getApiPlans(Long apiId) {
        Api api = apiRepository.findByIdAndDeletedFalse(apiId)
                .filter(a -> a.getStatus() == ApiStatus.APPROVED)
                .orElseThrow(() -> new ApiNotAvailableException("API is not available"));
        return subscriptionPlanRepository.findByApiId(api.getId()).stream()
                .filter(SubscriptionPlan::isActive)
                .map(this::toPlanResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public SubscriptionResponse createSubscription(CreateSubscriptionRequest request) {
        User consumer = getCurrentUser();
        Api api = apiRepository.findByIdAndDeletedFalse(request.getApiId())
                .orElseThrow(() -> new ApiNotAvailableException("API is not available"));
        if (api.getStatus() != ApiStatus.APPROVED) {
            throw new ApiNotAvailableException("API is not available");
        }
        SubscriptionPlan plan = subscriptionPlanRepository.findById(request.getPlanId())
                .orElseThrow(() -> new PlanNotAvailableException("Subscription plan not found"));
        if (!Objects.equals(plan.getApiId(), api.getId())) {
            throw new PlanNotAvailableException("Subscription plan does not belong to this API");
        }
        if (!plan.isActive()) {
            throw new PlanNotAvailableException("Subscription plan is inactive");
        }
        if (subscriptionRepository.existsByConsumerAndApiAndStatusIn(consumer, api, List.of(SubscriptionStatus.ACTIVE, SubscriptionStatus.PENDING))) {
            throw new SubscriptionAlreadyExistsException("An active or pending subscription already exists for this API");
        }

        Subscription subscription = Subscription.builder()
                .consumer(consumer)
                .api(api)
                .subscriptionPlan(plan)
                .status(SubscriptionStatus.PENDING)
                .price(plan.getPrice())
                .autoRenew(false)
                .build();
        subscriptionRepository.save(subscription);
        return toSubscriptionResponse(subscription);
    }

    @Override
    @Transactional
    public SubscriptionActivationResponse activateSubscription(Long subscriptionId) {
        User consumer = getCurrentUser();
        Subscription subscription = getSubscriptionForCurrentConsumer(subscriptionId, consumer);
        if (subscription.getStatus() != SubscriptionStatus.PENDING) {
            throw new InvalidSubscriptionStateException("Subscription is not pending");
        }
        if (subscription.getApi().getStatus() != ApiStatus.APPROVED) {
            throw new ApiNotAvailableException("API is not available");
        }
        if (!subscription.getSubscriptionPlan().isActive()) {
            throw new PlanNotAvailableException("Subscription plan is inactive");
        }

        subscription.setStatus(SubscriptionStatus.ACTIVE);
        subscription.setStartedAt(LocalDateTime.now());
        subscription.setExpiresAt(calculateExpiry(subscription.getSubscriptionPlan().getBillingCycle()));
        subscriptionRepository.save(subscription);

        String rawKey = generateApiKey(subscription);
        return SubscriptionActivationResponse.builder()
                .subscriptionId(subscription.getId())
                .status(subscription.getStatus().name())
                .apiKey(rawKey)
                .build();
    }

    @Override
    @Transactional
    public List<ApiKeyResponse> getApiKeys() {
        User consumer = getCurrentUser();
        return apiKeyRepository.findByConsumerOrderByCreatedAtDesc(consumer).stream()
                .map(this::toApiKeyResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public ApiKeyCreatedResponse regenerateApiKey(Long subscriptionId) {
        User consumer = getCurrentUser();
        Subscription subscription = getSubscriptionForCurrentConsumer(subscriptionId, consumer);
        if (subscription.getStatus() != SubscriptionStatus.ACTIVE) {
            throw new InvalidSubscriptionStateException("Subscription must be active to regenerate an API key");
        }

        apiKeyRepository.findBySubscriptionAndConsumer(subscription, consumer).ifPresent(existing -> {
            existing.setStatus(ApiKeyStatus.REVOKED);
            existing.setRevokedAt(LocalDateTime.now());
            apiKeyRepository.save(existing);
        });

        String rawKey = generateApiKey(subscription);
        return ApiKeyCreatedResponse.builder()
                .subscriptionId(subscription.getId())
                .apiKey(rawKey)
                .build();
    }

    @Override
    @Transactional
    public void revokeApiKey(Long apiKeyId) {
        User consumer = getCurrentUser();
        ApiKey apiKey = apiKeyRepository.findByIdAndConsumer(apiKeyId, consumer)
                .orElseThrow(() -> new ApiKeyNotFoundException("API key not found"));
        apiKey.setStatus(ApiKeyStatus.REVOKED);
        apiKey.setRevokedAt(LocalDateTime.now());
        apiKeyRepository.save(apiKey);
    }

    @Override
    @Transactional
    public PagedResponse<SubscriptionResponse> getSubscriptions(int page, int size, String status, String search) {
        User consumer = getCurrentUser();
        size = validateSize(size);
        Pageable pageable = PageRequest.of(page, size);
        Page<Subscription> result;
        if (StringUtils.hasText(status)) {
            result = subscriptionRepository.findByConsumerAndStatusOrderByCreatedAtDesc(consumer, SubscriptionStatus.valueOf(status.toUpperCase()), pageable);
        } else {
            result = subscriptionRepository.findByConsumerOrderByCreatedAtDesc(consumer, pageable);
        }
        return toPagedResponse(result, this::toSubscriptionResponse);
    }

    @Override
    @Transactional
    public SubscriptionDetailsResponse getSubscription(Long subscriptionId) {
        User consumer = getCurrentUser();
        Subscription subscription = getSubscriptionForCurrentConsumer(subscriptionId, consumer);
        ApiKey apiKey = apiKeyRepository.findBySubscriptionAndConsumer(subscription, consumer).orElse(null);
        return SubscriptionDetailsResponse.builder()
                .subscriptionId(subscription.getId())
                .apiName(subscription.getApi().getName())
                .planName(subscription.getSubscriptionPlan().getPlanName())
                .status(subscription.getStatus().name())
                .startedAt(subscription.getStartedAt())
                .expiresAt(subscription.getExpiresAt())
                .usageSummary(buildUsageSummary(subscription))
                .apiKeyMetadata(apiKey != null ? new SubscriptionDetailsResponse.ApiKeyMetadata(apiKey.getId(), apiKey.getKeyPrefix(), apiKey.getStatus().name(), apiKey.getCreatedAt(), apiKey.getLastUsedAt()) : null)
                .documentationAvailable(apiDocumentationRepository.findByApiId(subscription.getApi().getId()).isPresent())
                .build();
    }

    @Override
    @Transactional
    public void cancelSubscription(Long subscriptionId) {
        User consumer = getCurrentUser();
        Subscription subscription = getSubscriptionForCurrentConsumer(subscriptionId, consumer);
        if (subscription.getStatus() == SubscriptionStatus.CANCELLED) {
            throw new InvalidSubscriptionStateException("Subscription is already cancelled");
        }
        subscription.setStatus(SubscriptionStatus.CANCELLED);
        subscription.setExpiresAt(LocalDateTime.now());
        subscriptionRepository.save(subscription);
        apiKeyRepository.findBySubscription(subscription).forEach(apiKey -> {
            apiKey.setStatus(ApiKeyStatus.REVOKED);
            apiKey.setRevokedAt(LocalDateTime.now());
            apiKeyRepository.save(apiKey);
        });
    }

    @Override
    @Transactional
    public ApiDocumentationResponse getSubscriptionDocumentation(Long subscriptionId) {
        User consumer = getCurrentUser();
        Subscription subscription = getSubscriptionForCurrentConsumer(subscriptionId, consumer);
        if (subscription.getStatus() != SubscriptionStatus.ACTIVE) {
            throw new InvalidSubscriptionStateException("Subscription must be active");
        }
        if (subscription.getExpiresAt() != null && subscription.getExpiresAt().isBefore(LocalDateTime.now())) {
            throw new InvalidSubscriptionStateException("Subscription has expired");
        }
        ApiDocumentation documentation = apiDocumentationRepository.findByApiId(subscription.getApi().getId())
                .orElseThrow(() -> new ResourceNotFoundException("API documentation not found"));
        return ApiDocumentationResponse.builder()
                .apiName(subscription.getApi().getName())
                .baseEndpoint(documentation.getBaseEndpoint())
                .authenticationGuide(documentation.getAuthenticationGuide())
                .headers(documentation.getHeaders())
                .requestExample(documentation.getRequestExample())
                .responseExample(documentation.getResponseExample())
                .errorCodes(documentation.getErrorCodes())
                .markdown(documentation.getMarkdown())
                .build();
    }

    @Override
    @Transactional
    public UsageSummaryResponse getUsageSummary(Long subscriptionId) {
        User consumer = getCurrentUser();
        if (subscriptionId != null) {
            Subscription subscription = getSubscriptionForCurrentConsumer(subscriptionId, consumer);
            return buildUsageSummary(subscription);
        }
        return UsageSummaryResponse.builder().totalRequests(0L).successfulRequests(0L).failedRequests(0L).requestLimit(0).remainingRequests(0).build();
    }

    @Override
    @Transactional
    public ConsumerDashboardResponse getDashboard() {
        User consumer = getCurrentUser();
        long totalSubscriptions = subscriptionRepository.countByConsumer(consumer);
        long activeSubscriptions = subscriptionRepository.countByConsumerAndStatus(consumer, SubscriptionStatus.ACTIVE);
        long totalRequestsThisMonth = usageLogRepository.countByConsumerSince(consumer, LocalDateTime.now().minusMonths(1));
        long remainingRequests = Math.max(0L, 10000L - totalRequestsThisMonth);
        List<SubscriptionResponse> recentSubscriptions = subscriptionRepository.findByConsumerOrderByCreatedAtDesc(consumer, PageRequest.of(0, 5)).stream()
                .map(this::toSubscriptionResponse)
                .collect(Collectors.toList());
        List<UsageLogResponse> recentUsage = usageLogRepository.findTop10ByConsumerOrderByTimestampDesc(consumer).stream()
                .map(this::toUsageLogResponse)
                .collect(Collectors.toList());
        return ConsumerDashboardResponse.builder()
                .activeSubscriptions(activeSubscriptions)
                .totalSubscriptions(totalSubscriptions)
                .totalRequestsThisMonth(totalRequestsThisMonth)
                .remainingRequests(remainingRequests)
                .recentSubscriptions(recentSubscriptions)
                .recentUsage(recentUsage)
                .build();
    }

    private Subscription getSubscriptionForCurrentConsumer(Long subscriptionId, User consumer) {
        Subscription subscription = subscriptionRepository.findById(subscriptionId)
                .orElseThrow(() -> new SubscriptionNotFoundException("Subscription not found"));
        if (!Objects.equals(subscription.getConsumer().getId(), consumer.getId())) {
            throw new AccessDeniedException("You do not have access to this subscription");
        }
        return subscription;
    }

    private ConsumerProfile createDefaultProfile(User user) {
        ConsumerProfile profile = ConsumerProfile.builder().user(user).build();
        return consumerProfileRepository.save(profile);
    }

    private ConsumerProfileResponse toProfileResponse(ConsumerProfile profile, User user) {
        return ConsumerProfileResponse.builder()
                .id(profile.getId())
                .fullName(user.getFullName())
                .email(user.getEmail())
                .displayName(profile.getDisplayName())
                .companyName(profile.getCompanyName())
                .website(profile.getWebsite())
                .country(profile.getCountry())
                .profileImage(profile.getProfileImage())
                .build();
    }

    private ApiMarketplaceCardResponse toMarketplaceCard(Api api) {
        Category category = categoryRepository.findById(api.getCategoryId()).orElse(null);
        return ApiMarketplaceCardResponse.builder()
                .id(api.getId())
                .name(api.getName())
                .shortDescription(api.getDescription())
                .logoUrl(api.getLogo())
                .category(category != null ? category.getName() : null)
                .providerName(api.getProviderId() != null ? String.valueOf(api.getProviderId()) : null)
                .version(api.getVersion())
                .startingPrice(subscriptionPlanRepository.findByApiId(api.getId()).stream().filter(SubscriptionPlan::isActive).min((a, b) -> a.getPrice().compareTo(b.getPrice())).map(SubscriptionPlan::getPrice).orElse(BigDecimal.ZERO))
                .hasFreePlan(subscriptionPlanRepository.findByApiId(api.getId()).stream().anyMatch(plan -> plan.isActive() && plan.getPrice().compareTo(BigDecimal.ZERO) == 0))
                .build();
    }

    private SubscriptionPlanResponse toPlanResponse(SubscriptionPlan plan) {
        return SubscriptionPlanResponse.builder()
                .planId(plan.getId())
                .planName(plan.getPlanName())
                .price(plan.getPrice())
                .billingCycle(plan.getBillingCycle().name())
                .requestLimit(plan.getRequestLimit())
                .description(plan.getPlanName())
                .active(plan.isActive())
                .build();
    }

    private SubscriptionResponse toSubscriptionResponse(Subscription subscription) {
        return SubscriptionResponse.builder()
                .subscriptionId(subscription.getId())
                .api(new SubscriptionResponse.ApiSummary(subscription.getApi().getId(), subscription.getApi().getName()))
                .plan(new SubscriptionResponse.PlanSummary(subscription.getSubscriptionPlan().getId(), subscription.getSubscriptionPlan().getPlanName(), subscription.getSubscriptionPlan().getPrice(), subscription.getSubscriptionPlan().getBillingCycle().name(), subscription.getSubscriptionPlan().getRequestLimit()))
                .status(subscription.getStatus().name())
                .createdAt(subscription.getCreatedAt())
                .build();
    }

    private UsageSummaryResponse buildUsageSummary(Subscription subscription) {
        long totalRequests = usageLogRepository.countByConsumerSince(subscription.getConsumer(), subscription.getStartedAt() != null ? subscription.getStartedAt() : LocalDateTime.now().minusYears(10));
        long successfulRequests = totalRequests;
        long failedRequests = 0;
        int requestLimit = subscription.getSubscriptionPlan().getRequestLimit();
        long remainingRequests = Math.max(0L, (long) requestLimit - totalRequests);
        return UsageSummaryResponse.builder()
                .totalRequests(totalRequests)
                .successfulRequests(successfulRequests)
                .failedRequests(failedRequests)
                .requestLimit(requestLimit)
                .remainingRequests(remainingRequests)
                .periodStart(subscription.getStartedAt())
                .periodEnd(subscription.getExpiresAt())
                .recentRequests(List.of())
                .build();
    }

    private UsageLogResponse toUsageLogResponse(UsageLog usageLog) {
        return UsageLogResponse.builder()
                .id(usageLog.getId())
                .endpoint(usageLog.getEndpoint())
                .httpMethod(usageLog.getHttpMethod())
                .statusCode(usageLog.getStatusCode())
                .responseTimeMs(usageLog.getResponseTimeMs())
                .timestamp(usageLog.getTimestamp())
                .build();
    }

    private ApiKeyResponse toApiKeyResponse(ApiKey apiKey) {
        String masked = apiKey.getKeyPrefix() + "••••••••••••";
        return ApiKeyResponse.builder()
                .id(apiKey.getId())
                .apiName(apiKey.getApi().getName())
                .keyPrefix(apiKey.getKeyPrefix())
                .maskedKey(masked)
                .status(apiKey.getStatus().name())
                .createdAt(apiKey.getCreatedAt())
                .lastUsedAt(apiKey.getLastUsedAt())
                .build();
    }

    private String generateApiKey(Subscription subscription) {
        byte[] bytes = new byte[24];
        new SecureRandom().nextBytes(bytes);
        String randomPart = Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
        String rawKey = API_KEY_PREFIX + randomPart;
        String hash = hashKey(rawKey);
        ApiKey apiKey = ApiKey.builder()
                .subscription(subscription)
                .consumer(subscription.getConsumer())
                .api(subscription.getApi())
                .keyHash(hash)
                .keyPrefix(rawKey.substring(0, Math.min(rawKey.length(), 16)))
                .status(ApiKeyStatus.ACTIVE)
                .build();
        apiKeyRepository.save(apiKey);
        return rawKey;
    }

    private String hashKey(String rawKey) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hashBytes = digest.digest(rawKey.getBytes(StandardCharsets.UTF_8));
            return Base64.getEncoder().encodeToString(hashBytes);
        } catch (Exception ex) {
            throw new IllegalStateException("Unable to hash API key", ex);
        }
    }

    private LocalDateTime calculateExpiry(BillingCycle billingCycle) {
        LocalDateTime startedAt = LocalDateTime.now();
        return switch (billingCycle) {
            case FREE -> startedAt.plusDays(30);
            case MONTHLY -> startedAt.plusMonths(1);
            case QUARTERLY -> startedAt.plusMonths(3);
            case YEARLY -> startedAt.plusYears(1);
        };
    }

    private User getCurrentUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }

    private int validateSize(int size) {
        if (size <= 0) size = 12;
        if (size > MAX_PAGE_SIZE) size = MAX_PAGE_SIZE;
        return size;
    }

    private <T, E> PagedResponse<T> toPagedResponse(Page<E> page, java.util.function.Function<E, T> mapper) {
        return PagedResponse.<T>builder()
                .content(page.getContent().stream().map(mapper).collect(Collectors.toList()))
                .page(page.getNumber())
                .size(page.getSize())
                .totalElements(page.getTotalElements())
                .totalPages(page.getTotalPages())
                .first(page.isFirst())
                .last(page.isLast())
                .build();
    }

    private Specification<Api> buildMarketplaceSpecification(String search, Long categoryId, String pricing) {
        Specification<Api> spec = (root, query, cb) -> cb.equal(root.get("deleted"), false);
        spec = spec.and((root, query, cb) -> cb.equal(root.get("status"), ApiStatus.APPROVED));
        if (StringUtils.hasText(search)) {
            String pattern = "%" + search.toLowerCase() + "%";
            spec = spec.and((root, query, cb) -> cb.or(
                    cb.like(cb.lower(root.get("name")), pattern),
                    cb.like(cb.lower(root.get("description")), pattern)
            ));
        }
        if (categoryId != null) {
            spec = spec.and((root, query, cb) -> cb.equal(root.get("categoryId"), categoryId));
        }
        return spec;
    }
}
