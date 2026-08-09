package com.marketplace.service.impl;

import com.marketplace.config.RazorpayConfig;
import com.marketplace.dto.CreatePaymentOrderRequest;
import com.marketplace.dto.PaymentOrderResponse;
import com.marketplace.dto.SubscriptionActivationResponse;
import com.marketplace.entity.Api;
import com.marketplace.entity.ApiStatus;
import com.marketplace.entity.Payment;
import com.marketplace.entity.PaymentStatus;
import com.marketplace.entity.Subscription;
import com.marketplace.entity.SubscriptionPlan;
import com.marketplace.entity.SubscriptionStatus;
import com.marketplace.entity.User;
import com.marketplace.exception.ApiNotAvailableException;
import com.marketplace.exception.InvalidSubscriptionStateException;
import com.marketplace.exception.PlanNotAvailableException;
import com.marketplace.exception.ResourceNotFoundException;
import com.marketplace.exception.UnauthorizedResourceAccessException;
import com.marketplace.repository.PaymentRepository;
import com.marketplace.repository.SubscriptionRepository;
import com.marketplace.repository.UserRepository;
import com.marketplace.service.ConsumerService;
import com.marketplace.service.PaymentService;
import com.razorpay.Order;
import com.razorpay.OrderClient;
import com.razorpay.RazorpayClient;
import com.razorpay.RazorpayException;
import com.razorpay.Utils;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.json.JSONObject;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class PaymentServiceImpl implements PaymentService {
    private final RazorpayConfig config;
    private final PaymentRepository paymentRepository;
    private final SubscriptionRepository subscriptionRepository;
    private final UserRepository userRepository;
    private final ConsumerService consumerService;

    @Override
    @Transactional
    public PaymentOrderResponse createOrder(CreatePaymentOrderRequest request) {
        Subscription subscription = subscriptionRepository.findById(request.getSubscriptionId())
                .orElseThrow(() -> new ResourceNotFoundException("Subscription not found"));
        User consumer = getCurrentUser();
        if (!subscription.getConsumer().getId().equals(consumer.getId())) {
            throw new UnauthorizedResourceAccessException("Subscription does not belong to current consumer");
        }
        if (subscription.getStatus() != SubscriptionStatus.PENDING) {
            throw new InvalidSubscriptionStateException("Subscription must be pending to create a payment order");
        }
        SubscriptionPlan plan = subscription.getSubscriptionPlan();
        if (plan == null) {
            throw new PlanNotAvailableException("Subscription plan not found");
        }
        if (!plan.isActive()) {
            throw new PlanNotAvailableException("Subscription plan is inactive");
        }
        Api api = subscription.getApi();
        if (api == null || api.getStatus() != ApiStatus.APPROVED) {
            throw new ApiNotAvailableException("API is not available");
        }

        BigDecimal amount = plan.getPrice();
        if (amount == null || amount.compareTo(BigDecimal.ZERO) < 0) {
            throw new IllegalStateException("Subscription plan price is invalid");
        }
        long amountInPaise = amount.multiply(BigDecimal.valueOf(100)).setScale(0, RoundingMode.UNNECESSARY).longValueExact();

        try {
            RazorpayClient client = new RazorpayClient(config.getKeyId(), config.getKeySecret());
            JSONObject orderRequest = new JSONObject();
            orderRequest.put("amount", amountInPaise);
            orderRequest.put("currency", config.getCurrency());
            // Razorpay receipt max length is 40 chars. Build a short receipt using trimmed ids.
            String subId = subscription.getId() != null ? subscription.getId() : "sub";
            String consumerId = consumer.getId() != null ? consumer.getId() : "c";
            String shortSub = subId.length() > 8 ? subId.substring(0, 8) : subId;
            String shortCons = consumerId.length() > 8 ? consumerId.substring(0, 8) : consumerId;
            String receipt = String.format("sub_%s_c_%s", shortSub, shortCons);
            if (receipt.length() > 40) {
                receipt = receipt.substring(0, 40);
            }
            orderRequest.put("receipt", receipt);
            orderRequest.put("payment_capture", 1);
            // add useful notes for debugging without exceeding receipt limits
            JSONObject notes = new JSONObject();
            notes.put("subscriptionId", subscription.getId());
            notes.put("consumerId", consumer.getId());
            orderRequest.put("notes", notes);
            Order razorpayOrder = client.orders.create(orderRequest);

            Payment payment = Payment.builder()
                    .consumerId(consumer.getId())
                    .subscriptionId(subscription.getId())
                    .apiId(api.getId())
                    .planId(plan.getId())
                    .razorpayOrderId(razorpayOrder.get("id"))
                    .amount(amount)
                    .currency(config.getCurrency())
                    .status(PaymentStatus.CREATED)
                    .build();
            paymentRepository.save(payment);

            return PaymentOrderResponse.builder()
                    .orderId(razorpayOrder.get("id"))
                    .amount(amountInPaise)
                    .currency(config.getCurrency())
                    .keyId(config.getKeyId())
                    .paymentId(payment.getId())
                    .build();
        } catch (RazorpayException ex) {
            throw new IllegalStateException("Unable to create Razorpay order", ex);
        }
    }

    @Override
    @Transactional
    public SubscriptionActivationResponse verifyPayment(String subscriptionId, String razorpayPaymentId, String razorpayOrderId, String razorpaySignature) {
        Subscription subscription = subscriptionRepository.findById(subscriptionId)
                .orElseThrow(() -> new ResourceNotFoundException("Subscription not found"));
        User consumer = getCurrentUser();
        if (!subscription.getConsumer().getId().equals(consumer.getId())) {
            throw new UnauthorizedResourceAccessException("Subscription does not belong to current consumer");
        }
        if (subscription.getStatus() != SubscriptionStatus.PENDING) {
            throw new InvalidSubscriptionStateException("Subscription is not pending");
        }

        Payment payment = paymentRepository.findByRazorpayOrderId(razorpayOrderId)
                .orElseThrow(() -> new ResourceNotFoundException("Payment order not found"));
        if (!payment.getSubscriptionId().equals(subscriptionId)) {
            throw new UnauthorizedResourceAccessException("Payment does not belong to this subscription");
        }
        if (payment.getStatus() == PaymentStatus.SUCCESS) {
            if (subscription.getStatus() == SubscriptionStatus.ACTIVE) {
                return buildActivationResponse(subscription);
            }
            return consumerService.activateSubscription(subscriptionId);
        }
        if (payment.getStatus() == PaymentStatus.FAILED) {
            throw new InvalidSubscriptionStateException("Payment has already failed");
        }

        try {
            JSONObject signatureAttributes = new JSONObject();
            signatureAttributes.put("razorpay_order_id", razorpayOrderId);
            signatureAttributes.put("razorpay_payment_id", razorpayPaymentId);
            signatureAttributes.put("razorpay_signature", razorpaySignature);
            Utils.verifyPaymentSignature(signatureAttributes, config.getKeySecret());
        } catch (Exception ex) {
            payment.setStatus(PaymentStatus.FAILED);
            payment.setRazorpayPaymentId(razorpayPaymentId);
            payment.setRazorpaySignature(razorpaySignature);
            payment.setFailureReason("Signature verification failed");
            payment.setUpdatedAt(LocalDateTime.now());
            paymentRepository.save(payment);
            throw new InvalidSubscriptionStateException("Payment verification failed");
        }

        payment.setStatus(PaymentStatus.SUCCESS);
        payment.setRazorpayPaymentId(razorpayPaymentId);
        payment.setRazorpaySignature(razorpaySignature);
        payment.setPaidAt(LocalDateTime.now());
        payment.setUpdatedAt(LocalDateTime.now());
        paymentRepository.save(payment);

        return consumerService.activateSubscription(subscriptionId);
    }

    private SubscriptionActivationResponse buildActivationResponse(Subscription subscription) {
        return SubscriptionActivationResponse.builder()
                .subscriptionId(subscription.getId())
                .status(subscription.getStatus().name())
                .apiKey(null)
                .build();
    }

    private User getCurrentUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }
}
