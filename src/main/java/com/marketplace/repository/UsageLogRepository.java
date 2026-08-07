package com.marketplace.repository;

import com.marketplace.entity.UsageLog;
import com.marketplace.entity.User;
import java.time.LocalDateTime;
import java.util.List;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;

public interface UsageLogRepository extends MongoRepository<UsageLog, Long> {
    long countByConsumer(User consumer);

    @Query(value = "{ 'consumer': ?0, 'timestamp': { $gte: ?1 } }", count = true)
    long countByConsumerSince(User consumer, LocalDateTime start);

    @Query("{ 'consumer': ?0 }")
    List<UsageLog> findTop10ByConsumerOrderByTimestampDesc(User consumer);
}
