package com.marketplace.service;

import com.marketplace.dto.ApiDocumentationResponse;
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
import com.marketplace.dto.UsageLogResponse;
import com.marketplace.dto.UsageSummaryResponse;
import java.util.List;
import org.springframework.web.multipart.MultipartFile;

public interface ConsumerService {
    ConsumerProfileResponse getProfile();
    ConsumerProfileResponse updateProfile(ConsumerProfileUpdateRequest request);
    String uploadProfileImage(MultipartFile file);
    PagedResponse<ApiMarketplaceCardResponse> browseMarketplace(int page, int size, String search, String categoryId, String pricing, String sort);
    ApiMarketplaceDetailsResponse getMarketplaceApi(String apiId);
    List<SubscriptionPlanResponse> getApiPlans(String apiId);
    SubscriptionResponse createSubscription(CreateSubscriptionRequest request);
    SubscriptionActivationResponse activateSubscription(String subscriptionId);
    // Development activation: only allows activation for free plans (price = 0).
    SubscriptionActivationResponse activateSubscriptionDev(String subscriptionId);
    List<ApiKeyResponse> getApiKeys();
    ApiKeyCreatedResponse regenerateApiKey(String subscriptionId);
    void revokeApiKey(String apiKeyId);
    PagedResponse<SubscriptionResponse> getSubscriptions(int page, int size, String status, String search);
    SubscriptionDetailsResponse getSubscription(String subscriptionId);
    void cancelSubscription(String subscriptionId);
    ApiDocumentationResponse getSubscriptionDocumentation(String subscriptionId);
    UsageSummaryResponse getUsageSummary(String subscriptionId, String range);

    // Debug: return raw usage logs for a subscription (authenticated consumer only)
    java.util.List<com.marketplace.dto.UsageLogResponse> getUsageLogs(String subscriptionId);
    ConsumerDashboardResponse getDashboard();
}
