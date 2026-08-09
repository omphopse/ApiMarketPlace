package com.marketplace.security.api;

public record ApiKeyPrincipal(String apiKeyId, String consumerId, String subscriptionId, String apiId) {
}
