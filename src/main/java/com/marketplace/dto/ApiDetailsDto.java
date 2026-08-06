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
    private Long id;
    private Long providerId;
    private String name;
    private String description;
    private String baseUrl;
    private Long categoryId;
    private String categoryName;
    private String logo;
    private String version;
    private String authenticationType;
    private Integer rateLimit;
    private String status;
    private List<SubscriptionPlanDto> plans;
    private ApiDocumentationDto documentation;
}
