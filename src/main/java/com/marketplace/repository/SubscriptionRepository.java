package com.marketplace.repository;

import com.marketplace.entity.Api;
import com.marketplace.entity.Subscription;
import com.marketplace.entity.SubscriptionStatus;
import com.marketplace.entity.User;
import java.util.List;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import java.time.LocalDateTime;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface SubscriptionRepository extends MongoRepository<Subscription, String> {
    boolean existsByConsumerAndApiAndStatusIn(User consumer, Api api, List<SubscriptionStatus> statuses);
    Optional<Subscription> findByIdAndConsumer(String id, User consumer);
    Page<Subscription> findByConsumerOrderByCreatedAtDesc(User consumer, Pageable pageable);
    Page<Subscription> findByConsumerAndStatusOrderByCreatedAtDesc(User consumer, SubscriptionStatus status, Pageable pageable);
    long countByConsumer(User consumer);
    long countByConsumerAndStatus(User consumer, SubscriptionStatus status);
    long countByApi_IdAndStatus(String apiId, SubscriptionStatus status);
    Page<Subscription> findByApi_Id(String apiId, Pageable pageable);
    List<Subscription> findByApi_IdAndStatus(String apiId, SubscriptionStatus status);
    List<Subscription> findByStatusAndExpiresAtBetween(SubscriptionStatus status, LocalDateTime from, LocalDateTime to);
}
