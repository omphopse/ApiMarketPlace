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
public class ApiDetailsDto {
    private String id;
    private String providerId;
    private String name;
    private String description;
    private String baseUrl;
    private String categoryId;
    private String categoryName;
    private String category;
    private String shortDescription;
    private String fullDescription;
    private String logo;
    private String version;
    private String authenticationType;
    private Integer rateLimit;
    private String supportUrl;
    private Integer timeout;
    private List<String> tags;
    private String status;
    private Long subscribers;
    private Long requests;
    private java.math.BigDecimal revenue;
    private List<SubscriptionPlanDto> plans;
    private ApiDocumentationDto documentation;
}
