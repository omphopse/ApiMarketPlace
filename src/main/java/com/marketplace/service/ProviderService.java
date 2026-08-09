package com.marketplace.service;

import com.marketplace.dto.DashboardDto;
import com.marketplace.dto.ProviderProfileDto;
import com.marketplace.dto.ApiDetailsDto;
import com.marketplace.dto.ApiDocumentationDto;
import com.marketplace.dto.ApiRequestDto;
import com.marketplace.dto.ApiSummaryDto;
import com.marketplace.dto.CategoryDto;
import com.marketplace.dto.SubscriptionPlanDto;
import com.marketplace.dto.ProviderSubscriberResponse;
import com.marketplace.dto.PagedResponse;
import java.util.List;
import org.springframework.web.multipart.MultipartFile;

public interface ProviderService {
    ProviderProfileDto getProfile(String userId);
    ProviderProfileDto saveProfile(String userId, ProviderProfileDto dto);
    DashboardDto getDashboard(String userId);
    List<ApiSummaryDto> getApis(String userId, String search, String status, String category, String sort);
    ApiDetailsDto getApi(String userId, String apiId);
    ApiDetailsDto createApi(String userId, ApiRequestDto request);
    ApiDetailsDto updateApi(String userId, String apiId, ApiRequestDto request);
    void deleteApi(String userId, String apiId);
    ApiDetailsDto submitApi(String userId, String apiId);
    ApiDetailsDto archiveApi(String userId, String apiId);

    SubscriptionPlanDto createPlan(String userId, String apiId, SubscriptionPlanDto planDto);
    SubscriptionPlanDto updatePlan(String userId, String planId, SubscriptionPlanDto planDto);
    void deletePlan(String userId, String planId);
    List<SubscriptionPlanDto> getPlans(String userId, String apiId);
    PagedResponse<ProviderSubscriberResponse> getSubscribers(String userId, String apiId, int page, int size);

    ApiDocumentationDto createDocumentation(String userId, String apiId, ApiDocumentationDto documentationDto);
    ApiDocumentationDto updateDocumentation(String userId, String apiId, ApiDocumentationDto documentationDto);
    ApiDocumentationDto getDocumentation(String userId, String apiId);

    List<CategoryDto> getCategories();
    String uploadImage(MultipartFile file);
}
