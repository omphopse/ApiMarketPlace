package com.marketplace.service;

import com.marketplace.dto.CreatePaymentOrderRequest;
import com.marketplace.dto.PaymentOrderResponse;
import com.marketplace.dto.SubscriptionActivationResponse;

public interface PaymentService {
    PaymentOrderResponse createOrder(CreatePaymentOrderRequest request);
    SubscriptionActivationResponse verifyPayment(String subscriptionId, String razorpayPaymentId, String razorpayOrderId, String razorpaySignature);
}
