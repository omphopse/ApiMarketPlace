package com.marketplace.repository;

import com.marketplace.entity.SubscriptionPlan;
import java.util.List;
import java.util.Optional;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface SubscriptionPlanRepository extends MongoRepository<SubscriptionPlan, String> {
    List<SubscriptionPlan> findByApiId(String apiId);
    Optional<SubscriptionPlan> findByIdAndApiId(String id, String apiId);
}
