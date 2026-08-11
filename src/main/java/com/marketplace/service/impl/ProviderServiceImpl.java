package com.marketplace.service.impl;

import com.marketplace.constants.AppConstants;
import com.marketplace.dto.ApiDetailsDto;
import com.marketplace.dto.ApiDocumentationDto;
import com.marketplace.dto.ApiRequestDto;
import com.marketplace.dto.ApiSummaryDto;
import com.marketplace.dto.CategoryDto;
import com.marketplace.dto.DashboardDto;
import com.marketplace.dto.ProviderProfileDto;
import com.marketplace.dto.SubscriptionPlanDto;
import com.marketplace.entity.Api;
import com.marketplace.entity.ApiDocumentation;
import com.marketplace.entity.ApiStatus;
import com.marketplace.entity.BillingCycle;
import com.marketplace.entity.Category;
import com.marketplace.entity.ProviderProfile;
import com.marketplace.entity.Subscription;
import com.marketplace.entity.SubscriptionPlan;
import com.marketplace.entity.SubscriptionStatus;
import com.marketplace.entity.User;
import com.marketplace.exception.ResourceNotFoundException;
import com.marketplace.mapper.ApiDocumentationMapper;
import com.marketplace.mapper.ApiMapper;
import com.marketplace.mapper.ProviderMapper;
import com.marketplace.mapper.SubscriptionPlanMapper;
import com.marketplace.dto.ProviderSubscriberResponse;
import com.marketplace.dto.PagedResponse;
import com.marketplace.repository.ApiDocumentationRepository;
import com.marketplace.repository.ApiRepository;
import com.marketplace.repository.CategoryRepository;
import com.marketplace.repository.ProviderProfileRepository;
import com.marketplace.repository.SubscriptionPlanRepository;
import com.marketplace.repository.SubscriptionRepository;
import com.marketplace.repository.UsageLogRepository;
import com.marketplace.repository.UserRepository;
import com.marketplace.service.ProviderService;
import com.marketplace.notification.NotificationService;
import com.marketplace.notification.email.EmailEventType;
import com.marketplace.notification.email.NotificationRequest;
import java.io.IOException;
import org.springframework.transaction.annotation.Transactional;
import java.math.BigDecimal;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardCopyOption;
import java.time.LocalDateTime;
import java.util.Collections;
import java.util.Comparator;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Objects;
import java.util.stream.Collectors;
import java.util.stream.Stream;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

@Service
@RequiredArgsConstructor
public class ProviderServiceImpl implements ProviderService {
    private final ProviderProfileRepository providerProfileRepository;
    private final ApiRepository apiRepository;
    private final CategoryRepository categoryRepository;
    private final SubscriptionPlanRepository subscriptionPlanRepository;
    private final ApiDocumentationRepository apiDocumentationRepository;
    private final SubscriptionRepository subscriptionRepository;
    private final UsageLogRepository usageLogRepository;
    private final UserRepository userRepository;
    private final ProviderMapper providerMapper;
    private final SubscriptionPlanMapper subscriptionPlanMapper;
    private final ApiDocumentationMapper apiDocumentationMapper;
    private final ApiMapper apiMapper;
    private final NotificationService notificationService;

    @Value("${uploads.path:uploads}")
    private String uploadsPath;

    @Override
    @Transactional
    public ProviderProfileDto getProfile(String userId) {
        ProviderProfile profile = providerProfileRepository.findByUserId(userId)
                .orElseGet(() -> createDefaultProfile(userId));
        return providerProfileToDto(profile);
    }

