package com.marketplace.service.impl;

import java.math.BigDecimal;
import java.util.List;

import org.springframework.stereotype.Service;

import com.marketplace.constants.AppConstants;
import com.marketplace.dto.AnalyticsResponse;
import com.marketplace.dto.DashboardResponse;
import com.marketplace.dto.RevenueResponse;
import com.marketplace.dto.UserResponse;
import com.marketplace.entity.ApprovalStatus;
import com.marketplace.entity.Payment;
import com.marketplace.entity.PaymentStatus;
import com.marketplace.entity.Role;
import com.marketplace.entity.User;
import com.marketplace.exception.ResourceNotFoundException;
import com.marketplace.mapper.UserMapper;
import com.marketplace.repository.CategoryRepository;
import com.marketplace.repository.PaymentRepository;
import com.marketplace.repository.RoleRepository;
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
    
    private final RoleRepository roleRepository;

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