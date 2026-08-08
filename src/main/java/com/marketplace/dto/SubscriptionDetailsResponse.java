package com.marketplace.dto;

import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SubscriptionDetailsResponse {
    private String subscriptionId;
    private String apiName;
    private String planName;
    private String status;
    private LocalDateTime startedAt;
    private LocalDateTime expiresAt;
    private UsageSummaryResponse usageSummary;
    private ApiKeyMetadata apiKeyMetadata;
    private boolean documentationAvailable;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ApiKeyMetadata {
        private String id;
        private String keyPrefix;
        private String status;
        private LocalDateTime createdAt;
        private LocalDateTime lastUsedAt;
    }
}
