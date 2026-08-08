package com.marketplace.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.mongodb.repository.MongoRepository;

import com.marketplace.entity.Payment;
import com.marketplace.entity.PaymentStatus;

public interface PaymentRepository
        extends MongoRepository<Payment, Long> {

    List<Payment> findByConsumerId(Long consumerId);

    List<Payment> findByProviderId(Long providerId);

    List<Payment> findByApiId(Long apiId);

    List<Payment> findBySubscriptionId(Long subscriptionId);

    List<Payment> findByPaymentStatus(
            PaymentStatus paymentStatus);

    Optional<Payment> findByTransactionId(
            String transactionId);

    Optional<Payment> findByRazorpayOrderId(
            String razorpayOrderId);
}