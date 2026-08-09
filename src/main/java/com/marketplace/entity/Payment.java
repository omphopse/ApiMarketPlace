package com.marketplace.entity;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "payments")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Payment {
    @Id
    private String id;

    @Indexed
    private String consumerId;

    @Indexed
    private String subscriptionId;

    @Indexed
    private String apiId;

    @Indexed
    private String planId;

    @Indexed(unique = true)
    private String razorpayOrderId;

    @Indexed(unique = true, sparse = true)
    private String razorpayPaymentId;

    private String razorpaySignature;

    private BigDecimal amount;

    private String currency;

    private PaymentStatus status;

    @CreatedDate
    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    private LocalDateTime paidAt;

    private String failureReason;
}
