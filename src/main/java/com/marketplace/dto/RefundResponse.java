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
public class RefundResponse {

    private Long paymentId;

    private String refundId;

    private BigDecimal refundAmount;

    private String currency;

    private String status;

    private LocalDateTime refundedAt;
}