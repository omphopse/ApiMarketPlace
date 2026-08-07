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
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.DocumentReference;
import org.springframework.data.mongodb.core.mapping.FieldType;
import org.springframework.data.mongodb.core.mapping.MongoId;

@Document(collection = "subscriptions")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Subscription {
    @MongoId(FieldType.INT64)
    private Long id;

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

    @CreatedDate
    private LocalDateTime createdAt;

    @LastModifiedDate
    private LocalDateTime updatedAt;
}