    @Override
    @Transactional
    public ProviderProfileDto saveProfile(String userId, ProviderProfileDto dto) {
        ProviderProfile profile = providerProfileRepository.findByUserId(userId)
                .map(existing -> {
                    existing.setCompanyName(dto.getCompanyName());
                    existing.setWebsite(dto.getWebsite());
                    existing.setDescription(dto.getDescription());
                    existing.setSupportEmail(dto.getSupportEmail());
                    existing.setContactNumber(dto.getContactNumber());
                    existing.setCountry(dto.getCountry());
                    existing.setLogo(dto.getLogo());
                    return existing;
                })
                .orElseGet(() -> ProviderProfile.builder()
                        .userId(userId)
                        .companyName(dto.getCompanyName())
                        .website(dto.getWebsite())
                        .description(dto.getDescription())
                        .supportEmail(dto.getSupportEmail())
                        .contactNumber(dto.getContactNumber())
                        .country(dto.getCountry())
                        .logo(dto.getLogo())
                        .build());

        providerProfileRepository.save(profile);
        return providerProfileToDto(profile);
    }

    private ProviderProfileDto providerProfileToDto(ProviderProfile profile) {
        if (profile == null) return null;
        return ProviderProfileDto.builder()
                .id(profile.getId())
                .userId(profile.getUserId())
                .companyName(profile.getCompanyName())
                .website(profile.getWebsite())
                .description(profile.getDescription())
                .supportEmail(profile.getSupportEmail())
                .contactNumber(profile.getContactNumber())
                .country(profile.getCountry())
                .logo(profile.getLogo())
                .build();
    }

    private ProviderProfile createDefaultProfile(String userId) {
        ProviderProfile profile = ProviderProfile.builder()
                .userId(userId)
                .companyName("")
                .website("")
                .description("")
                .supportEmail("")
                .contactNumber("")
                .country("")
                .logo("")
                .build();
        return providerProfileRepository.save(profile);
    }

    @Override
    @Transactional
    public DashboardDto getDashboard(String userId) {
        long totalApis = apiRepository.countByProviderIdAndDeletedFalse(userId);
        long approvedApis = apiRepository.countByProviderIdAndStatusAndDeletedFalse(userId, ApiStatus.APPROVED);
        long pendingApis = apiRepository.countByProviderIdAndStatusAndDeletedFalse(userId, ApiStatus.PENDING);
        long rejectedApis = apiRepository.countByProviderIdAndStatusAndDeletedFalse(userId, ApiStatus.REJECTED);
        long archivedApis = apiRepository.countByProviderIdAndStatusAndDeletedFalse(userId, ApiStatus.ARCHIVED);

        List<ApiSummaryDto> recentApis = apiRepository.findTop5ByProviderIdAndDeletedFalseOrderByCreatedAtDesc(userId).stream()
            .map(this::apiToSummaryDto)
            .collect(Collectors.toList());

        // Calculate total subscribers from all active subscriptions for this provider's APIs
        List<Api> providerApis = apiRepository.findByProviderIdAndDeletedFalseOrderByCreatedAtDesc(userId);
        long totalSubscribers = 0;
        BigDecimal monthlyRevenue = BigDecimal.ZERO;
        
        for (Api api : providerApis) {
            // Count active subscriptions
            List<Subscription> apiSubscriptions = subscriptionRepository.findByApi_IdAndStatus(api.getId(), SubscriptionStatus.ACTIVE);
            totalSubscribers += apiSubscriptions.size();
            
            // Sum revenue from subscriptions created in the last month
            LocalDateTime oneMonthAgo = LocalDateTime.now().minusMonths(1);
            for (Subscription sub : apiSubscriptions) {
                if (sub.getCreatedAt().isAfter(oneMonthAgo)) {
                    if (sub.getPrice() != null) {
                        monthlyRevenue = monthlyRevenue.add(sub.getPrice());
                    }
                }
            }
        }

        return DashboardDto.builder()
                .totalApis(totalApis)
                .approvedApis(approvedApis)
                .pendingApis(pendingApis)
                .rejectedApis(rejectedApis)
                .archivedApis(archivedApis)
                .monthlyRevenue(monthlyRevenue.intValue())
                .totalSubscribers(totalSubscribers)
                .recentApis(recentApis)
                .build();
    }

