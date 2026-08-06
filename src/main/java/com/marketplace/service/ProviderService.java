package com.marketplace.service;

import com.marketplace.dto.DashboardDto;
import com.marketplace.dto.ProviderProfileDto;
import com.marketplace.dto.ApiDetailsDto;
import com.marketplace.dto.ApiRequestDto;
import com.marketplace.dto.ApiSummaryDto;
import com.marketplace.dto.CategoryDto;
import com.marketplace.dto.SubscriptionPlanDto;
import com.marketplace.dto.ApiDocumentationDto;
import java.util.List;
import org.springframework.web.multipart.MultipartFile;

public interface ProviderService {
    ProviderProfileDto getProfile(Long userId);
    ProviderProfileDto saveProfile(Long userId, ProviderProfileDto dto);
    DashboardDto getDashboard(Long userId);
    List<ApiSummaryDto> getApis(Long userId);
    ApiDetailsDto getApi(Long userId, Long apiId);
    ApiDetailsDto createApi(Long userId, ApiRequestDto request);
    ApiDetailsDto updateApi(Long userId, Long apiId, ApiRequestDto request);
    void deleteApi(Long userId, Long apiId);
    ApiDetailsDto submitApi(Long userId, Long apiId);
    ApiDetailsDto archiveApi(Long userId, Long apiId);

    SubscriptionPlanDto createPlan(Long userId, Long apiId, SubscriptionPlanDto planDto);
    SubscriptionPlanDto updatePlan(Long userId, Long planId, SubscriptionPlanDto planDto);
    void deletePlan(Long userId, Long planId);
    List<SubscriptionPlanDto> getPlans(Long userId, Long apiId);

    ApiDocumentationDto createDocumentation(Long userId, Long apiId, ApiDocumentationDto documentationDto);
    ApiDocumentationDto updateDocumentation(Long userId, Long apiId, ApiDocumentationDto documentationDto);
    ApiDocumentationDto getDocumentation(Long userId, Long apiId);

    List<CategoryDto> getCategories();
    String uploadImage(MultipartFile file);
}
