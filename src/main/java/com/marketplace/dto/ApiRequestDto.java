package com.marketplace.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ApiRequestDto {
    @NotBlank(message = "API name is required")
    @Size(max = 100, message = "API name must be at most 100 characters")
    private String name;

    @NotBlank(message = "Description is required")
    @Size(max = 1000, message = "Description must be at most 1000 characters")
    private String description;

    @NotBlank(message = "Base URL is required")
    @Size(max = 500, message = "Base URL must be at most 500 characters")
    private String baseUrl;

    @NotNull(message = "Category is required")
    private String categoryId;

    @Size(max = 255, message = "Logo URL must be at most 255 characters")
    private String logo;

    @NotBlank(message = "Version is required")
    @Size(max = 50, message = "Version must be at most 50 characters")
    private String version;

    @NotBlank(message = "Authentication type is required")
    @Size(max = 50, message = "Authentication type must be at most 50 characters")
    private String authenticationType;

    @NotNull(message = "Rate limit is required")
    private Integer rateLimit;

    @Size(max = 160, message = "Short description must be at most 160 characters")
    private String shortDescription;

    @Size(max = 1000, message = "Full description must be at most 1000 characters")
    private String fullDescription;

    @Size(max = 500, message = "Support URL must be at most 500 characters")
    private String supportUrl;

    private Integer timeout;

    private List<String> tags;

    private List<SubscriptionPlanDto> plans;
    private ApiDocumentationDto documentation;
}