    @Override
    @Transactional
    public List<ApiSummaryDto> getApis(String userId, String search, String status, String category, String sort) {
        List<Api> providerApis = apiRepository.findByProviderIdAndDeletedFalseOrderByCreatedAtDesc(userId);

        Stream<Api> stream = providerApis.stream();

        if (search != null && !search.isBlank()) {
            String normalizedSearch = search.trim().toLowerCase();
            stream = stream.filter(api -> {
                return Stream.of(api.getName(), api.getDescription(), api.getShortDescription(), api.getFullDescription())
                        .filter(Objects::nonNull)
                        .map(String::toLowerCase)
                        .anyMatch(value -> value.contains(normalizedSearch));
            });
        }

        if (status != null && !status.equalsIgnoreCase("ALL") && !status.isBlank()) {
            try {
                ApiStatus apiStatus = ApiStatus.valueOf(status);
                stream = stream.filter(api -> api.getStatus() == apiStatus);
            } catch (IllegalArgumentException ignored) {
                // ignore invalid status values and keep the list unchanged
            }
        }

        if (category != null && !category.isBlank()) {
            String normalizedCategory = category.trim().toLowerCase();
            stream = stream.filter(api -> {
                return Stream.of(api.getCategoryId(), api.getCategoryId() == null ? null : api.getCategoryId())
                        .filter(Objects::nonNull)
                        .map(String::toLowerCase)
                        .anyMatch(value -> value.equals(normalizedCategory));
            });
        }

        if (sort != null && !sort.isBlank()) {
            switch (sort) {
                case "OLDEST":
                    stream = stream.sorted(Comparator.comparing(Api::getCreatedAt, Comparator.nullsLast(Comparator.naturalOrder())));
                    break;
                case "NAME_ASC":
                    stream = stream.sorted(Comparator.comparing(Api::getName, Comparator.nullsLast(String::compareToIgnoreCase)));
                    break;
                case "NAME_DESC":
                    stream = stream.sorted(Comparator.comparing(Api::getName, Comparator.nullsLast(String::compareToIgnoreCase)).reversed());
                    break;
                case "MOST_REQUESTS":
                    stream = stream.sorted(Comparator.comparingLong((Api api) -> countApiRequests(api.getId())).reversed());
                    break;
                case "MOST_SUBSCRIBERS":
                    stream = stream.sorted(Comparator.comparingLong((Api api) -> countActiveSubscriptions(api.getId())).reversed());
                    break;
                case "NEWEST":
                default:
                    stream = stream.sorted(Comparator.comparing(Api::getCreatedAt, Comparator.nullsLast(Comparator.reverseOrder())));
                    break;
            }
        }

        return stream.map(this::apiToSummaryDto).collect(Collectors.toList());
    }

    @Override
    @Transactional
    public PagedResponse<ProviderSubscriberResponse> getSubscribers(String userId, String apiId, int page, int size) {
        Api api = findApiForProvider(userId, apiId);
        size = Math.max(1, Math.min(size, 50));
        page = Math.max(0, page);
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        Page<Subscription> result = subscriptionRepository.findByApi_Id(api.getId(), pageable);
        return toPagedResponse(result, this::toProviderSubscriberResponse);
    }

    private ProviderSubscriberResponse toProviderSubscriberResponse(Subscription subscription) {
        if (subscription == null) return null;
        return ProviderSubscriberResponse.builder()
                .subscriptionId(subscription.getId())
                .consumerId(subscription.getConsumer() != null ? subscription.getConsumer().getId() : null)
                .consumerName(subscription.getConsumer() != null ? subscription.getConsumer().getFullName() : null)
                .consumerEmail(subscription.getConsumer() != null ? subscription.getConsumer().getEmail() : null)
                .status(subscription.getStatus() != null ? subscription.getStatus().name() : null)
                .createdAt(subscription.getCreatedAt())
                .expiresAt(subscription.getExpiresAt())
                .price(subscription.getPrice())
                .plan(ProviderSubscriberResponse.PlanSummary.builder()
                        .id(subscription.getSubscriptionPlan() != null ? subscription.getSubscriptionPlan().getId() : null)
                        .name(subscription.getSubscriptionPlan() != null ? subscription.getSubscriptionPlan().getPlanName() : null)
                        .billingCycle(subscription.getSubscriptionPlan() != null && subscription.getSubscriptionPlan().getBillingCycle() != null ? subscription.getSubscriptionPlan().getBillingCycle().name() : null)
                        .requestLimit(subscription.getSubscriptionPlan() != null ? subscription.getSubscriptionPlan().getRequestLimit() : null)
                        .price(subscription.getSubscriptionPlan() != null ? subscription.getSubscriptionPlan().getPrice() : null)
                        .build())
                .build();
    }

