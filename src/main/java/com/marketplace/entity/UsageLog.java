package com.marketplace.entity;

import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.DocumentReference;

@Document(collection = "usage_logs")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UsageLog {
    @Id
    private String id;

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
