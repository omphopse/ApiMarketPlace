package com.marketplace.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ApiDocumentationDto {
    private Long id;
    private Long apiId;
    private String authenticationGuide;
    private String baseEndpoint;
    private String headers;
    private String requestExample;
    private String responseExample;
    private String errorCodes;
    private String markdown;
}
