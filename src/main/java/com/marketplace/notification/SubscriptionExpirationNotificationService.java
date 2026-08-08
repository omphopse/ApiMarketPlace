package com.marketplace.notification;

import com.marketplace.entity.Subscription;
import com.marketplace.entity.SubscriptionStatus;
import com.marketplace.notification.email.EmailEventType;
import com.marketplace.notification.email.NotificationRequest;
import com.marketplace.repository.SubscriptionRepository;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.data.mongodb.core.query.Update;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class SubscriptionExpirationNotificationService {
    private final SubscriptionRepository subscriptionRepository;
    private final MongoTemplate mongoTemplate;
    private final NotificationService notificationService;

    @Value("${notification.time-zone:Asia/Kolkata}")
    private String timeZone;

    @Scheduled(cron = "${notification.subscription-expiry-check-cron:0 0 9 * * *}", zone = "${notification.time-zone:Asia/Kolkata}")
    public void checkSubscriptions() {
        LocalDate today = LocalDate.now(java.time.ZoneId.of(timeZone));
        LocalDateTime start = today.plusDays(3).atStartOfDay();
        LocalDateTime end = start.plusDays(1);
        subscriptionRepository.findByStatusAndExpiresAtBetween(SubscriptionStatus.ACTIVE, start, end)
                .forEach(this::sendExpirationWarning);

        subscriptionRepository.findByStatusAndExpiresAtBetween(SubscriptionStatus.ACTIVE,
                        LocalDateTime.now().minusYears(100), LocalDateTime.now()).forEach(this::expireSubscription);
    }

    private void sendExpirationWarning(Subscription subscription) {
        Query query = Query.query(Criteria.where("_id").is(subscription.getId())
                .and("status").is(SubscriptionStatus.ACTIVE).and("expirationWarning3DaysSent").is(false));
        if (mongoTemplate.updateFirst(query, new Update().set("expirationWarning3DaysSent", true), Subscription.class)
                .getModifiedCount() != 1) return;
        notificationService.notify(new NotificationRequest(EmailEventType.SUBSCRIPTION_EXPIRING,
                subscription.getConsumer().getEmail(), subscription.getConsumer().getFullName(), subscription.getId(),
                Map.of("userName", subscription.getConsumer().getFullName(), "apiName", subscription.getApi().getName(),
                        "planName", subscription.getSubscriptionPlan().getPlanName(), "endDate", String.valueOf(subscription.getExpiresAt()))));
    }

    private void expireSubscription(Subscription subscription) {
        Query query = Query.query(Criteria.where("_id").is(subscription.getId())
                .and("status").is(SubscriptionStatus.ACTIVE).and("expirationEmailSent").is(false));
        Update update = new Update().set("status", SubscriptionStatus.EXPIRED).set("expirationEmailSent", true);
        if (mongoTemplate.updateFirst(query, update, Subscription.class).getModifiedCount() != 1) return;
        notificationService.notify(new NotificationRequest(EmailEventType.SUBSCRIPTION_EXPIRED,
                subscription.getConsumer().getEmail(), subscription.getConsumer().getFullName(), subscription.getId(),
                Map.of("userName", subscription.getConsumer().getFullName(), "apiName", subscription.getApi().getName(),
                        "planName", subscription.getSubscriptionPlan().getPlanName())));
    }
}