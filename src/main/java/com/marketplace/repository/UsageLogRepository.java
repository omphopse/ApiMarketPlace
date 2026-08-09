package com.marketplace.repository;

import com.marketplace.entity.Subscription;
import com.marketplace.entity.UsageLog;
import com.marketplace.entity.User;
import java.time.LocalDateTime;
import java.util.List;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;

public interface UsageLogRepository extends MongoRepository<UsageLog, String> {
    long countByConsumer(User consumer);

    @Query(value = "{ 'consumer': ?0, 'timestamp': { $gte: ?1 } }", count = true)
    long countByConsumerSince(User consumer, LocalDateTime start);

    @Query(value = "{ 'subscription': ?0, 'timestamp': { $gte: ?1 } }", count = true)
    long countBySubscriptionAndTimestampAfter(Subscription subscription, LocalDateTime start);

    @Query(value = "{ 'consumer': ?0, 'timestamp': { $gte: ?1 } }", count = true)
    long countByConsumerIdAndTimestampAfter(String consumerId, LocalDateTime start);

    @Query(value = "{ 'subscription': ?0, 'timestamp': { $gte: ?1 } }", count = true)
    long countBySubscriptionIdAndTimestampAfter(String subscriptionId, LocalDateTime start);

    @Query(value = "{ 'consumer': ?0 }", sort = "{ 'timestamp': -1 }")
    List<UsageLog> findTop10ByConsumerIdOrderByTimestampDesc(String consumerId);

    List<UsageLog> findTop10ByConsumerOrderByTimestampDesc(User consumer);

    List<UsageLog> findTop10BySubscriptionOrderByTimestampDesc(Subscription subscription);

    List<UsageLog> findTop10BySubscriptionIdAndTimestampAfterOrderByTimestampDesc(String subscriptionId, LocalDateTime start);

    @Query("{ 'subscription': ?0, 'timestamp': { $gte: ?1 } }")
    List<UsageLog> findBySubscriptionAndTimestampAfter(Subscription subscription, LocalDateTime start);

    List<UsageLog> findBySubscriptionIdAndTimestampAfter(String subscriptionId, LocalDateTime start);

    @Query("{ 'consumer': ?0, 'timestamp': { $gte: ?1 } }")
    List<UsageLog> findByConsumerAndTimestampAfter(User consumer, LocalDateTime start);

    List<UsageLog> findByConsumerIdAndTimestampAfter(String consumerId, LocalDateTime start);

    long countByApi_Id(String apiId);
}
