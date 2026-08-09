package com.marketplace.dto;

import com.marketplace.entity.Api;
import com.marketplace.entity.ApiKey;
import com.marketplace.entity.Subscription;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class ApiKeyAccessDecision {
    private boolean allowed;
    private String errorCode;
    private String message;
    private int statusCode;
    private ApiKey apiKey;
    private Subscription subscription;
    private Api api;
    private Integer limit;
    private Long remaining;
    private Long retryAfterSeconds;
    private String rateLimitKey;
}
