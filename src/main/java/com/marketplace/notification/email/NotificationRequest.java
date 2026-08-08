package com.marketplace.notification.email;

import java.util.Map;

public record NotificationRequest(
        EmailEventType eventType,
        String recipient,
        String recipientName,
        String relatedEntityId,
        Map<String, String> variables) {
}