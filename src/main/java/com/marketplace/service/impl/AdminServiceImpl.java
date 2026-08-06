package com.marketplace.service.impl;

import java.util.List;

import org.springframework.stereotype.Service;

import com.marketplace.constants.AppConstants;
import com.marketplace.dto.AnalyticsResponse;
import com.marketplace.dto.DashboardResponse;
import com.marketplace.dto.UserResponse;
import com.marketplace.entity.ApprovalStatus;
import com.marketplace.entity.User;
import com.marketplace.exception.ResourceNotFoundException;
import com.marketplace.mapper.UserMapper;
import com.marketplace.repository.CategoryRepository;
import com.marketplace.repository.UserRepository;
import com.marketplace.service.AdminService;
import com.marketplace.service.AuditLogService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AdminServiceImpl implements AdminService {

    private final UserRepository userRepository;
    
    private final UserMapper userMapper;
    
    private final CategoryRepository categoryRepository ;
    
    private final AuditLogService auditLogService;

    @Override
    public List<UserResponse> getAllUsers() {

        return userRepository.findAll()
                .stream()
                .map(userMapper::toResponse)
                .toList();
    }
    
    @Override
    public UserResponse getUserById(Long id) {

        User user = userRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException("User not found with id : " + id));

        return userMapper.toResponse(user);

    }
    
    @Override
    public UserResponse updateUserStatus(Long id, boolean enabled) {

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
    public void deleteUser(Long id) {

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

        DashboardResponse response = new DashboardResponse();

        response.setTotalUsers(userRepository.count());

        response.setTotalProviders(
                userRepository.countByRole_Name(AppConstants.ROLE_PROVIDER));

        response.setTotalConsumers(
                userRepository.countByRole_Name(AppConstants.ROLE_CONSUMER));

        response.setTotalApis(0);

        response.setTotalSubscriptions(0);

        response.setTotalRevenue(0);

        return response;
    }
    
    @Override
    public List<UserResponse> getPendingProviders() {

        return userRepository
                .findByRole_NameAndApprovalStatus(
                        AppConstants.ROLE_PROVIDER,
                        ApprovalStatus.PENDING)
                .stream()
                .map(userMapper::toResponse)
                .toList();
    }
    
    @Override
    public UserResponse approveProvider(Long id) {

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
    public UserResponse rejectProvider(Long id) {

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
    public AnalyticsResponse getAnalytics() {

        return AnalyticsResponse.builder()
                .totalUsers(userRepository.count())

                .totalProviders(
                        userRepository.countByRole_Name(AppConstants.ROLE_PROVIDER))

                .totalConsumers(
                        userRepository.countByRole_Name(AppConstants.ROLE_CONSUMER))

                .pendingProviders(
                        userRepository.countByRole_NameAndApprovalStatus(
                                AppConstants.ROLE_PROVIDER,
                                ApprovalStatus.PENDING))

                .approvedProviders(
                        userRepository.countByRole_NameAndApprovalStatus(
                                AppConstants.ROLE_PROVIDER,
                                ApprovalStatus.APPROVED))

                .rejectedProviders(
                        userRepository.countByRole_NameAndApprovalStatus(
                                AppConstants.ROLE_PROVIDER,
                                ApprovalStatus.REJECTED))

                .totalCategories(categoryRepository.count())

                .build();
    }

}