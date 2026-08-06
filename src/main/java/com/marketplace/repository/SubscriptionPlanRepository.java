package com.marketplace.repository;

import com.marketplace.entity.SubscriptionPlan;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SubscriptionPlanRepository extends JpaRepository<SubscriptionPlan, Long> {
    List<SubscriptionPlan> findByApiId(Long apiId);
    Optional<SubscriptionPlan> findByIdAndApiId(Long id, Long apiId);
}
