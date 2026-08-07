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
import com.marketplace.entity.SubscriptionPlan;
import com.marketplace.entity.User;
import com.marketplace.exception.ResourceNotFoundException;
import com.marketplace.mapper.ApiDocumentationMapper;
import com.marketplace.mapper.ApiMapper;
import com.marketplace.mapper.ProviderMapper;
import com.marketplace.mapper.SubscriptionPlanMapper;
import com.marketplace.repository.ApiDocumentationRepository;
import com.marketplace.repository.ApiRepository;
import com.marketplace.repository.CategoryRepository;
import com.marketplace.repository.ProviderProfileRepository;
import com.marketplace.repository.SubscriptionPlanRepository;
import com.marketplace.repository.UserRepository;
import com.marketplace.service.ProviderService;
import java.io.IOException;
import java.util.concurrent.atomic.AtomicLong;
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
import java.util.Objects;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

@Service
@RequiredArgsConstructor
public class ProviderServiceImpl implements ProviderService {
    private final AtomicLong idGenerator = new AtomicLong(1L);
    private final ProviderProfileRepository providerProfileRepository;
    private final ApiRepository apiRepository;
    private final CategoryRepository categoryRepository;
    private final SubscriptionPlanRepository subscriptionPlanRepository;
    private final ApiDocumentationRepository apiDocumentationRepository;
    private final UserRepository userRepository;
    private final ProviderMapper providerMapper;
    private final SubscriptionPlanMapper subscriptionPlanMapper;
    private final ApiDocumentationMapper apiDocumentationMapper;
    private final ApiMapper apiMapper;

    @Value("${uploads.path:uploads}")
    private String uploadsPath;

    @Override
    @Transactional
    public ProviderProfileDto getProfile(Long userId) {
        ProviderProfile profile = providerProfileRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Provider profile not found"));
        return providerMapper.toDto(profile);
    }

    @Override
    @Transactional
    public ProviderProfileDto saveProfile(Long userId, ProviderProfileDto dto) {
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
        return providerMapper.toDto(profile);
    }

    @Override
    @Transactional
    public DashboardDto getDashboard(Long userId) {
        long totalApis = apiRepository.countByProviderIdAndDeletedFalse(userId);
        long approvedApis = apiRepository.countByProviderIdAndStatusAndDeletedFalse(userId, ApiStatus.APPROVED);
        long pendingApis = apiRepository.countByProviderIdAndStatusAndDeletedFalse(userId, ApiStatus.PENDING);
        long rejectedApis = apiRepository.countByProviderIdAndStatusAndDeletedFalse(userId, ApiStatus.REJECTED);
        long archivedApis = apiRepository.countByProviderIdAndStatusAndDeletedFalse(userId, ApiStatus.ARCHIVED);

        List<ApiSummaryDto> recentApis = apiRepository.findTop5ByProviderIdAndDeletedFalseOrderByCreatedAtDesc(userId).stream()
                .map(apiMapper::toSummaryDto)
                .collect(Collectors.toList());

        return DashboardDto.builder()
                .totalApis(totalApis)
                .approvedApis(approvedApis)
                .pendingApis(pendingApis)
                .rejectedApis(rejectedApis)
                .archivedApis(archivedApis)
                .monthlyRevenue(0)
                .totalSubscribers(0)
                .recentApis(recentApis)
                .build();
    }

