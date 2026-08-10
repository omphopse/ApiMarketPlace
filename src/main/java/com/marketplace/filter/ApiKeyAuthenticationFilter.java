package com.marketplace.filter;

import com.marketplace.entity.ApiKey;
import com.marketplace.entity.ApiKeyStatus;
import com.marketplace.entity.Subscription;
import com.marketplace.entity.SubscriptionStatus;
import com.marketplace.repository.ApiKeyRepository;
import com.marketplace.security.api.ApiKeyPrincipal;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.util.Base64;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

@Component
@RequiredArgsConstructor
public class ApiKeyAuthenticationFilter extends OncePerRequestFilter {
    private final ApiKeyRepository apiKeyRepository;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {
        String header = request.getHeader("Authorization");
        String apiKeyValue = resolveApiKey(header, request);

        if (apiKeyValue != null) {
            String keyHash = hashKey(apiKeyValue);
            ApiKey apiKey = apiKeyRepository.findByKeyHash(keyHash).orElse(null);

            if (apiKey != null && apiKey.getStatus() == ApiKeyStatus.ACTIVE) {
                Subscription subscription = apiKey.getSubscription();
                if (subscription != null && subscription.getStatus() == SubscriptionStatus.ACTIVE
                        && (subscription.getExpiresAt() == null || !subscription.getExpiresAt().isBefore(java.time.LocalDateTime.now()))) {
                    ApiKeyPrincipal principal = new ApiKeyPrincipal(apiKey.getId(), apiKey.getConsumer().getId(), subscription.getId(), apiKey.getApi().getId());
                    UsernamePasswordAuthenticationToken authentication = new UsernamePasswordAuthenticationToken(principal, null, java.util.List.of());
                    SecurityContextHolder.getContext().setAuthentication(authentication);
                    request.setAttribute("apiKeyPrincipal", principal);
                    request.setAttribute("subscription", subscription);
                    request.setAttribute("api", apiKey.getApi());
                }
            }
        }

        filterChain.doFilter(request, response);
    }

    private String resolveApiKey(String header, HttpServletRequest request) {
        String xApiKey = request.getHeader("X-API-Key");
        if (xApiKey != null && !xApiKey.isBlank()) {
            return xApiKey.trim();
        }
        return null;
    }

    private String hashKey(String rawKey) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hashBytes = digest.digest(rawKey.getBytes(StandardCharsets.UTF_8));
            return Base64.getEncoder().encodeToString(hashBytes);
        } catch (Exception ex) {
            throw new IllegalStateException("Unable to hash API key", ex);
        }
    }
}
