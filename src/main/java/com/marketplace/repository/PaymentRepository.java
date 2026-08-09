package com.marketplace.repository;

import com.marketplace.entity.Payment;
import com.marketplace.entity.PaymentStatus;
import java.util.List;
import java.util.Optional;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface PaymentRepository extends MongoRepository<Payment, String> {
    Optional<Payment> findFirstBySubscriptionIdAndStatusOrderByCreatedAtDesc(String subscriptionId, PaymentStatus status);
    Optional<Payment> findByRazorpayOrderId(String razorpayOrderId);
    List<Payment> findByConsumerIdOrderByCreatedAtDesc(String consumerId);
}