    @Override
    @Transactional
    public List<ApiSummaryDto> getApis(Long userId) {
        return apiRepository.findByProviderIdAndDeletedFalseOrderByCreatedAtDesc(userId).stream()
                .map(apiMapper::toSummaryDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public ApiDetailsDto getApi(Long userId, Long apiId) {
        Api api = findApiForProvider(userId, apiId);
        ApiDetailsDto details = apiMapper.toDetailsDto(api);
        details.setPlans(subscriptionPlanRepository.findByApiId(api.getId()).stream()
                .sorted(Comparator.comparing(SubscriptionPlan::getId))
                .map(subscriptionPlanMapper::toDto)
                .collect(Collectors.toList()));
        apiDocumentationRepository.findByApiId(api.getId()).ifPresent(doc -> details.setDocumentation(apiDocumentationMapper.toDto(doc)));
        details.setCategoryId(api.getCategoryId());
        return details;
    }

    @Override
    @Transactional
    public ApiDetailsDto createApi(Long userId, ApiRequestDto request) {
        validateCategory(request.getCategoryId());
        validateUrl(request.getBaseUrl());
        Api api = Api.builder()
                .id(nextId())
                .providerId(userId)
                .name(request.getName())
                .description(request.getDescription())
                .baseUrl(request.getBaseUrl())
                .categoryId(request.getCategoryId())
                .logo(request.getLogo())
                .version(request.getVersion())
                .authenticationType(request.getAuthenticationType())
                .rateLimit(request.getRateLimit())
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
    public ApiDetailsDto updateApi(Long userId, Long apiId, ApiRequestDto request) {
        Api api = findApiForProvider(userId, apiId);
        validateCategory(request.getCategoryId());
        validateUrl(request.getBaseUrl());

        api.setName(request.getName());
        api.setDescription(request.getDescription());
        api.setBaseUrl(request.getBaseUrl());
        api.setCategoryId(request.getCategoryId());
        api.setLogo(request.getLogo());
        api.setVersion(request.getVersion());
        api.setAuthenticationType(request.getAuthenticationType());
        api.setRateLimit(request.getRateLimit());
        apiRepository.save(api);

        savePlans(api, request.getPlans());
        saveDocumentation(api, request.getDocumentation());

        return getApi(userId, apiId);
    }

    @Override
    @Transactional
    public void deleteApi(Long userId, Long apiId) {
        Api api = findApiForProvider(userId, apiId);
        api.setDeleted(true);
        apiRepository.save(api);
    }

    @Override
    @Transactional
    public ApiDetailsDto submitApi(Long userId, Long apiId) {
        Api api = findApiForProvider(userId, apiId);
        api.setStatus(ApiStatus.PENDING);
        apiRepository.save(api);
        return getApi(userId, apiId);
    }

    @Override
    @Transactional
    public ApiDetailsDto archiveApi(Long userId, Long apiId) {
        Api api = findApiForProvider(userId, apiId);
        api.setStatus(ApiStatus.ARCHIVED);
        apiRepository.save(api);
        return getApi(userId, apiId);
    }

    @Override
    @Transactional
    public SubscriptionPlanDto createPlan(Long userId, Long apiId, SubscriptionPlanDto planDto) {
        Api api = findApiForProvider(userId, apiId);
        SubscriptionPlan plan = subscriptionPlanMapper.toEntity(planDto);
        plan.setApiId(api.getId());
        plan.setActive(true);
        plan.setPrice(planDto.getPrice() == null ? BigDecimal.ZERO : planDto.getPrice());
        subscriptionPlanRepository.save(plan);
        return subscriptionPlanMapper.toDto(plan);
    }

    @Override
    @Transactional
    public SubscriptionPlanDto updatePlan(Long userId, Long planId, SubscriptionPlanDto planDto) {
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
    public void deletePlan(Long userId, Long planId) {
        SubscriptionPlan plan = subscriptionPlanRepository.findById(planId)
                .orElseThrow(() -> new ResourceNotFoundException("Subscription plan not found"));
        findApiForProvider(userId, plan.getApiId());
        subscriptionPlanRepository.delete(plan);
    }

    @Override
    @Transactional
    public List<SubscriptionPlanDto> getPlans(Long userId, Long apiId) {
        findApiForProvider(userId, apiId);
        return subscriptionPlanRepository.findByApiId(apiId).stream()
                .map(subscriptionPlanMapper::toDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public ApiDocumentationDto createDocumentation(Long userId, Long apiId, ApiDocumentationDto documentationDto) {
        findApiForProvider(userId, apiId);
        ApiDocumentation documentation = apiDocumentationMapper.toEntity(documentationDto);
        documentation.setApiId(apiId);
        apiDocumentationRepository.save(documentation);
        return apiDocumentationMapper.toDto(documentation);
    }

    @Override
    @Transactional
    public ApiDocumentationDto updateDocumentation(Long userId, Long apiId, ApiDocumentationDto documentationDto) {
        findApiForProvider(userId, apiId);
        ApiDocumentation documentation = apiDocumentationRepository.findByApiId(apiId)
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
    public ApiDocumentationDto getDocumentation(Long userId, Long apiId) {
        findApiForProvider(userId, apiId);
        return apiDocumentationRepository.findByApiId(apiId)
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

    private Api findApiForProvider(Long userId, Long apiId) {
        return apiRepository.findByIdAndProviderIdAndDeletedFalse(apiId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("API not found for provider"));
    }

    private Long nextId() {
        return idGenerator.getAndIncrement();
    }

    private void savePlans(Api api, List<SubscriptionPlanDto> plans) {
        if (plans == null) {
            return;
        }
        List<SubscriptionPlan> entities = plans.stream()
                .map(subscriptionPlanMapper::toEntity)
                .peek(plan -> {
                    if (plan.getId() == null) {
                        plan.setId(nextId());
                    }
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
        ApiDocumentation documentation = apiDocumentationRepository.findByApiId(api.getId())
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
                    if (newDoc.getId() == null) {
                        newDoc.setId(nextId());
                    }
                    newDoc.setApiId(api.getId());
                    return newDoc;
                });
        apiDocumentationRepository.save(documentation);
    }

    private void validateCategory(Long categoryId) {
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
