package com.marketplace.service;

import java.util.List;

import com.marketplace.dto.AnalyticsResponse;
import com.marketplace.dto.DashboardResponse;
import com.marketplace.dto.UserResponse;

public interface AdminService {

    DashboardResponse getDashboard();
    
    List<UserResponse> getAllUsers();
    
    UserResponse getUserById(Long id);
    
    UserResponse updateUserStatus(Long id, boolean enabled);
    
    List<UserResponse> searchUsers(String keyword);
    
    void deleteUser(Long id);
    
    List<UserResponse> getPendingProviders();
    
    UserResponse approveProvider(Long id);
    
    UserResponse rejectProvider(Long id);
    
    AnalyticsResponse getAnalytics();

}