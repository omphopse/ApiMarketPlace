package com.marketplace.dto;

import java.math.BigDecimal;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SubscriptionPlanResponse {
    private Long planId;
    private String planName;
    private BigDecimal price;
    private String billingCycle;
    private Integer requestLimit;
    private String description;
    private boolean active;
}