    private <T, E> PagedResponse<T> toPagedResponse(Page<E> page, java.util.function.Function<E, T> mapper) {
        return PagedResponse.<T>builder()
                .content(page.stream().map(mapper).collect(Collectors.toList()))
                .page(page.getNumber())
                .size(page.getSize())
                .totalElements(page.getTotalElements())
                .totalPages(page.getTotalPages())
                .first(page.isFirst())
                .last(page.isLast())
                .build();
    }

    private ApiSummaryDto apiToSummaryDto(Api api) {
        if (api == null) return null;
        String categoryName = null;
        if (api.getCategoryId() != null) {
            categoryName = categoryRepository.findById(api.getCategoryId()).map(Category::getName).orElse(null);
        }
        return ApiSummaryDto.builder()
                .id(api.getId())
                .name(api.getName())
                .description(api.getDescription())
                .shortDescription(api.getShortDescription())
                .categoryName(categoryName)
                .category(categoryName)
                .logo(api.getLogo())
                .version(api.getVersion())
                .status(api.getStatus() != null ? api.getStatus().name() : null)
                .rateLimit(api.getRateLimit())
                .authenticationType(api.getAuthenticationType())
                .supportUrl(api.getSupportUrl())
                .timeout(api.getTimeout())
                .tags(api.getTags())
                .subscribers(countActiveSubscriptions(api.getId()))
                .requests(countApiRequests(api.getId()))
                .revenue(sumActiveSubscriptionRevenue(api.getId()))
                .lastUpdated(api.getUpdatedAt())
                .build();
    }

    @Override
    @Transactional
    public ApiDetailsDto getApi(String userId, String apiId) {
        Api api = findApiForProvider(userId, apiId);
        ApiDetailsDto details = apiToDetailsDto(api);
        return details;
    }

    private long countActiveSubscriptions(String apiId) {
        return subscriptionRepository.countByApi_IdAndStatus(apiId, SubscriptionStatus.ACTIVE);
    }

    private long countApiRequests(String apiId) {
        return usageLogRepository.countByApi_Id(apiId);
    }

    private java.math.BigDecimal sumActiveSubscriptionRevenue(String apiId) {
        return subscriptionRepository.findByApi_IdAndStatus(apiId, SubscriptionStatus.ACTIVE).stream()
                .map(Subscription::getPrice)
                .filter(Objects::nonNull)
                .reduce(java.math.BigDecimal.ZERO, java.math.BigDecimal::add);
    }

        private ApiDetailsDto apiToDetailsDto(Api api) {
        if (api == null) return null;
        List<SubscriptionPlanDto> plans = subscriptionPlanRepository.findByApiId(api.getId()).stream()
            .sorted(Comparator.comparing(SubscriptionPlan::getId))
            .map(subscriptionPlanMapper::toDto)
            .collect(Collectors.toList());

        ApiDocumentationDto documentation = apiDocumentationRepository.findFirstByApiId(api.getId())
            .map(apiDocumentationMapper::toDto)
            .orElse(null);

        String categoryName = null;
        if (api.getCategoryId() != null) {
            categoryName = categoryRepository.findById(api.getCategoryId()).map(Category::getName).orElse(null);
        }

        return ApiDetailsDto.builder()
            .id(api.getId())
            .providerId(api.getProviderId())
            .name(api.getName())
            .description(api.getDescription())
            .shortDescription(api.getShortDescription())
            .fullDescription(api.getFullDescription())
            .baseUrl(api.getBaseUrl())
            .categoryId(api.getCategoryId())
            .categoryName(categoryName)
            .category(categoryName)
            .logo(api.getLogo())
            .version(api.getVersion())
            .authenticationType(api.getAuthenticationType())
            .rateLimit(api.getRateLimit())
            .supportUrl(api.getSupportUrl())
            .timeout(api.getTimeout())
            .tags(api.getTags())
            .status(api.getStatus() != null ? api.getStatus().name() : null)
            .subscribers(countActiveSubscriptions(api.getId()))
            .requests(countApiRequests(api.getId()))
            .revenue(sumActiveSubscriptionRevenue(api.getId()))
            .plans(plans)
            .documentation(documentation)
            .build();
        }

