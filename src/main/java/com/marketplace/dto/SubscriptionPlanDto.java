package com.marketplace.dto;

import com.marketplace.entity.BillingCycle;
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
public class SubscriptionPlanDto {
    private Long id;
    private Long apiId;

    @NotBlank(message = "Plan name is required")
    @Size(max = 150, message = "Plan name must be at most 150 characters")
    private String planName;

    @NotNull(message = "Price is required")
    @Min(value = 0, message = "Price must be greater than or equal to 0")
    private BigDecimal price;

    @NotNull(message = "Billing cycle is required")
    private BillingCycle billingCycle;

    @NotNull(message = "Request limit is required")
    @Min(value = 1, message = "Request limit must be positive")
    private Integer requestLimit;

    private boolean active;
}
