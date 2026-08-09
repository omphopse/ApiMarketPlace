package com.marketplace.service.impl;

import com.marketplace.dto.ApiKeyAccessDecision;
import com.marketplace.entity.Api;
import com.marketplace.service.ApiProxyService;
import jakarta.servlet.http.HttpServletRequest;
import java.io.IOException;
import java.net.URI;
import java.nio.charset.StandardCharsets;
import java.util.Collections;
import java.util.Enumeration;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.RequestEntity;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClientResponseException;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

@Service
@RequiredArgsConstructor
public class ApiProxyServiceImpl implements ApiProxyService {
    private final RestTemplate restTemplate = new RestTemplate();

    @Override
    public ResponseEntity<String> proxyRequest(HttpServletRequest request, Api api, ApiKeyAccessDecision decision) {
        if (api == null || api.getBaseUrl() == null || api.getBaseUrl().isBlank()) {
            throw new IllegalArgumentException("Provider API base URL is not configured");
        }

        HttpMethod method = HttpMethod.valueOf(request.getMethod());
        String targetPath = buildTargetPath(request);
        URI targetUri = UriComponentsBuilder.fromUriString(api.getBaseUrl())
                .path(targetPath)
                .query(request.getQueryString())
                .build(true)
                .toUri();

        HttpHeaders headers = new HttpHeaders();
        Enumeration<String> headerNames = request.getHeaderNames();
        while (headerNames.hasMoreElements()) {
            String headerName = headerNames.nextElement();
            if (isSafeHeader(headerName)) {
                Collections.list(request.getHeaders(headerName)).forEach(value -> headers.add(headerName, value));
            }
        }
        headers.remove("Authorization");
        headers.remove("Cookie");

        String body = null;
        if (method != HttpMethod.GET && method != HttpMethod.DELETE) {
            try {
                body = request.getReader().lines().collect(Collectors.joining("\n"));
            } catch (IOException e) {
                throw new IllegalStateException("Unable to read request body", e);
            }
        }

        RequestEntity<?> requestEntity;
        if (body != null && !body.isBlank()) {
            requestEntity = new RequestEntity<>(body, headers, method, targetUri);
        } else {
            requestEntity = new RequestEntity<>(headers, method, targetUri);
        }
        try {
            return restTemplate.exchange(requestEntity, String.class);
        } catch (RestClientResponseException ex) {
            throw ex;
        }
    }

    private String buildTargetPath(HttpServletRequest request) {
        String path = request.getRequestURI();
        int marker = path.indexOf("/execute");
        if (marker >= 0) {
            String tail = path.substring(marker + "/execute".length());
            if (tail.startsWith("/")) {
                tail = tail.substring(1);
            }
            return tail.isBlank() ? "/" : "/" + tail;
        }
        return "/";
    }

    private boolean isSafeHeader(String headerName) {
        String normalized = headerName.toLowerCase();
        return !normalized.contains("authorization")
                && !normalized.contains("cookie")
                && !normalized.contains("jwt")
                && !normalized.contains("token")
                && !normalized.contains("secret")
                && !normalized.contains("api-key")
                && !normalized.contains("x-api-key");
    }
}
