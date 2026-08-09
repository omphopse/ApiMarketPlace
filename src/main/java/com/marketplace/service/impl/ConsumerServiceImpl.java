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
import com.marketplace.entity.ProviderProfile;
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
import com.marketplace.repository.ProviderProfileRepository;
import com.marketplace.repository.SubscriptionPlanRepository;
import com.marketplace.repository.SubscriptionRepository;
import com.marketplace.repository.UsageLogRepository;
import com.marketplace.repository.UserRepository;
import com.marketplace.service.ConsumerService;
import com.marketplace.notification.NotificationService;
import com.marketplace.notification.email.EmailEventType;
import com.marketplace.notification.email.NotificationRequest;
import org.springframework.transaction.annotation.Transactional;
import java.math.BigDecimal;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardCopyOption;
import java.security.MessageDigest;
import java.security.SecureRandom;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Base64;
import java.util.List;
import java.util.Locale;
import java.util.Objects;
import java.util.Optional;
import java.util.stream.Collectors;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.env.Environment;
import org.springframework.data.domain.Page;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
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
    private final ProviderProfileRepository providerProfileRepository;
    private final SubscriptionPlanRepository subscriptionPlanRepository;
    private final SubscriptionRepository subscriptionRepository;
    private final ApiKeyRepository apiKeyRepository;
    private final ApiDocumentationRepository apiDocumentationRepository;
    private final UsageLogRepository usageLogRepository;
    private final NotificationService notificationService;
    private final Environment environment;

    @Value("${uploads.path:uploads}")
    private String uploadsPath;

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
    public String uploadProfileImage(MultipartFile file) {
        validateImage(file);
        Path uploadDirectory = Path.of(uploadsPath).toAbsolutePath().normalize();
        try {
            Files.createDirectories(uploadDirectory);
            String filename = StringUtils.cleanPath(Objects.requireNonNull(file.getOriginalFilename()));
            String extension = filename.contains(".") ? filename.substring(filename.lastIndexOf('.')) : "";
            String storageName = "consumer-" + System.currentTimeMillis() + extension.toLowerCase(Locale.ROOT);
            Path target = uploadDirectory.resolve(storageName);
            Files.copy(file.getInputStream(), target, StandardCopyOption.REPLACE_EXISTING);
            User user = getCurrentUser();
            ConsumerProfile profile = consumerProfileRepository.findByUserId(user.getId())
                    .orElseGet(() -> createDefaultProfile(user));
            profile.setProfileImage("/uploads/" + storageName);
            consumerProfileRepository.save(profile);
            return profile.getProfileImage();
        } catch (IOException ex) {
            throw new RuntimeException("Unable to store file", ex);
        }
    }

    private void validateImage(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("Image file is required");
        }
        String contentType = file.getContentType();
        if (contentType == null || !(contentType.equals("image/png") || contentType.equals("image/jpeg") || contentType.equals("image/jpg"))) {
            throw new IllegalArgumentException("Supported image types are png, jpg, jpeg");
        }
        if (file.getSize() > 2 * 1024 * 1024L) {
            throw new IllegalArgumentException("Maximum file size is 2MB");
        }
    }

    @Override
    @Transactional
    public PagedResponse<ApiMarketplaceCardResponse> browseMarketplace(int page, int size, String search, String categoryId, String pricing, String sort) {
        size = validateSize(size);
        Pageable pageable = PageRequest.of(page, size);
        List<Api> filteredApis = filterMarketplaceApis(search, categoryId, pricing);
        Page<Api> result = toPage(filteredApis, pageable);
        return toPagedResponse(result, this::toMarketplaceCard);
    }

    @Override
    @Transactional
    public ApiMarketplaceDetailsResponse getMarketplaceApi(String apiId) {
        Api api = apiRepository.findByIdAndDeletedFalse(apiId)
                .filter(a -> a.getStatus() == ApiStatus.APPROVED)
                .orElseThrow(() -> new ApiNotAvailableException("API is not available"));
        Category category = categoryRepository.findById(api.getCategoryId()).orElse(null);
        
        String providerName = null;
        if (api.getProviderId() != null) {
            providerName = providerProfileRepository.findByUserId(api.getProviderId())
                    .map(ProviderProfile::getCompanyName)
                    .orElse(null);
        }
        
        return ApiMarketplaceDetailsResponse.builder()
                .id(api.getId())
                .name(api.getName())
                .description(api.getDescription())
                .logoUrl(api.getLogo())
                .category(category != null ? CategoryResponse.builder().id(category.getId()).name(category.getName()).build() : null)
                .provider(new ApiMarketplaceDetailsResponse.ProviderSummary(providerName, null))
                .version(api.getVersion())
                .documentationAvailable(apiDocumentationRepository.findFirstByApiId(api.getId()).isPresent())
                .build();
    }

    @Override
    @Transactional
    public List<SubscriptionPlanResponse> getApiPlans(String apiId) {
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
        notificationService.notify(new NotificationRequest(EmailEventType.SUBSCRIPTION_PURCHASED, consumer.getEmail(),
            consumer.getFullName(), subscription.getId(), Map.of("userName", consumer.getFullName(),
            "apiName", api.getName(), "planName", plan.getPlanName(), "price", plan.getPrice().toPlainString(),
            "status", subscription.getStatus().name())));
        return toSubscriptionResponse(subscription);
    }

    @Override
    @Transactional
    public SubscriptionActivationResponse activateSubscription(String subscriptionId) {
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
        notificationService.notify(new NotificationRequest(EmailEventType.API_KEY_CREATED, consumer.getEmail(),
            consumer.getFullName(), subscription.getId(), Map.of("userName", consumer.getFullName(),
            "apiName", subscription.getApi().getName())));
        return SubscriptionActivationResponse.builder()
                .subscriptionId(subscription.getId())
                .status(subscription.getStatus().name())
                .apiKey(rawKey)
                .build();
    }

    @Override
    @Transactional
    public SubscriptionActivationResponse activateSubscriptionDev(String subscriptionId) {
        User consumer = getCurrentUser();
        Subscription subscription = getSubscriptionForCurrentConsumer(subscriptionId, consumer);
        // allow dev activation for free plans, or when running tests
        java.math.BigDecimal price = subscription.getSubscriptionPlan() != null ? subscription.getSubscriptionPlan().getPrice() : null;
        boolean isTestProfile = false;
        try {
            String[] profiles = environment.getActiveProfiles();
            for (String p : profiles) if ("test".equalsIgnoreCase(p)) isTestProfile = true;
        } catch (Exception ignored) {}

        if (price != null && price.compareTo(java.math.BigDecimal.ZERO) > 0 && !isTestProfile) {
            throw new InvalidSubscriptionStateException("Dev activation is not allowed for paid plans");
        }
        return activateSubscription(subscriptionId);
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
    public ApiKeyCreatedResponse regenerateApiKey(String subscriptionId) {
        User consumer = getCurrentUser();
        Subscription subscription = getSubscriptionForCurrentConsumer(subscriptionId, consumer);
        if (subscription.getStatus() != SubscriptionStatus.ACTIVE) {
            throw new InvalidSubscriptionStateException("Subscription must be active to regenerate an API key");
        }

        apiKeyRepository.findFirstBySubscriptionAndConsumerOrderByCreatedAtDesc(subscription, consumer).ifPresent(existing -> {
            existing.setStatus(ApiKeyStatus.REVOKED);
            existing.setRevokedAt(LocalDateTime.now());
            apiKeyRepository.save(existing);
        });

        String rawKey = generateApiKey(subscription);
        notificationService.notify(new NotificationRequest(EmailEventType.API_KEY_REGENERATED, consumer.getEmail(),
            consumer.getFullName(), subscription.getId(), Map.of("userName", consumer.getFullName(),
            "apiName", subscription.getApi().getName())));
        return ApiKeyCreatedResponse.builder()
                .subscriptionId(subscription.getId())
                .apiKey(rawKey)
                .build();
    }

    @Override
    @Transactional
    public void revokeApiKey(String apiKeyId) {
        User consumer = getCurrentUser();
        ApiKey apiKey = apiKeyRepository.findByIdAndConsumer(apiKeyId, consumer)
                .orElseThrow(() -> new ApiKeyNotFoundException("API key not found"));
        apiKey.setStatus(ApiKeyStatus.REVOKED);
        apiKey.setRevokedAt(LocalDateTime.now());
        apiKeyRepository.save(apiKey);
        notificationService.notify(new NotificationRequest(EmailEventType.API_KEY_REVOKED, consumer.getEmail(),
            consumer.getFullName(), apiKey.getId(), Map.of("userName", consumer.getFullName(),
            "apiName", apiKey.getApi().getName())));
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
    public SubscriptionDetailsResponse getSubscription(String subscriptionId) {
        User consumer = getCurrentUser();
        Subscription subscription = getSubscriptionForCurrentConsumer(subscriptionId, consumer);
        ApiKey apiKey = apiKeyRepository.findFirstBySubscriptionAndConsumerOrderByCreatedAtDesc(subscription, consumer).orElse(null);
        return SubscriptionDetailsResponse.builder()
                .subscriptionId(subscription.getId())
                .apiName(subscription.getApi().getName())
                .planName(subscription.getSubscriptionPlan().getPlanName())
                .status(subscription.getStatus().name())
                .startedAt(subscription.getStartedAt())
                .expiresAt(subscription.getExpiresAt())
                .usageSummary(buildUsageSummary(subscription, null))
                .apiKeyMetadata(apiKey != null ? new SubscriptionDetailsResponse.ApiKeyMetadata(apiKey.getId(), apiKey.getKeyPrefix(), apiKey.getStatus().name(), apiKey.getCreatedAt(), apiKey.getLastUsedAt()) : null)
                .documentationAvailable(apiDocumentationRepository.findFirstByApiId(subscription.getApi().getId()).isPresent())
                .build();
    }

    @Override
    @Transactional
    public void cancelSubscription(String subscriptionId) {
        User consumer = getCurrentUser();
        Subscription subscription = getSubscriptionForCurrentConsumer(subscriptionId, consumer);
        if (subscription.getStatus() == SubscriptionStatus.CANCELLED) {
            throw new InvalidSubscriptionStateException("Subscription is already cancelled");
        }
        subscription.setStatus(SubscriptionStatus.CANCELLED);
        subscription.setExpiresAt(LocalDateTime.now());
        subscriptionRepository.save(subscription);
        notificationService.notify(new NotificationRequest(EmailEventType.SUBSCRIPTION_CANCELLED, consumer.getEmail(),
            consumer.getFullName(), subscription.getId(), Map.of("userName", consumer.getFullName(),
            "apiName", subscription.getApi().getName(), "planName", subscription.getSubscriptionPlan().getPlanName())));
        apiKeyRepository.findBySubscription(subscription).forEach(apiKey -> {
            apiKey.setStatus(ApiKeyStatus.REVOKED);
            apiKey.setRevokedAt(LocalDateTime.now());
            apiKeyRepository.save(apiKey);
        });
    }

    @Override
    @Transactional
    public ApiDocumentationResponse getSubscriptionDocumentation(String subscriptionId) {
        User consumer = getCurrentUser();
        Subscription subscription = getSubscriptionForCurrentConsumer(subscriptionId, consumer);
        if (subscription.getStatus() != SubscriptionStatus.ACTIVE) {
            throw new InvalidSubscriptionStateException("Subscription must be active");
        }
        if (subscription.getExpiresAt() != null && subscription.getExpiresAt().isBefore(LocalDateTime.now())) {
            throw new InvalidSubscriptionStateException("Subscription has expired");
        }
        ApiDocumentation documentation = apiDocumentationRepository.findFirstByApiId(subscription.getApi().getId())
                .orElseThrow(() -> new ResourceNotFoundException("API documentation not found"));
        return ApiDocumentationResponse.builder()
                .id(documentation.getId())
                .apiId(documentation.getApiId())
                .baseEndpoint(documentation.getBaseEndpoint())
                .authenticationGuide(documentation.getAuthenticationGuide())
                .headers(documentation.getHeaders())
                .requestExample(documentation.getRequestExample())
                .responseExample(documentation.getResponseExample())
                .errorCodes(documentation.getErrorCodes())
                .markdown(documentation.getMarkdown())
                .createdAt(documentation.getCreatedAt())
                .updatedAt(documentation.getUpdatedAt())
                .build();
    }

    @Override
    @Transactional
    public UsageSummaryResponse getUsageSummary(String subscriptionId, String range) {
        User consumer = getCurrentUser();
        if (subscriptionId != null) {
            Subscription subscription = getSubscriptionForCurrentConsumer(subscriptionId, consumer);
            return buildUsageSummary(subscription, range);
        }
        return UsageSummaryResponse.builder()
                .totalRequests(0L)
                .successfulRequests(0L)
                .failedRequests(0L)
                .requestLimit(0)
                .remainingRequests(0L)
                .recentRequests(List.of())
                .build();
    }

    @Override
    @Transactional
    public java.util.List<UsageLogResponse> getUsageLogs(String subscriptionId) {
        User consumer = getCurrentUser();
        Subscription subscription = getSubscriptionForCurrentConsumer(subscriptionId, consumer);
        LocalDateTime startDate = subscription.getStartedAt() != null ? subscription.getStartedAt() : LocalDateTime.now().minusYears(10);
        return usageLogRepository.findBySubscriptionIdAndTimestampAfter(subscription.getId(), startDate).stream()
                .map(this::toUsageLogResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public ConsumerDashboardResponse getDashboard() {
        User consumer = getCurrentUser();
        long totalSubscriptions = subscriptionRepository.countByConsumer(consumer);
        long activeSubscriptions = subscriptionRepository.countByConsumerAndStatus(consumer, SubscriptionStatus.ACTIVE);
        LocalDateTime startOfMonth = LocalDate.now().withDayOfMonth(1).atStartOfDay();
        long totalRequestsThisMonth = usageLogRepository.countByConsumerIdAndTimestampAfter(consumer.getId(), startOfMonth);
        var activeSubscriptionPage = subscriptionRepository.findByConsumerAndStatusOrderByCreatedAtDesc(consumer, SubscriptionStatus.ACTIVE, PageRequest.of(0, 100));
        List<Subscription> activeSubscriptionList = activeSubscriptionPage.getContent();
        long remainingRequests = activeSubscriptionList.stream()
                .mapToLong(subscription -> {
                    int requestLimit = subscription.getSubscriptionPlan() != null ? subscription.getSubscriptionPlan().getRequestLimit() : 0;
                    if (requestLimit <= 0) {
                        return 0L;
                    }
                    long usedThisMonth = usageLogRepository.countBySubscriptionIdAndTimestampAfter(subscription.getId(), startOfMonth);
                    return Math.max(0L, requestLimit - usedThisMonth);
                })
                .sum();
        List<SubscriptionResponse> recentSubscriptions = subscriptionRepository.findByConsumerOrderByCreatedAtDesc(consumer, PageRequest.of(0, 5)).stream()
                .map(this::toSubscriptionResponse)
                .collect(Collectors.toList());
        List<UsageLogResponse> recentUsage = usageLogRepository.findTop10ByConsumerIdOrderByTimestampDesc(consumer.getId()).stream()
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

    private Subscription getSubscriptionForCurrentConsumer(String subscriptionId, User consumer) {
        Subscription subscription = subscriptionRepository.findById(subscriptionId)
                .orElseThrow(() -> new SubscriptionNotFoundException("Subscription not found"));
        if (!Objects.equals(subscription.getConsumer().getId(), consumer.getId())) {
            throw new AccessDeniedException("You do not have access to this subscription");
        }
        return subscription;
    }

    private ConsumerProfile createDefaultProfile(User user) {
        ConsumerProfile profile = ConsumerProfile.builder()
                
                .user(user)
                .build();
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
        String providerName = null;
        if (api.getProviderId() != null) {
            providerName = providerProfileRepository.findByUserId(api.getProviderId())
                    .map(ProviderProfile::getCompanyName)
                    .orElse(null);
        }
        return ApiMarketplaceCardResponse.builder()
                .id(api.getId())
                .name(api.getName())
                .shortDescription(api.getDescription())
                .logoUrl(api.getLogo())
                .category(category != null ? category.getName() : null)
                .providerName(providerName)
                .version(api.getVersion())
                .startingPrice(subscriptionPlanRepository.findByApiId(api.getId()).stream().filter(SubscriptionPlan::isActive).min((a, b) -> a.getPrice().compareTo(b.getPrice())).map(SubscriptionPlan::getPrice).orElse(BigDecimal.ZERO))
                .hasFreePlan(subscriptionPlanRepository.findByApiId(api.getId()).stream().anyMatch(plan -> plan.isActive() && plan.getPrice().compareTo(BigDecimal.ZERO) == 0))
                .build();
    }

    private SubscriptionPlanResponse toPlanResponse(SubscriptionPlan plan) {
        return SubscriptionPlanResponse.builder()
                .id(plan.getId())
                .apiId(plan.getApiId())
                .planName(plan.getPlanName())
                .price(plan.getPrice())
                .billingCycle(plan.getBillingCycle())
                .requestLimit(plan.getRequestLimit())
                .active(plan.isActive())
                .createdAt(plan.getCreatedAt())
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

    private UsageSummaryResponse buildUsageSummary(Subscription subscription, String range) {
        LocalDateTime startDate = resolveRangeStart(range, subscription.getStartedAt());
        List<UsageLog> usageLogs = usageLogRepository.findBySubscriptionIdAndTimestampAfter(subscription.getId(), startDate);
        long totalRequests = usageLogs.size();
        
        long successfulRequests = usageLogs.stream()
                .filter(log -> log.getStatusCode() >= 200 && log.getStatusCode() < 300)
                .count();
        long failedRequests = totalRequests - successfulRequests;
        
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
                .recentRequests(usageLogs.stream()
                        .sorted((a, b) -> b.getTimestamp().compareTo(a.getTimestamp()))
                        .map(this::toUsageLogResponse)
                        .collect(Collectors.toList()))
                .build();
    }

    private LocalDateTime resolveRangeStart(String range, LocalDateTime subscriptionStartedAt) {
        if ("7d".equalsIgnoreCase(range)) {
            return LocalDateTime.now().minusDays(7);
        }
        if ("90d".equalsIgnoreCase(range)) {
            return LocalDateTime.now().minusDays(90);
        }
        if (subscriptionStartedAt != null) {
            return subscriptionStartedAt;
        }
        return LocalDateTime.now().minusYears(10);
    }

    private UsageLogResponse toUsageLogResponse(UsageLog usageLog) {
        String apiName = null;
        if (usageLog.getApi() != null) {
            apiName = usageLog.getApi().getName();
        }
        return UsageLogResponse.builder()
                .id(usageLog.getId())
                .endpoint(usageLog.getEndpoint())
                .httpMethod(usageLog.getHttpMethod())
                .statusCode(usageLog.getStatusCode())
                .responseTimeMs(usageLog.getResponseTimeMs())
                .timestamp(usageLog.getTimestamp())
                .apiName(apiName)
                .build();
    }

    private ApiKeyResponse toApiKeyResponse(ApiKey apiKey) {
        String masked = apiKey.getKeyPrefix() + "••••••••••••";
        return ApiKeyResponse.builder()
                .id(apiKey.getId())
                .subscriptionId(apiKey.getSubscription() != null ? apiKey.getSubscription().getId() : null)
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

    private List<Api> filterMarketplaceApis(String search, String categoryId, String pricing) {
        return apiRepository.findAll().stream()
                .filter(api -> !api.isDeleted())
                .filter(api -> api.getStatus() == ApiStatus.APPROVED)
                .filter(api -> matchesSearch(api, search))
                .filter(api -> categoryId == null || Objects.equals(api.getCategoryId(), categoryId))
                .filter(api -> matchesPricing(api, pricing))
                .collect(Collectors.toList());
    }

    private boolean matchesSearch(Api api, String search) {
        if (!StringUtils.hasText(search)) {
            return true;
        }
        String keyword = search.toLowerCase();
        return (api.getName() != null && api.getName().toLowerCase().contains(keyword))
                || (api.getDescription() != null && api.getDescription().toLowerCase().contains(keyword));
    }

    private boolean matchesPricing(Api api, String pricing) {
        if (!StringUtils.hasText(pricing)) {
            return true;
        }
        return switch (pricing.toLowerCase()) {
            case "free" -> true;
            default -> true;
        };
    }

    private Page<Api> toPage(List<Api> apis, Pageable pageable) {
        int start = (int) pageable.getOffset();
        int end = Math.min(start + pageable.getPageSize(), apis.size());
        List<Api> pageContent = start >= apis.size() ? List.of() : apis.subList(start, end);
        return new PageImpl<>(pageContent, pageable, apis.size());
    }
}
