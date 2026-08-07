package com.marketplace.entity;

import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.DocumentReference;
import org.springframework.data.mongodb.core.mapping.FieldType;
import org.springframework.data.mongodb.core.mapping.MongoId;

@Document(collection = "api_keys")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ApiKey {
    @MongoId(FieldType.INT64)
    private Long id;

    @DocumentReference(lazy = true)
    private Subscription subscription;

    @DocumentReference(lazy = true)
    private User consumer;

    @DocumentReference(lazy = true)
    private Api api;

    @Indexed(unique = true)
    private String keyHash;

    private String keyPrefix;

    private ApiKeyStatus status;

    @CreatedDate
    private LocalDateTime createdAt;

    private LocalDateTime lastUsedAt;

    private LocalDateTime revokedAt;
}
