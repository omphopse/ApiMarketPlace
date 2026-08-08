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
public class RevenueResponse {

    private BigDecimal totalRevenue;

    private long totalPayments;

    private long successfulPayments;

    private long pendingPayments;

    private long failedPayments;
}