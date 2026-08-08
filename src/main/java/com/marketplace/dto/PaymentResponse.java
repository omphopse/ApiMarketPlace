package com.marketplace.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import com.marketplace.entity.PaymentMethod;
import com.marketplace.entity.PaymentStatus;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PaymentResponse {

    private Long id;

    private Long consumerId;

    private Long providerId;

    private Long apiId;

    private Long subscriptionId;

    private String planName;

    private BigDecimal amount;

    private String currency;

    private PaymentStatus paymentStatus;

    private PaymentMethod paymentMethod;
    
    private String razorpayOrderId;

    private String transactionId;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;
}