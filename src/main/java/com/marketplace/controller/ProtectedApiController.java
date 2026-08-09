package com.marketplace.controller;

import com.marketplace.dto.ApiKeyAccessDecision;
import com.marketplace.dto.ErrorResponse;
import com.marketplace.service.ApiKeyConsumptionService;
import com.marketplace.service.ApiProxyService;
import jakarta.servlet.http.HttpServletRequest;
import java.time.LocalDateTime;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/marketplace")
@RequiredArgsConstructor
public class ProtectedApiController {
    private final ApiKeyConsumptionService apiKeyConsumptionService;
    private final ApiProxyService apiProxyService;

    @GetMapping({"/apis/{apiId}/execute", "/apis/{apiId}/execute/**"})
    public ResponseEntity<?> executeProtectedApi(@PathVariable String apiId, Authentication authentication, HttpServletRequest request) {
        ApiKeyAccessDecision decision = apiKeyConsumptionService.validateRequest(authentication, request);
        if (!decision.isAllowed()) {
            return buildError(decision);
        }

        try {
            ResponseEntity<String> providerResponse = apiProxyService.proxyRequest(request, decision.getApi(), decision);
            HttpHeaders headers = new HttpHeaders();
            headers.add("X-RateLimit-Limit", String.valueOf(decision.getLimit()));
            headers.add("X-RateLimit-Remaining", String.valueOf(decision.getRemaining()));
            headers.add("Retry-After", String.valueOf(decision.getRetryAfterSeconds() != null ? decision.getRetryAfterSeconds() : 0));
            if (providerResponse.getHeaders() != null) {
                providerResponse.getHeaders().forEach((name, values) -> {
                    if (!"Transfer-Encoding".equalsIgnoreCase(name) && !"Content-Length".equalsIgnoreCase(name)) {
                        headers.put(name, values);
                    }
                });
            }
            headers.remove("Authorization");
            headers.remove("Cookie");
            return ResponseEntity.status(providerResponse.getStatusCode()).headers(headers).body(providerResponse.getBody());
        } catch (Exception ex) {
            HttpHeaders headers = new HttpHeaders();
            headers.add("X-RateLimit-Limit", String.valueOf(decision.getLimit()));
            headers.add("X-RateLimit-Remaining", String.valueOf(decision.getRemaining()));
            headers.add("Retry-After", String.valueOf(decision.getRetryAfterSeconds() != null ? decision.getRetryAfterSeconds() : 0));
            return ResponseEntity.status(HttpStatus.BAD_GATEWAY).headers(headers).body(java.util.Map.of(
                    "status", "PROXY_ERROR",
                    "message", "Unable to reach provider API",
                    "apiId", apiId,
                    "subscriptionId", decision.getSubscription().getId()));
        }
    }

    private ResponseEntity<?> buildError(ApiKeyAccessDecision decision) {
        ErrorResponse response = ErrorResponse.builder()
                .timestamp(LocalDateTime.now())
                .status(decision.getStatusCode())
                .error(decision.getErrorCode())
                .message(decision.getMessage())
                .path("/api/marketplace/apis/execute")
                .build();
        HttpHeaders headers = new HttpHeaders();
        if (decision.getLimit() != null) {
            headers.add("X-RateLimit-Limit", String.valueOf(decision.getLimit()));
        }
        if (decision.getRemaining() != null) {
            headers.add("X-RateLimit-Remaining", String.valueOf(decision.getRemaining()));
        }
        if (decision.getRetryAfterSeconds() != null) {
            headers.add("Retry-After", String.valueOf(decision.getRetryAfterSeconds()));
        }
        return ResponseEntity.status(HttpStatus.valueOf(decision.getStatusCode())).headers(headers).body(response);
    }
}
