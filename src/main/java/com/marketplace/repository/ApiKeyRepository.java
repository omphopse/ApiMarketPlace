package com.marketplace.repository;

import com.marketplace.entity.ApiKey;
import com.marketplace.entity.Subscription;
import com.marketplace.entity.User;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ApiKeyRepository extends JpaRepository<ApiKey, Long> {
    List<ApiKey> findByConsumerOrderByCreatedAtDesc(User consumer);
    Optional<ApiKey> findBySubscriptionAndConsumer(Subscription subscription, User consumer);
    Optional<ApiKey> findByIdAndConsumer(Long id, User consumer);
    List<ApiKey> findBySubscription(Subscription subscription);
}
