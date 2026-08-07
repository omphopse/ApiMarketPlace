package com.marketplace.entity;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.FieldType;
import org.springframework.data.mongodb.core.mapping.MongoId;

@Document(collection = "subscription_plans")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SubscriptionPlan {
    @MongoId(FieldType.INT64)
    private Long id;

    private Long apiId;

    private String planName;

    private BigDecimal price;

    private BillingCycle billingCycle;

    private Integer requestLimit;

    private boolean active;

    @CreatedDate
    private LocalDateTime createdAt;
}
