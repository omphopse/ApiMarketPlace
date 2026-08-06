package com.marketplace.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ApiDocumentationResponse {
    private String apiName;
    private String baseEndpoint;
    private String authenticationGuide;
    private String headers;
    private String requestExample;
    private String responseExample;
    private String errorCodes;
    private String markdown;
}
