package com.marketplace.service;

import com.marketplace.dto.ApiKeyAccessDecision;
import com.marketplace.entity.Api;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.ResponseEntity;

public interface ApiProxyService {
    ResponseEntity<byte[]> proxyRequest(HttpServletRequest request, Api api, ApiKeyAccessDecision decision);
}
