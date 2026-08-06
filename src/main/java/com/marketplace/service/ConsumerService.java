package com.marketplace.service;

import com.marketplace.dto.ApiKeyCreatedResponse;
import com.marketplace.dto.ApiKeyResponse;
import com.marketplace.dto.ApiMarketplaceCardResponse;
import com.marketplace.dto.ApiMarketplaceDetailsResponse;
import com.marketplace.dto.ConsumerDashboardResponse;
import com.marketplace.dto.ConsumerProfileResponse;
import com.marketplace.dto.ConsumerProfileUpdateRequest;
import com.marketplace.dto.CreateSubscriptionRequest;
import com.marketplace.dto.PagedResponse;
import com.marketplace.dto.SubscriptionActivationResponse;
import com.marketplace.dto.SubscriptionDetailsResponse;
import com.marketplace.dto.SubscriptionPlanResponse;
import com.marketplace.dto.SubscriptionResponse;
import com.marketplace.dto.UsageSummaryResponse;
import com.marketplace.dto.UsageLogResponse;
import com.marketplace.dto.ApiDocumentationResponse;
import java.util.List;

public interface ConsumerService {
    ConsumerProfileResponse getProfile();
    ConsumerProfileResponse updateProfile(ConsumerProfileUpdateRequest request);
    PagedResponse<ApiMarketplaceCardResponse> browseMarketplace(int page, int size, String search, Long categoryId, String pricing, String sort);
    ApiMarketplaceDetailsResponse getMarketplaceApi(Long apiId);
    List<SubscriptionPlanResponse> getApiPlans(Long apiId);
    SubscriptionResponse createSubscription(CreateSubscriptionRequest request);
    SubscriptionActivationResponse activateSubscription(Long subscriptionId);
    List<ApiKeyResponse> getApiKeys();
    ApiKeyCreatedResponse regenerateApiKey(Long subscriptionId);
    void revokeApiKey(Long apiKeyId);
    PagedResponse<SubscriptionResponse> getSubscriptions(int page, int size, String status, String search);
    SubscriptionDetailsResponse getSubscription(Long subscriptionId);
    void cancelSubscription(Long subscriptionId);
    ApiDocumentationResponse getSubscriptionDocumentation(Long subscriptionId);
    UsageSummaryResponse getUsageSummary(Long subscriptionId);
    ConsumerDashboardResponse getDashboard();
}
