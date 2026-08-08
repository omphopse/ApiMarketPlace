package com.marketplace.mapper;

import org.springframework.stereotype.Component;

import com.marketplace.dto.PaymentResponse;
import com.marketplace.entity.Payment;

@Component
public class PaymentMapper {

    public PaymentResponse toResponse(Payment payment) {

    	return PaymentResponse.builder()
    	        .id(payment.getId())
    	        .consumerId(payment.getConsumerId())
    	        .providerId(payment.getProviderId())
    	        .apiId(payment.getApiId())
    	        .subscriptionId(payment.getSubscriptionId())
    	        .planName(payment.getPlanName())
    	        .amount(payment.getAmount())
    	        .currency(payment.getCurrency())
    	        .paymentStatus(payment.getPaymentStatus())
    	        .paymentMethod(payment.getPaymentMethod())
    	        .razorpayOrderId(payment.getRazorpayOrderId())
    	        .transactionId(payment.getTransactionId())
    	        .createdAt(payment.getCreatedAt())
    	        .updatedAt(payment.getUpdatedAt())
    	        .build();
    }
}