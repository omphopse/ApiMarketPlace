package com.marketplace.notification.email;

import java.io.IOException;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.mail.javamail.JavaMailSenderImpl;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import jakarta.annotation.PostConstruct;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailNotificationService implements EmailService {
    private final JavaMailSender mailSender;
    private final EmailTemplateService templateService;

    @Value("${mail.enabled:false}")
    private boolean mailEnabled;

    @Value("${spring.mail.username:}")
    private String senderAddress;

    @Value("${spring.mail.password:}")
    private String mailPassword;

    @PostConstruct
    void validateConfiguration() {
        if (mailEnabled && (senderAddress == null || senderAddress.isBlank()
                || mailPassword == null || mailPassword.isBlank())) {
            throw new IllegalStateException("MAIL_USERNAME and MAIL_PASSWORD must be configured when MAIL_ENABLED=true");
        }
    }

    @Override
    @Async
    public void sendTemplateEmail(String recipient, String subject, String htmlBody, String plainTextBody,
                                  EmailEventType eventType) {
        if (!mailEnabled) {
            log.info("EMAIL_DISABLED event={} recipient={}", eventType, maskEmail(recipient));
            return;
        }
        try {
            configureSmtpCredentials();
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            helper.setFrom(senderAddress);
            helper.setTo(recipient);
            helper.setSubject(subject);
            helper.setText(plainTextBody, htmlBody);
            mailSender.send(message);
            log.info("EMAIL_SENT event={} recipient={}", eventType, maskEmail(recipient));
        } catch (MessagingException | RuntimeException exception) {
            log.error("EMAIL_FAILED event={} recipient={} error={}", eventType, maskEmail(recipient),
                    exception.getClass().getSimpleName());
        }
    }

    public void sendSimpleEmail(String recipient, String subject, String body, EmailEventType eventType) {
        if (!mailEnabled) {
            log.info("EMAIL_DISABLED event={} recipient={}", eventType, maskEmail(recipient));
            return;
        }
        try {
            configureSmtpCredentials();
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(senderAddress);
            message.setTo(recipient);
            message.setSubject(subject);
            message.setText(body);
            mailSender.send(message);
            log.info("EMAIL_SENT event={} recipient={}", eventType, maskEmail(recipient));
        } catch (RuntimeException exception) {
            log.error("EMAIL_FAILED event={} recipient={} error={}", eventType, maskEmail(recipient),
                    exception.getClass().getSimpleName());
        }
    }

    public String render(EmailEventType eventType, Map<String, String> variables) throws IOException {
        return templateService.render(eventType, variables);
    }

    private void configureSmtpCredentials() {
        if (mailSender instanceof JavaMailSenderImpl sender) {
            sender.setUsername(senderAddress);
            sender.setPassword(mailPassword.replaceAll("\\s+", ""));
        }
    }

    private String maskEmail(String email) {
        if (email == null || !email.contains("@")) return "[invalid]";
        int at = email.indexOf('@');
        String local = email.substring(0, at);
        return (local.length() <= 2 ? "*" : local.substring(0, 2) + "***") + email.substring(at);
    }
}