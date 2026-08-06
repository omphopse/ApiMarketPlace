package com.marketplace.repository;

import com.marketplace.entity.UsageLog;
import com.marketplace.entity.User;
import java.time.LocalDateTime;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface UsageLogRepository extends JpaRepository<UsageLog, Long> {
    long countByConsumer(User consumer);

    @Query("select count(u) from UsageLog u where u.consumer = :consumer and u.timestamp >= :start")
    long countByConsumerSince(@Param("consumer") User consumer, @Param("start") LocalDateTime start);

    List<UsageLog> findTop10ByConsumerOrderByTimestampDesc(User consumer);
}
