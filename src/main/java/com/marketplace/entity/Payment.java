package com.marketplace.entity;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.FieldType;
import org.springframework.data.mongodb.core.mapping.MongoId;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Document(collection = "payments")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Payment {

    @MongoId(FieldType.INT64)
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

    @CreatedDate
    private LocalDateTime createdAt;

    @LastModifiedDate
    private LocalDateTime updatedAt;
    
    private String refundId;

    private LocalDateTime refundedAt;
}