package com.marketplace.dto;

import com.marketplace.entity.BillingCycle;
import com.fasterxml.jackson.annotation.JsonProperty;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.math.BigDecimal;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Subscription Plan Data Transfer Object")
public class SubscriptionPlanDto {
    @JsonProperty(access = JsonProperty.Access.READ_ONLY)
    @Schema(description = "Unique identifier for subscription plan", example = "507f1f77bcf86cd799439011", accessMode = Schema.AccessMode.READ_ONLY)
    private String id;

    @JsonProperty(access = JsonProperty.Access.READ_ONLY)
    @Schema(description = "Associated API identifier", example = "507f1f77bcf86cd799439012", accessMode = Schema.AccessMode.READ_ONLY)
    private String apiId;

    @NotBlank(message = "Plan name is required")
    @Size(max = 150, message = "Plan name must be at most 150 characters")
    @Schema(description = "Name of the subscription plan", example = "Premium Plan")
    private String planName;

    @NotNull(message = "Price is required")
    @Min(value = 0, message = "Price must be greater than or equal to 0")
    @Schema(description = "Price of the subscription plan", example = "99.99")
    private BigDecimal price;

    @NotNull(message = "Billing cycle is required")
    @Schema(description = "Billing cycle type (MONTHLY, YEARLY, etc.)", example = "MONTHLY")
    private BillingCycle billingCycle;

    @NotNull(message = "Request limit is required")
    @Min(value = 1, message = "Request limit must be positive")
    @Schema(description = "Maximum number of API requests allowed per billing cycle", example = "10000")
    private Integer requestLimit;

    @Schema(description = "Whether this plan is currently active", example = "true")
    private boolean active;
}
