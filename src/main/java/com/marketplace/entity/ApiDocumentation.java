package com.marketplace.entity;

import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.FieldType;
import org.springframework.data.mongodb.core.mapping.MongoId;

@Document(collection = "api_documentation")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ApiDocumentation {
    @MongoId(FieldType.INT64)
    private Long id;

    private Long apiId;

    private String authenticationGuide;

    private String baseEndpoint;

    private String headers;

    private String requestExample;

    private String responseExample;

    private String errorCodes;

    private String markdown;

    @CreatedDate
    private LocalDateTime createdAt;

    @LastModifiedDate
    private LocalDateTime updatedAt;
}
