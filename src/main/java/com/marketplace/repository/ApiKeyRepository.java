package com.marketplace.repository;

import com.marketplace.entity.ApiKey;
import com.marketplace.entity.Subscription;
import com.marketplace.entity.User;
import java.util.List;
import java.util.Optional;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface ApiKeyRepository extends MongoRepository<ApiKey, String> {
    List<ApiKey> findByConsumerOrderByCreatedAtDesc(User consumer);
    Optional<ApiKey> findBySubscriptionAndConsumer(Subscription subscription, User consumer);
    Optional<ApiKey> findByIdAndConsumer(String id, User consumer);
    List<ApiKey> findBySubscription(Subscription subscription);
}