    @Override
    @Transactional
    public ApiDetailsDto createApi(String userId, ApiRequestDto request) {
        validateCategory(request.getCategoryId());
        validateUrl(request.getBaseUrl());
        Api api = Api.builder()
                .providerId(userId)
                .name(request.getName())
                .description(request.getDescription())
                .shortDescription(request.getShortDescription())
                .fullDescription(request.getFullDescription())
                .baseUrl(request.getBaseUrl())
                .categoryId(request.getCategoryId())
                .logo(request.getLogo())
                .version(request.getVersion())
                .authenticationType(request.getAuthenticationType())
                .rateLimit(request.getRateLimit())
                .supportUrl(request.getSupportUrl())
                .timeout(request.getTimeout())
                .tags(request.getTags())
                .status(ApiStatus.DRAFT)
                .deleted(false)
                .build();
        apiRepository.save(api);

        savePlans(api, request.getPlans());
        saveDocumentation(api, request.getDocumentation());

        return getApi(userId, api.getId());
    }

    @Override
    @Transactional
    public ApiDetailsDto updateApi(String userId, String apiId, ApiRequestDto request) {
        Api api = findApiForProvider(userId, apiId);
        validateCategory(request.getCategoryId());
        validateUrl(request.getBaseUrl());

        api.setName(request.getName());
        api.setDescription(request.getDescription());
        api.setShortDescription(request.getShortDescription());
        api.setFullDescription(request.getFullDescription());
        api.setBaseUrl(request.getBaseUrl());
        api.setCategoryId(request.getCategoryId());
        api.setLogo(request.getLogo());
        api.setVersion(request.getVersion());
        api.setAuthenticationType(request.getAuthenticationType());
        api.setRateLimit(request.getRateLimit());
        api.setSupportUrl(request.getSupportUrl());
        api.setTimeout(request.getTimeout());
        api.setTags(request.getTags());
        apiRepository.save(api);

        savePlans(api, request.getPlans());
        saveDocumentation(api, request.getDocumentation());

        return getApi(userId, apiId);
    }

    @Override
    @Transactional
    public void deleteApi(String userId, String apiId) {
        Api api = findApiForProvider(userId, apiId);
        api.setDeleted(true);
        apiRepository.save(api);
    }

    @Override
    @Transactional
    public ApiDetailsDto submitApi(String userId, String apiId) {
        Api api = findApiForProvider(userId, apiId);
        api.setStatus(ApiStatus.PENDING);
        apiRepository.save(api);
        userRepository.findById(userId).ifPresent(provider -> notificationService.notify(new NotificationRequest(
            EmailEventType.API_SUBMITTED, provider.getEmail(), provider.getFullName(), api.getId(),
            Map.of("userName", provider.getFullName(), "apiName", api.getName(), "status", api.getStatus().name()))));
        return getApi(userId, apiId);
    }

    @Override
    @Transactional
    public ApiDetailsDto archiveApi(String userId, String apiId) {
        Api api = findApiForProvider(userId, apiId);
        api.setStatus(ApiStatus.ARCHIVED);
        apiRepository.save(api);
        return getApi(userId, apiId);
    }

    @Override
    @Transactional
    public SubscriptionPlanDto createPlan(String userId, String apiId, SubscriptionPlanDto planDto) {
        Api api = findApiForProvider(userId, apiId);
        SubscriptionPlan plan = subscriptionPlanMapper.toEntity(planDto);
        plan.setApiId(api.getId());
        plan.setActive(true);
        plan.setPrice(planDto.getPrice() == null ? BigDecimal.ZERO : planDto.getPrice());
        SubscriptionPlan saved = subscriptionPlanRepository.save(plan);
        return subscriptionPlanRepository.findById(saved.getId())
                .map(subscriptionPlanMapper::toDto)
                .orElseThrow(() -> new RuntimeException("Failed to save subscription plan"));
    }

