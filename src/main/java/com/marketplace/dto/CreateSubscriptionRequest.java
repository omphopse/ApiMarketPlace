package com.marketplace.dto;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateSubscriptionRequest {
    @NotNull(message = "API ID is required")
    private Long apiId;

    @NotNull(message = "Plan ID is required")
    private Long planId;
}
