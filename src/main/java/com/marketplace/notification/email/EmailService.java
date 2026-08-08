package com.marketplace.notification.email;

public interface EmailService {
    void sendTemplateEmail(String recipient, String subject, String htmlBody, String plainTextBody,
                           EmailEventType eventType);
}