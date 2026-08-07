package com.marketplace.entity;

import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.DocumentReference;
import org.springframework.data.mongodb.core.mapping.FieldType;
import org.springframework.data.mongodb.core.mapping.MongoId;

@Document(collection = "usage_logs")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UsageLog {
    @MongoId(FieldType.INT64)
    private Long id;

    @DocumentReference(lazy = true)
    private User consumer;

    @DocumentReference(lazy = true)
    private Api api;

    @DocumentReference(lazy = true)
    private Subscription subscription;

    private String endpoint;

    private String httpMethod;

    private int statusCode;

    private long responseTimeMs;

    @CreatedDate
    private LocalDateTime timestamp;
}
