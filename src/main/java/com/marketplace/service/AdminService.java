package com.marketplace.service;

import java.util.List;

import com.marketplace.dto.AnalyticsResponse;
import com.marketplace.dto.ApiSummaryDto;
import com.marketplace.dto.DashboardResponse;
import com.marketplace.dto.UserResponse;

public interface AdminService {

    DashboardResponse getDashboard();
    
    List<UserResponse> getAllUsers();
    
    UserResponse getUserById(String id);
    
    UserResponse updateUserStatus(String id, boolean enabled);
    
    List<UserResponse> searchUsers(String keyword);
    
    void deleteUser(String id);
    
    List<UserResponse> getPendingProviders();
    
    UserResponse approveProvider(String id);
    
    UserResponse rejectProvider(String id);

    List<ApiSummaryDto> getAllApis();

    List<ApiSummaryDto> getPendingApis();

    ApiSummaryDto getApi(String id);

    ApiSummaryDto approveApi(String id);

    ApiSummaryDto rejectApi(String id);
    
    AnalyticsResponse getAnalytics();

}