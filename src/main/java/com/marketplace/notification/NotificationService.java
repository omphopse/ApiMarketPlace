package com.marketplace.notification;

import com.marketplace.notification.email.EmailService;
import com.marketplace.notification.email.EmailTemplateService;
import com.marketplace.notification.email.NotificationRequest;
import java.time.LocalDateTime;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.support.TransactionSynchronization;
import org.springframework.transaction.support.TransactionSynchronizationManager;

@Service
@RequiredArgsConstructor
@Slf4j
public class NotificationService {
    private final EmailService emailService;
    private final EmailTemplateService emailTemplateService;

    public void notify(NotificationRequest request) {
        Runnable dispatch = () -> dispatchEmail(request);
        if (TransactionSynchronizationManager.isSynchronizationActive()) {
            TransactionSynchronizationManager.registerSynchronization(new TransactionSynchronization() {
                @Override
                public void afterCommit() {
                    dispatch.run();
                }
            });
        } else {
            dispatch.run();
        }
    }

    private void dispatchEmail(NotificationRequest request) {
        try {
            Map<String, String> variables = request.variables();
            String html = emailTemplateService.render(request.eventType(), variables);
            String subject = subjectFor(request);
            String plainText = html.replaceAll("<[^>]*>", " ").replaceAll("\\s+", " ").trim();
            emailService.sendTemplateEmail(request.recipient(), subject, html, plainText,
                    request.eventType());
        } catch (Exception exception) {
            log.error("EMAIL_TEMPLATE_FAILED event={} entity={} error={}", request.eventType(),
                    request.relatedEntityId(), exception.getClass().getSimpleName());
        }
    }

    private String subjectFor(NotificationRequest request) {
        String apiName = request.variables().getOrDefault("apiName", "API Marketplace");
        return switch (request.eventType()) {
            case USER_REGISTERED -> "Welcome to API Marketplace";
            case FIRST_LOGIN -> "Welcome - Your First Login";
            case API_SUBMITTED -> "API Submitted for Review";
            case API_APPROVED -> "Your API Has Been Approved";
            case API_REJECTED -> "Your API Submission Needs Changes";
            case SUBSCRIPTION_PURCHASED -> "Subscription Confirmed - " + apiName;
            case SUBSCRIPTION_EXPIRING -> "Your Subscription Expires in 3 Days";
            case SUBSCRIPTION_EXPIRED -> "Your Subscription Has Expired";
            case SUBSCRIPTION_CANCELLED -> "Subscription Cancelled";
            case API_KEY_CREATED -> "Your API Key Is Ready";
            case API_KEY_REGENERATED -> "Your API Key Was Regenerated";
            case API_KEY_REVOKED -> "Your API Key Was Revoked";
        };
    }
}