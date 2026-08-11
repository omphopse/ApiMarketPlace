package com.marketplace.service.impl;

import java.math.BigDecimal;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import com.marketplace.constants.AppConstants;
import com.marketplace.dto.ApiDocumentationDto;
import com.marketplace.dto.AnalyticsResponse;
import com.marketplace.dto.ApiSummaryDto;
import com.marketplace.dto.DashboardResponse;
import com.marketplace.dto.SubscriptionPlanDto;
import com.marketplace.dto.UserResponse;
import com.marketplace.entity.ApprovalStatus;
import com.marketplace.entity.Api;
import com.marketplace.entity.ApiStatus;
import com.marketplace.entity.Category;
import com.marketplace.entity.Role;
import com.marketplace.entity.SubscriptionPlan;
import com.marketplace.entity.Subscription;
import com.marketplace.entity.SubscriptionStatus;
import com.marketplace.entity.User;
import com.marketplace.exception.ResourceNotFoundException;
import com.marketplace.mapper.ApiDocumentationMapper;
import com.marketplace.mapper.SubscriptionPlanMapper;
import com.marketplace.mapper.UserMapper;
import com.marketplace.repository.ApiDocumentationRepository;
import com.marketplace.repository.ApiRepository;
import com.marketplace.repository.CategoryRepository;
import com.marketplace.repository.ProviderProfileRepository;
import com.marketplace.exception.UnauthorizedResourceAccessException;
import com.marketplace.repository.RoleRepository;
import com.marketplace.repository.SubscriptionPlanRepository;
import com.marketplace.repository.SubscriptionRepository;
import com.marketplace.repository.UserRepository;
import com.marketplace.service.AdminService;
import com.marketplace.service.AuditLogService;
import com.marketplace.notification.NotificationService;
import com.marketplace.notification.email.EmailEventType;
import com.marketplace.notification.email.NotificationRequest;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.transaction.annotation.Transactional;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AdminServiceImpl implements AdminService {

    private final UserRepository userRepository;

    private final ApiRepository apiRepository;

    private final UserMapper userMapper;

    private final CategoryRepository categoryRepository;

    private final ProviderProfileRepository providerProfileRepository;

    private final RoleRepository roleRepository;

    private final SubscriptionPlanRepository subscriptionPlanRepository;

    private final SubscriptionRepository subscriptionRepository;

    private final ApiDocumentationRepository apiDocumentationRepository;

    private final SubscriptionPlanMapper subscriptionPlanMapper;

    private final ApiDocumentationMapper apiDocumentationMapper;

    private final AuditLogService auditLogService;
    private final NotificationService notificationService;

    @Override
    public List<UserResponse> getAllUsers() {

        return userRepository.findAll()
                .stream()
                .map(userMapper::toResponse)
                .toList();
    }
    
    @Override
    public UserResponse getUserById(String id) {

        User user = userRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException("User not found with id : " + id));

        return userMapper.toResponse(user);

    }
    
    @Override
    @Transactional
    public UserResponse updateUserStatus(String id, boolean enabled) {
        User currentUser = getCurrentUser();
        if (currentUser.getId().equals(id)) {
            throw new UnauthorizedResourceAccessException("Administrators cannot disable or delete their own account.");
        }

        User user = userRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException("User not found with id: " + id));

        user.setEnabled(enabled);

        User updatedUser = userRepository.save(user);
        
        auditLogService.saveLog(
                enabled ? "ENABLE_USER" : "DISABLE_USER",
                "User",
                "Changed status of : " + updatedUser.getEmail());

        return userMapper.toResponse(updatedUser);
    }
    
    @Override
    public List<UserResponse> searchUsers(String keyword) {

        if (keyword == null || keyword.trim().isEmpty()) {
            return userRepository.findAll()
                    .stream()
                    .map(userMapper::toResponse)
                    .toList();
        }

        return userRepository.searchUsers(keyword)
                .stream()
                .map(userMapper::toResponse)
                .toList();
    }
    
    @Override
    @Transactional
    public void deleteUser(String id) {
        User currentUser = getCurrentUser();
        if (currentUser.getId().equals(id)) {
            throw new UnauthorizedResourceAccessException("Administrators cannot disable or delete their own account.");
        }

        User user = userRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException("User not found with id: " + id));

        if (AppConstants.ROLE_ADMIN.equals(user.getRole().getName())) {
            throw new IllegalArgumentException("Admin users cannot be deleted.");
        }

        if (AppConstants.ROLE_PROVIDER.equals(user.getRole().getName())) {
            List<Api> providerApis = apiRepository.findByProviderIdAndDeletedFalseOrderByCreatedAtDesc(id);
            if (!providerApis.isEmpty()) {
                providerApis.forEach(api -> {
                    api.setStatus(ApiStatus.ARCHIVED);
                    api.setDeleted(true);
                });
                apiRepository.saveAll(providerApis);
            }
        }

        userRepository.delete(user);
        
        auditLogService.saveLog(
                "DELETE_USER",
                "User",
                "Deleted user : " + user.getEmail());
    }
    
    @Override
    public DashboardResponse getDashboard() {

        Role providerRole = getRoleByName(AppConstants.ROLE_PROVIDER);
        Role consumerRole = getRoleByName(AppConstants.ROLE_CONSUMER);

        BigDecimal totalRevenue = subscriptionRepository.findAll()
                .stream()
                .map(subscription -> {
                    if (subscription.getPrice() != null) {
                        return subscription.getPrice();
                    }
                    if (subscription.getSubscriptionPlan() != null && subscription.getSubscriptionPlan().getPrice() != null) {
                        return subscription.getSubscriptionPlan().getPrice();
                    }
                    return BigDecimal.ZERO;
                })
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        DashboardResponse response = new DashboardResponse();

        response.setTotalUsers(userRepository.count());

        response.setTotalProviders(
                userRepository.countByRole_Id(providerRole.getId()));

        response.setTotalConsumers(
                userRepository.countByRole_Id(consumerRole.getId()));

        response.setTotalApis(apiRepository.countByDeletedFalse());

        response.setTotalSubscriptions(subscriptionRepository.count());

        response.setTotalRevenue(totalRevenue.doubleValue());

        return response;
    }
    
    @Override
    public List<UserResponse> getPendingProviders() {
        Role providerRole = getRoleByName(AppConstants.ROLE_PROVIDER);

        return userRepository
                .findByRole_IdAndApprovalStatus(
                        providerRole.getId(),
                        ApprovalStatus.PENDING)
                .stream()
                .map(userMapper::toResponse)
                .toList();
    }
    
    private User getCurrentUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Current user not found"));
    }

    private Role getRoleByName(String roleName) {
        return roleRepository.findByName(roleName)
                .orElseThrow(() -> new ResourceNotFoundException("Role not found: " + roleName));
    }

    @Override
    public UserResponse approveProvider(String id) {

        User user = userRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException("User not found with id: " + id));

        if (!AppConstants.ROLE_PROVIDER.equals(user.getRole().getName())) {
            throw new IllegalArgumentException("User is not a provider.");
        }
        
        if (user.getApprovalStatus() == ApprovalStatus.APPROVED) {
            throw new IllegalArgumentException("Provider is already approved.");
        }

        user.setApprovalStatus(ApprovalStatus.APPROVED);

        User updatedUser = userRepository.save(user);
        
        auditLogService.saveLog(
                "APPROVE_PROVIDER",
                "Provider",
                "Approved provider : " + user.getEmail());

        return userMapper.toResponse(updatedUser);
    }
    
    @Override
    public UserResponse rejectProvider(String id) {

        User user = userRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException("User not found with id: " + id));

        if (!AppConstants.ROLE_PROVIDER.equals(user.getRole().getName())) {
            throw new IllegalArgumentException("User is not a provider.");
        }
        
        if (user.getApprovalStatus() == ApprovalStatus.REJECTED) {
            throw new IllegalArgumentException("Provider is already rejected.");
        }

        user.setApprovalStatus(ApprovalStatus.REJECTED);

        User updatedUser = userRepository.save(user);
        
        auditLogService.saveLog(
                "REJECT_PROVIDER",
                "Provider",
                "Rejected provider : " + user.getEmail());

        return userMapper.toResponse(updatedUser);
    }

        @Override
        public List<ApiSummaryDto> getAllApis() {
                return apiRepository.findByDeletedFalseOrderByCreatedAtDesc()
                                .stream()
                                .map(this::toApiSummary)
                                .toList();
        }

        @Override
        public List<ApiSummaryDto> getPendingApis() {
                return apiRepository.findByStatusAndDeletedFalseOrderByCreatedAtDesc(ApiStatus.PENDING)
                                .stream()
                                .map(this::toApiSummary)
                                .toList();
        }

        @Override
        public ApiSummaryDto getApi(String id) {
                return toApiSummary(getReviewableApi(id));
        }

        @Override
        public ApiSummaryDto approveApi(String id) {
                Api api = getReviewableApi(id);
                if (api.getStatus() != ApiStatus.PENDING && api.getStatus() != ApiStatus.REJECTED) {
                        throw new IllegalArgumentException("Only pending or rejected APIs can be approved.");
                }
                api.setStatus(ApiStatus.APPROVED);
                Api updatedApi = apiRepository.save(api);
                auditLogService.saveLog("APPROVE_API", "API", "Approved API: " + updatedApi.getName());
                notifyProvider(updatedApi, EmailEventType.API_APPROVED);
                return toApiSummary(updatedApi);
        }

        @Override
        public ApiSummaryDto rejectApi(String id) {
                Api api = getReviewableApi(id);
                if (api.getStatus() != ApiStatus.PENDING) {
                        throw new IllegalArgumentException("Only pending APIs can be rejected.");
                }
                api.setStatus(ApiStatus.REJECTED);
                Api updatedApi = apiRepository.save(api);
                auditLogService.saveLog("REJECT_API", "API", "Rejected API: " + updatedApi.getName());
                notifyProvider(updatedApi, EmailEventType.API_REJECTED);
                return toApiSummary(updatedApi);
        }

        @Override
        public ApiSummaryDto changeApiStatus(String id, String newStatus, String reason) {
                Api api = getReviewableApi(id);
                ApiStatus previous = api.getStatus();
                ApiStatus target;
                try {
                        target = ApiStatus.valueOf(newStatus);
                } catch (IllegalArgumentException ex) {
                        throw new IllegalArgumentException("Invalid API status: " + newStatus);
                }

                api.setStatus(target);
                Api updated = apiRepository.save(api);

                String desc = String.format("Changed API status from %s to %s for API: %s", previous == null ? "null" : previous.name(), target.name(), updated.getName());
                if (reason != null && !reason.isBlank()) {
                        desc = desc + " - Reason: " + reason;
                }
                auditLogService.saveLog("CHANGE_API_STATUS", "API", desc);

                if (target == ApiStatus.APPROVED) {
                        notifyProvider(updated, EmailEventType.API_APPROVED);
                } else if (target == ApiStatus.REJECTED) {
                        notifyProvider(updated, EmailEventType.API_REJECTED);
                }

                return toApiSummary(updated);
        }

        private void notifyProvider(Api api, EmailEventType eventType) {
                userRepository.findById(api.getProviderId()).ifPresent(provider -> notificationService.notify(
                        new NotificationRequest(eventType, provider.getEmail(), provider.getFullName(), api.getId(),
                                Map.of("userName", provider.getFullName(), "apiName", api.getName(),
                                        "status", api.getStatus().name()))));
        }

        private Api getReviewableApi(String id) {
                return apiRepository.findByIdAndDeletedFalse(id)
                                .orElseThrow(() -> new ResourceNotFoundException("API not found with id: " + id));
        }

        private ApiSummaryDto toApiSummary(Api api) {
                String categoryName = api.getCategoryId() == null
                                ? null
                                : categoryRepository.findById(api.getCategoryId()).map(Category::getName).orElse(null);
                String providerName = null;
                String providerCompanyName = null;
                String providerWebsite = null;
                String providerSupport = null;
                if (api.getProviderId() != null) {
                    var profileOpt = providerProfileRepository.findByUserId(api.getProviderId());
                    if (profileOpt.isPresent()) {
                        var profile = profileOpt.get();
                        providerCompanyName = profile.getCompanyName();
                        providerName = profile.getCompanyName();
                        providerWebsite = profile.getWebsite();
                        providerSupport = profile.getSupportEmail();
                    }
                }
                List<SubscriptionPlanDto> plans = subscriptionPlanRepository.findByApiId(api.getId()).stream()
                        .sorted(Comparator.comparing(SubscriptionPlan::getId))
                        .map(subscriptionPlanMapper::toDto)
                        .collect(Collectors.toList());

                ApiDocumentationDto documentation = apiDocumentationRepository.findFirstByApiId(api.getId())
                        .map(apiDocumentationMapper::toDto)
                        .orElse(null);

                return ApiSummaryDto.builder()
                                .id(api.getId())
                                .name(api.getName())
                                .description(api.getDescription())
                                .shortDescription(api.getShortDescription())
                                .categoryName(categoryName)
                                .category(categoryName)
                                .logo(api.getLogo())
                                .version(api.getVersion())
                                .status(api.getStatus() == null ? null : api.getStatus().name())
                                .rateLimit(api.getRateLimit())
                                .authenticationType(api.getAuthenticationType())
                                .supportUrl(providerSupport)
                                .timeout(api.getTimeout())
                                .tags(api.getTags())
                                .providerName(providerName)
                                .companyName(providerCompanyName)
                                .websiteUrl(providerWebsite)
                                .baseUrl(api.getBaseUrl())
                                .createdAt(api.getCreatedAt())
                                .updatedAt(api.getUpdatedAt())
                                .lastUpdated(api.getUpdatedAt())
                                .plans(plans)
                                .documentation(documentation)
                                .build();
        }
    
    @Override
    public AnalyticsResponse getAnalytics() {
        Role providerRole = getRoleByName(AppConstants.ROLE_PROVIDER);
        Role consumerRole = getRoleByName(AppConstants.ROLE_CONSUMER);

        return AnalyticsResponse.builder()
                .totalUsers(userRepository.count())

                .totalProviders(
                        userRepository.countByRole_Id(providerRole.getId()))

                .totalConsumers(
                        userRepository.countByRole_Id(consumerRole.getId()))

                .pendingProviders(
                        userRepository.countByRole_IdAndApprovalStatus(
                                providerRole.getId(),
                                ApprovalStatus.PENDING))

                .approvedProviders(
                        userRepository.countByRole_IdAndApprovalStatus(
                                providerRole.getId(),
                                ApprovalStatus.APPROVED))

                .rejectedProviders(
                        userRepository.countByRole_IdAndApprovalStatus(
                                providerRole.getId(),
                                ApprovalStatus.REJECTED))

                .totalCategories(categoryRepository.count())

                .build();
    }

}