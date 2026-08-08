package com.marketplace.service.impl;

import java.util.List;

import org.springframework.stereotype.Service;

import com.marketplace.constants.AppConstants;
import com.marketplace.dto.AnalyticsResponse;
import com.marketplace.dto.ApiSummaryDto;
import com.marketplace.dto.DashboardResponse;
import com.marketplace.dto.UserResponse;
import com.marketplace.entity.ApprovalStatus;
import com.marketplace.entity.Api;
import com.marketplace.entity.ApiStatus;
import com.marketplace.entity.Category;
import com.marketplace.entity.Role;
import com.marketplace.entity.User;
import com.marketplace.exception.ResourceNotFoundException;
import com.marketplace.mapper.UserMapper;
import com.marketplace.repository.ApiRepository;
import com.marketplace.repository.CategoryRepository;
import com.marketplace.repository.RoleRepository;
import com.marketplace.repository.UserRepository;
import com.marketplace.service.AdminService;
import com.marketplace.service.AuditLogService;
import com.marketplace.notification.NotificationService;
import com.marketplace.notification.email.EmailEventType;
import com.marketplace.notification.email.NotificationRequest;
import java.util.Map;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AdminServiceImpl implements AdminService {

    private final UserRepository userRepository;

        private final ApiRepository apiRepository;
    
    private final UserMapper userMapper;
    
    private final CategoryRepository categoryRepository ;
    
    private final RoleRepository roleRepository;

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
    public UserResponse updateUserStatus(String id, boolean enabled) {

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
    public void deleteUser(String id) {

        User user = userRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException("User not found with id: " + id));

        if (AppConstants.ROLE_ADMIN.equals(user.getRole().getName())) {
            throw new IllegalArgumentException("Admin users cannot be deleted.");
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

        DashboardResponse response = new DashboardResponse();

        response.setTotalUsers(userRepository.count());

        response.setTotalProviders(
                userRepository.countByRole_Id(providerRole.getId()));

        response.setTotalConsumers(
                userRepository.countByRole_Id(consumerRole.getId()));

        response.setTotalApis(0);

        response.setTotalSubscriptions(0);

        response.setTotalRevenue(0);

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
                return ApiSummaryDto.builder()
                                .id(api.getId())
                                .name(api.getName())
                                .description(api.getDescription())
                                .categoryName(categoryName)
                                .logo(api.getLogo())
                                .version(api.getVersion())
                                .status(api.getStatus() == null ? null : api.getStatus().name())
                                .rateLimit(api.getRateLimit())
                                .authenticationType(api.getAuthenticationType())
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