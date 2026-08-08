package com.marketplace.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "API Documentation Data Transfer Object")
public class ApiDocumentationDto {
    @JsonProperty(access = JsonProperty.Access.READ_ONLY)
    @Schema(description = "Unique identifier for API documentation", example = "507f1f77bcf86cd799439011", accessMode = Schema.AccessMode.READ_ONLY)
    private String id;

    @JsonProperty(access = JsonProperty.Access.READ_ONLY)
    @Schema(description = "Associated API identifier", example = "507f1f77bcf86cd799439012", accessMode = Schema.AccessMode.READ_ONLY)
    private String apiId;

    @Schema(description = "Guide for API authentication and authorization")
    private String authenticationGuide;

    @Schema(description = "Base URL endpoint for the API", example = "https://api.example.com/v1")
    private String baseEndpoint;

    @Schema(description = "Required HTTP headers for API requests")
    private String headers;

    @Schema(description = "Example request payload in JSON format")
    private String requestExample;

    @Schema(description = "Example response payload in JSON format")
    private String responseExample;

    @Schema(description = "API error codes and their descriptions")
    private String errorCodes;

    @Schema(description = "Complete API documentation in Markdown format")
    private String markdown;
}
