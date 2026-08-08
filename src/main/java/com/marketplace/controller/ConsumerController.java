package com.marketplace.controller;

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
import com.marketplace.dto.UsageSummaryResponse;
import com.marketplace.service.ConsumerService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Positive;
import java.util.List;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/consumer")
@RequiredArgsConstructor
@PreAuthorize("hasRole('CONSUMER')")
@Tag(name = "Consumer API", description = "Consumer-facing endpoints for profile, marketplace browsing, subscriptions, API keys, usage, and dashboard")
public class ConsumerController {
    private final ConsumerService consumerService;

    @Operation(summary = "Get consumer profile")
    @GetMapping("/profile")
    public ResponseEntity<ConsumerProfileResponse> getProfile() {
        return ResponseEntity.ok(consumerService.getProfile());
    }

    @Operation(summary = "Update consumer profile")
    @PutMapping("/profile")
    public ResponseEntity<ConsumerProfileResponse> updateProfile(@Valid @RequestBody ConsumerProfileUpdateRequest request) {
        return ResponseEntity.ok(consumerService.updateProfile(request));
    }

    @Operation(summary = "Browse marketplace APIs")
    @GetMapping("/marketplace/apis")
    public ResponseEntity<PagedResponse<ApiMarketplaceCardResponse>> browseMarketplace(
            @RequestParam(defaultValue = "0") @Min(0) int page,
            @RequestParam(defaultValue = "12") @Positive int size,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String categoryId,
            @RequestParam(required = false) String pricing,
            @RequestParam(required = false, defaultValue = "NEWEST") String sort) {
        return ResponseEntity.ok(consumerService.browseMarketplace(page, size, search, categoryId, pricing, sort));
    }

    @Operation(summary = "Get marketplace API details")
    @GetMapping("/marketplace/apis/{id}")
    public ResponseEntity<ApiMarketplaceDetailsResponse> getMarketplaceApi(@PathVariable String id) {
        return ResponseEntity.ok(consumerService.getMarketplaceApi(id));
    }

    @Operation(summary = "List subscription plans for a marketplace API")
    @GetMapping("/marketplace/apis/{apiId}/plans")
    public ResponseEntity<List<SubscriptionPlanResponse>> getApiPlans(@PathVariable String apiId) {
        return ResponseEntity.ok(consumerService.getApiPlans(apiId));
    }

    @Operation(summary = "Create a subscription for a marketplace API")
    @PostMapping("/subscriptions")
    public ResponseEntity<SubscriptionResponse> createSubscription(@Valid @RequestBody CreateSubscriptionRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(consumerService.createSubscription(request));
    }

    @Operation(summary = "Activate a subscription (development/testing path)")
    @PostMapping("/dev/subscriptions/{subscriptionId}/activate")
    @PreAuthorize("hasRole('CONSUMER')")
    public ResponseEntity<SubscriptionActivationResponse> activateSubscription(@PathVariable String subscriptionId) {
        return ResponseEntity.ok(consumerService.activateSubscription(subscriptionId));
    }

    @Operation(summary = "List active consumer API keys")
    @GetMapping("/api-keys")
    public ResponseEntity<List<ApiKeyResponse>> getApiKeys() {
        return ResponseEntity.ok(consumerService.getApiKeys());
    }

    @Operation(summary = "Regenerate an API key for a subscription")
    @PostMapping("/subscriptions/{subscriptionId}/api-key/regenerate")
    public ResponseEntity<ApiKeyCreatedResponse> regenerateApiKey(@PathVariable String subscriptionId) {
        return ResponseEntity.ok(consumerService.regenerateApiKey(subscriptionId));
    }

    @Operation(summary = "Revoke a consumer API key")
    @DeleteMapping("/api-keys/{id}")
    public ResponseEntity<Void> revokeApiKey(@PathVariable("id") String apiKeyId) {
        consumerService.revokeApiKey(apiKeyId);
        return ResponseEntity.noContent().build();
    }

    @Operation(summary = "List consumer subscriptions")
    @GetMapping("/subscriptions")
    public ResponseEntity<PagedResponse<SubscriptionResponse>> getSubscriptions(
            @RequestParam(defaultValue = "0") @Min(0) int page,
            @RequestParam(defaultValue = "12") @Positive int size,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String search) {
        return ResponseEntity.ok(consumerService.getSubscriptions(page, size, status, search));
    }

    @Operation(summary = "Get a subscription detail")
    @GetMapping("/subscriptions/{id}")
    public ResponseEntity<SubscriptionDetailsResponse> getSubscription(@PathVariable String id) {
        return ResponseEntity.ok(consumerService.getSubscription(id));
    }

    @Operation(summary = "Cancel an active subscription")
    @PatchMapping("/subscriptions/{id}/cancel")
    public ResponseEntity<Void> cancelSubscription(@PathVariable String id) {
        consumerService.cancelSubscription(id);
        return ResponseEntity.noContent().build();
    }

    @Operation(summary = "Get API documentation for a subscription")
    @GetMapping("/subscriptions/{subscriptionId}/documentation")
    public ResponseEntity<ApiDocumentationResponse> getSubscriptionDocumentation(@PathVariable String subscriptionId) {
        return ResponseEntity.ok(consumerService.getSubscriptionDocumentation(subscriptionId));
    }

    @Operation(summary = "View usage summary")
    @GetMapping("/usage")
    public ResponseEntity<UsageSummaryResponse> getUsage(@RequestParam(required = false) String subscriptionId) {
        return ResponseEntity.ok(consumerService.getUsageSummary(subscriptionId));
    }

    @Operation(summary = "Get the consumer dashboard summary")
    @GetMapping("/dashboard")
    public ResponseEntity<ConsumerDashboardResponse> getDashboard() {
        return ResponseEntity.ok(consumerService.getDashboard());
    }
}