    @Override
    @Transactional
    public SubscriptionPlanDto updatePlan(String userId, String planId, SubscriptionPlanDto planDto) {
        SubscriptionPlan plan = subscriptionPlanRepository.findById(planId)
                .orElseThrow(() -> new ResourceNotFoundException("Subscription plan not found"));
        Api api = findApiForProvider(userId, plan.getApiId());

        plan.setPlanName(planDto.getPlanName());
        plan.setPrice(planDto.getPrice() == null ? BigDecimal.ZERO : planDto.getPrice());
        plan.setBillingCycle(planDto.getBillingCycle());
        plan.setRequestLimit(planDto.getRequestLimit());
        plan.setActive(planDto.isActive());
        subscriptionPlanRepository.save(plan);
        return subscriptionPlanMapper.toDto(plan);
    }

    @Override
    @Transactional
    public void deletePlan(String userId, String planId) {
        SubscriptionPlan plan = subscriptionPlanRepository.findById(planId)
                .orElseThrow(() -> new ResourceNotFoundException("Subscription plan not found"));
        findApiForProvider(userId, plan.getApiId());
        subscriptionPlanRepository.delete(plan);
    }

    @Override
    @Transactional
    public List<SubscriptionPlanDto> getPlans(String userId, String apiId) {
        findApiForProvider(userId, apiId);
        return subscriptionPlanRepository.findByApiId(apiId).stream()
                .map(subscriptionPlanMapper::toDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public ApiDocumentationDto createDocumentation(String userId, String apiId, ApiDocumentationDto documentationDto) {
        findApiForProvider(userId, apiId);
        ApiDocumentation documentation = apiDocumentationRepository.findFirstByApiId(apiId)
            .orElseGet(ApiDocumentation::new);
        documentation.setAuthenticationGuide(documentationDto.getAuthenticationGuide());
        documentation.setBaseEndpoint(documentationDto.getBaseEndpoint());
        documentation.setHeaders(documentationDto.getHeaders());
        documentation.setRequestExample(documentationDto.getRequestExample());
        documentation.setResponseExample(documentationDto.getResponseExample());
        documentation.setErrorCodes(documentationDto.getErrorCodes());
        documentation.setMarkdown(documentationDto.getMarkdown());
        documentation.setApiId(apiId);
        ApiDocumentation saved = apiDocumentationRepository.save(documentation);
        return apiDocumentationRepository.findById(saved.getId())
                .map(apiDocumentationMapper::toDto)
                .orElseThrow(() -> new RuntimeException("Failed to save API documentation"));
    }

    @Override
    @Transactional
    public ApiDocumentationDto updateDocumentation(String userId, String apiId, ApiDocumentationDto documentationDto) {
        findApiForProvider(userId, apiId);
        ApiDocumentation documentation = apiDocumentationRepository.findFirstByApiId(apiId)
                .orElseThrow(() -> new ResourceNotFoundException("API documentation not found"));

        documentation.setAuthenticationGuide(documentationDto.getAuthenticationGuide());
        documentation.setBaseEndpoint(documentationDto.getBaseEndpoint());
        documentation.setHeaders(documentationDto.getHeaders());
        documentation.setRequestExample(documentationDto.getRequestExample());
        documentation.setResponseExample(documentationDto.getResponseExample());
        documentation.setErrorCodes(documentationDto.getErrorCodes());
        documentation.setMarkdown(documentationDto.getMarkdown());
        apiDocumentationRepository.save(documentation);
        return apiDocumentationMapper.toDto(documentation);
    }

    @Override
    @Transactional
    public ApiDocumentationDto getDocumentation(String userId, String apiId) {
        findApiForProvider(userId, apiId);
        return apiDocumentationRepository.findFirstByApiId(apiId)
                .map(apiDocumentationMapper::toDto)
                .orElseThrow(() -> new ResourceNotFoundException("API documentation not found"));
    }

    @Override
    @Transactional
    public List<CategoryDto> getCategories() {
        return categoryRepository.findByActiveTrueOrderByNameAsc().stream()
                .map(category -> CategoryDto.builder()
                        .id(category.getId())
                        .name(category.getName())
                        .description(category.getDescription())
                        .icon(category.getIcon())
                        .build())
                .collect(Collectors.toList());
    }

    @Override
    public String uploadImage(MultipartFile file) {
        validateImage(file);
        Path uploadDirectory = Path.of(uploadsPath).toAbsolutePath().normalize();
        try {
            Files.createDirectories(uploadDirectory);
            String filename = StringUtils.cleanPath(Objects.requireNonNull(file.getOriginalFilename()));
            String extension = filename.contains(".") ? filename.substring(filename.lastIndexOf('.')) : "";
            String storageName = "provider-" + System.currentTimeMillis() + extension.toLowerCase(Locale.ROOT);
            Path target = uploadDirectory.resolve(storageName);
            Files.copy(file.getInputStream(), target, StandardCopyOption.REPLACE_EXISTING);
            return "/uploads/" + storageName;
        } catch (IOException ex) {
            throw new RuntimeException("Unable to store file", ex);
        }
    }

    private Api findApiForProvider(String userId, String apiId) {
        return apiRepository.findByIdAndProviderIdAndDeletedFalse(apiId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("API not found for provider"));
    }

    private void savePlans(Api api, List<SubscriptionPlanDto> plans) {
        if (plans == null) {
            return;
        }
        List<SubscriptionPlan> entities = plans.stream()
                .map(subscriptionPlanMapper::toEntity)
                .peek(plan -> {
                    plan.setApiId(api.getId());
                    plan.setActive(true);
                    if (plan.getPrice() == null) {
                        plan.setPrice(BigDecimal.ZERO);
                    }
                })
                .collect(Collectors.toList());
        subscriptionPlanRepository.deleteAll(subscriptionPlanRepository.findByApiId(api.getId()));
        subscriptionPlanRepository.saveAll(entities);
    }

    private void saveDocumentation(Api api, ApiDocumentationDto documentationDto) {
        if (documentationDto == null) {
            return;
        }
        ApiDocumentation documentation = apiDocumentationRepository.findFirstByApiId(api.getId())
                .map(existing -> {
                    existing.setAuthenticationGuide(documentationDto.getAuthenticationGuide());
                    existing.setBaseEndpoint(documentationDto.getBaseEndpoint());
                    existing.setHeaders(documentationDto.getHeaders());
                    existing.setRequestExample(documentationDto.getRequestExample());
                    existing.setResponseExample(documentationDto.getResponseExample());
                    existing.setErrorCodes(documentationDto.getErrorCodes());
                    existing.setMarkdown(documentationDto.getMarkdown());
                    return existing;
                })
                .orElseGet(() -> {
                    ApiDocumentation newDoc = apiDocumentationMapper.toEntity(documentationDto);
                    newDoc.setApiId(api.getId());
                    return newDoc;
                });
        apiDocumentationRepository.save(documentation);
    }

    private void validateCategory(String categoryId) {
        if (categoryId == null || categoryRepository.findById(categoryId).isEmpty()) {
            throw new ResourceNotFoundException("Category not found");
        }
    }

    private void validateUrl(String url) {
        if (url == null || !url.matches("^https?://[\\w.-]+(:[0-9]+)?(/.*)?$")) {
            throw new IllegalArgumentException("Base URL must be a valid URL");
        }
    }

    private void validateImage(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("Image file is required");
        }
        String contentType = file.getContentType();
        if (contentType == null || !(contentType.equals("image/png") || contentType.equals("image/jpeg"))) {
            throw new IllegalArgumentException("Supported image types are png, jpg, jpeg");
        }
        if (file.getSize() > 2 * 1024 * 1024L) {
            throw new IllegalArgumentException("Maximum file size is 2MB");
        }
    }
}
