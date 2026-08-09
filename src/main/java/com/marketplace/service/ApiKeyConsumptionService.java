package com.marketplace.service;

import com.marketplace.dto.ApiKeyAccessDecision;
import com.marketplace.entity.Api;
import com.marketplace.entity.ApiKey;
import com.marketplace.entity.Subscription;
import com.marketplace.security.api.ApiKeyPrincipal;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.security.core.Authentication;

public interface ApiKeyConsumptionService {
    ApiKeyAccessDecision validateRequest(Authentication authentication, HttpServletRequest request);
    ApiKeyPrincipal resolvePrincipal(ApiKey apiKey);
    Subscription resolveSubscription(ApiKey apiKey);
    Api resolveApi(ApiKey apiKey);
}
