package com.marketplace.controller;

import com.marketplace.dto.ApiMarketplaceCardResponse;
import com.marketplace.dto.ApiMarketplaceDetailsResponse;
import com.marketplace.dto.PagedResponse;
import com.marketplace.dto.SubscriptionPlanResponse;
import com.marketplace.service.ConsumerService;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Positive;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/marketplace")
@RequiredArgsConstructor
public class MarketplaceController {
    private final ConsumerService consumerService;

    @GetMapping("/apis")
    public ResponseEntity<PagedResponse<ApiMarketplaceCardResponse>> browseMarketplace(
            @RequestParam(defaultValue = "0") @Min(0) int page,
            @RequestParam(defaultValue = "12") @Positive int size,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) Long category,
            @RequestParam(required = false) String pricing,
            @RequestParam(required = false, defaultValue = "NEWEST") String sort) {
        return ResponseEntity.ok(consumerService.browseMarketplace(page, size, search, category, pricing, sort));
    }

    @GetMapping("/apis/{id}")
    public ResponseEntity<ApiMarketplaceDetailsResponse> getMarketplaceApi(@PathVariable Long id) {
        return ResponseEntity.ok(consumerService.getMarketplaceApi(id));
    }

    @GetMapping("/apis/{apiId}/plans")
    public ResponseEntity<List<SubscriptionPlanResponse>> getApiPlans(@PathVariable Long apiId) {
        return ResponseEntity.ok(consumerService.getApiPlans(apiId));
    }
}
