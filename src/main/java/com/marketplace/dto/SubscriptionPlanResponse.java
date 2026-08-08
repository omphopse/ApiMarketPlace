package com.marketplace.dto;

import com.marketplace.entity.BillingCycle;
import io.swagger.v3.oas.annotations.media.Schema;
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
@Schema(description = "Subscription Plan Response DTO")
public class SubscriptionPlanResponse {
    @Schema(description = "Unique identifier for subscription plan", example = "507f1f77bcf86cd799439011")
    private String id;

    @Schema(description = "Associated API identifier", example = "507f1f77bcf86cd799439012")
    private String apiId;

    @Schema(description = "Name of the subscription plan", example = "Premium Plan")
    private String planName;

    @Schema(description = "Price of the subscription plan", example = "99.99")
    private BigDecimal price;

    @Schema(description = "Billing cycle type", example = "MONTHLY")
    private BillingCycle billingCycle;

    @Schema(description = "Request limit for this plan", example = "10000")
    private Integer requestLimit;

    @Schema(description = "Whether this plan is active", example = "true")
    private boolean active;

    @Schema(description = "Timestamp when the plan was created")
    private LocalDateTime createdAt;
}
