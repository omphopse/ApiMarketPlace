package com.marketplace.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "API Documentation Response DTO")
public class ApiDocumentationResponse {
    @Schema(description = "Unique identifier for API documentation", example = "507f1f77bcf86cd799439011")
    private String id;

    @Schema(description = "Associated API identifier", example = "507f1f77bcf86cd799439012")
    private String apiId;

    @Schema(description = "Base endpoint URL for the API", example = "https://api.example.com/v1")
    private String baseEndpoint;

    @Schema(description = "Authentication guide and requirements")
    private String authenticationGuide;

    @Schema(description = "Required headers for API requests")
    private String headers;

    @Schema(description = "Example request body")
    private String requestExample;

    @Schema(description = "Example response body")
    private String responseExample;

    @Schema(description = "Error codes and their meanings")
    private String errorCodes;

    @Schema(description = "Markdown formatted documentation")
    private String markdown;

    @Schema(description = "Timestamp when the documentation was created")
    private LocalDateTime createdAt;

    @Schema(description = "Timestamp when the documentation was last updated")
    private LocalDateTime updatedAt;
}
