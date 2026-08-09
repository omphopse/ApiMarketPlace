package com.marketplace.dto;

import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ApiSummaryDto {
    private String id;
    private String name;
    private String description;
    private String shortDescription;
    private String categoryName;
    private String category;
    private String logo;
    private String version;
    private String status;
    private Integer rateLimit;
    private String authenticationType;
    private Long subscribers;
    private Long requests;
    private java.math.BigDecimal revenue;
    private String providerName;
    private String companyName;
    private String websiteUrl;
    private String supportUrl;
    private String baseUrl;
    private Integer timeout;
    private java.time.LocalDateTime createdAt;
    private java.time.LocalDateTime updatedAt;
    private java.time.LocalDateTime lastUpdated;
    private List<String> tags;
    private List<SubscriptionPlanDto> plans;
    private ApiDocumentationDto documentation;
}
