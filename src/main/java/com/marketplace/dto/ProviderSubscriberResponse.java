package com.marketplace.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProviderSubscriberResponse {
    private String subscriptionId;
    private String consumerId;
    private String consumerName;
    private String consumerEmail;
    private String status;
    private LocalDateTime createdAt;
    private LocalDateTime expiresAt;
    private BigDecimal price;
    private PlanSummary plan;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PlanSummary {
        private String id;
        private String name;
        private String billingCycle;
        private Integer requestLimit;
        private BigDecimal price;
    }
}
