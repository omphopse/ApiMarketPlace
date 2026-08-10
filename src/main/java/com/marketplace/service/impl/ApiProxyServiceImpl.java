package com.marketplace.service.impl;

import com.marketplace.dto.ApiKeyAccessDecision;
import com.marketplace.entity.Api;
import com.marketplace.service.ApiProxyService;
import jakarta.servlet.http.HttpServletRequest;
import java.io.IOException;
import java.net.URI;
import java.util.Collections;
import java.util.Enumeration;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.RequestEntity;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.util.StreamUtils;
import org.springframework.web.client.RestClientResponseException;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

@Service
@RequiredArgsConstructor
public class ApiProxyServiceImpl implements ApiProxyService {
    private final RestTemplate restTemplate = new RestTemplate();

    @Override
    public ResponseEntity<byte[]> proxyRequest(HttpServletRequest request, Api api, ApiKeyAccessDecision decision) {
        if (api == null || api.getBaseUrl() == null || api.getBaseUrl().isBlank()) {
            throw new IllegalArgumentException("Provider API base URL is not configured");
        }

        HttpMethod method = HttpMethod.valueOf(request.getMethod());
        String targetPath = buildTargetPath(request);
        String normalizedBaseUrl = api.getBaseUrl().replaceAll("/+$", "");
        URI targetUri = UriComponentsBuilder.fromUriString(normalizedBaseUrl)
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
        headers.remove("Cookie");

        byte[] body = null;
        if (method != HttpMethod.GET) {
            try {
                body = StreamUtils.copyToByteArray(request.getInputStream());
            } catch (IOException e) {
                throw new IllegalStateException("Unable to read request body", e);
            }
        }

        RequestEntity<?> requestEntity = (body != null && body.length > 0)
                ? new RequestEntity<>(body, headers, method, targetUri)
                : new RequestEntity<>(headers, method, targetUri);

        try {
            return restTemplate.exchange(requestEntity, byte[].class);
        } catch (RestClientResponseException ex) {
            HttpHeaders responseHeaders = new HttpHeaders();
            if (ex.getResponseHeaders() != null) {
                ex.getResponseHeaders().forEach((name, values) -> {
                    if (!"Transfer-Encoding".equalsIgnoreCase(name)
                            && !"Content-Length".equalsIgnoreCase(name)
                            && !"Connection".equalsIgnoreCase(name)
                            && !"Keep-Alive".equalsIgnoreCase(name)
                            && !"Proxy-Authenticate".equalsIgnoreCase(name)
                            && !"Proxy-Authorization".equalsIgnoreCase(name)
                            && !"TE".equalsIgnoreCase(name)
                            && !"Trailer".equalsIgnoreCase(name)
                            && !"Upgrade".equalsIgnoreCase(name)) {
                        responseHeaders.put(name, values);
                    }
                });
            }
            return ResponseEntity.status(ex.getRawStatusCode())
                    .headers(responseHeaders)
                    .body(ex.getResponseBodyAsByteArray());
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
        return !normalized.contains("cookie")
                && !normalized.contains("jwt")
                && !normalized.contains("token")
                && !normalized.contains("secret")
                && !normalized.contains("api-key")
                && !normalized.contains("x-api-key")
                && !normalized.equals("host")
                && !normalized.equals("accept-encoding")
                && !normalized.equals("content-length")
                && !normalized.equals("connection")
                && !normalized.equals("keep-alive")
                && !normalized.equals("proxy-authenticate")
                && !normalized.equals("proxy-authorization")
                && !normalized.equals("te")
                && !normalized.equals("trailer")
                && !normalized.equals("transfer-encoding")
                && !normalized.equals("upgrade")
                && !normalized.equals("proxy-connection");
    }
}
