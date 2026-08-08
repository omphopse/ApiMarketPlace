package com.marketplace.entity;

import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "apis")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Api {
    @Id
    private String id;

    private String providerId;

    @Indexed
    private String name;

    private String description;

    private String baseUrl;

    private String categoryId;

    private String logo;

    private String version;

    private String authenticationType;

    private Integer rateLimit;

    private boolean deleted;

    private ApiStatus status;

    @CreatedDate
    private LocalDateTime createdAt;

    @LastModifiedDate
    private LocalDateTime updatedAt;
}
