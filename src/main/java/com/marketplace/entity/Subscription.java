package com.marketplace.entity;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.DocumentReference;

@Document(collection = "subscriptions")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Subscription {
    @Id
    private String id;

    @DocumentReference(lazy = true)
    private User consumer;

    @DocumentReference(lazy = true)
    private Api api;

    @DocumentReference(lazy = true)
    private SubscriptionPlan subscriptionPlan;

    private SubscriptionStatus status;

    private BigDecimal price;

    private boolean autoRenew;

    private LocalDateTime startedAt;

    private LocalDateTime expiresAt;

    private boolean expirationWarning3DaysSent;

    private boolean expirationEmailSent;

    @CreatedDate
    private LocalDateTime createdAt;

    @LastModifiedDate
    private LocalDateTime updatedAt;
}
