package com.marketplace.service.impl;

import java.math.BigDecimal;
import java.util.List;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import com.marketplace.constants.AppConstants;
import com.marketplace.dto.PaymentRequest;
import com.marketplace.dto.PaymentResponse;
import com.marketplace.dto.PaymentVerificationRequest;
import com.marketplace.dto.RevenueResponse;
import com.marketplace.entity.Payment;
import com.marketplace.entity.PaymentStatus;
import com.marketplace.entity.User;
import com.marketplace.exception.ResourceNotFoundException;
import com.marketplace.mapper.PaymentMapper;
import com.marketplace.repository.PaymentRepository;
import com.marketplace.repository.UserRepository;
import com.marketplace.service.PaymentService;
import com.marketplace.service.SequenceGeneratorService;

import org.json.JSONObject;

import com.razorpay.Order;
import com.razorpay.RazorpayClient;
import com.razorpay.RazorpayException;
import com.razorpay.Utils;

import lombok.RequiredArgsConstructor;


@Service
@RequiredArgsConstructor
public class PaymentServiceImpl implements PaymentService {

    private final PaymentRepository paymentRepository;
    private final UserRepository userRepository;
    private final PaymentMapper paymentMapper;
    private final SequenceGeneratorService sequenceGeneratorService;
    private final RazorpayClient razorpayClient;

    @Value("${razorpay.key.secret}")
    private String razorpayKeySecret;

    @Override
    public PaymentResponse createPayment(PaymentRequest request) {

        // 1. Get logged-in user's email from JWT
        Authentication authentication =
                SecurityContextHolder.getContext().getAuthentication();

        String email = authentication.getName();

        // 2. Find consumer
        User consumer = userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Consumer not found"));

        // 3. Verify consumer role
        if (!AppConstants.ROLE_CONSUMER.equals(
                consumer.getRole().getName())) {

            throw new IllegalArgumentException(
                    "Only consumers can make payments.");
        }

        // 4. Generate payment ID
        Long paymentId =
                sequenceGeneratorService
                        .generateSequence("payment_sequence");

        try {

            // 5. Convert amount to smallest currency unit
            long amountInPaise = request.getAmount()
                    .multiply(BigDecimal.valueOf(100))
                    .longValueExact();

            // 6. Create Razorpay order request
            JSONObject orderRequest = new JSONObject();

            orderRequest.put("amount", amountInPaise);
            orderRequest.put("currency", request.getCurrency());
            orderRequest.put(
                    "receipt",
                    "payment_" + paymentId
            );

            // 7. Create order in Razorpay
            Order razorpayOrder =
                    razorpayClient.orders.create(orderRequest);

            // 8. Get Razorpay Order ID
            String razorpayOrderId =
                    razorpayOrder.get("id");

            // 9. Create Payment document
            Payment payment = Payment.builder()
                    .id(paymentId)
                    .consumerId(consumer.getId())
                    .apiId(request.getApiId())
                    .subscriptionId(request.getSubscriptionId())
                    .planName(request.getPlanName())
                    .amount(request.getAmount())
                    .currency(request.getCurrency())
                    .paymentStatus(PaymentStatus.PENDING)
                    .paymentMethod(request.getPaymentMethod())
                    .razorpayOrderId(razorpayOrderId)
                    .transactionId(null)
                    .build();

            // 10. Save payment in MongoDB
            Payment savedPayment =
                    paymentRepository.save(payment);

            // 11. Return response
            return paymentMapper.toResponse(savedPayment);

        } catch (RazorpayException e) {

            throw new RuntimeException(
                    "Unable to create Razorpay order",
                    e
            );
        }
    }


    @Override
    public PaymentResponse verifyPayment(
            PaymentVerificationRequest request) {

        // 1. Get logged-in user's email from JWT
        Authentication authentication =
                SecurityContextHolder.getContext()
                        .getAuthentication();

        String email = authentication.getName();

        // 2. Find logged-in consumer
        User consumer = userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Consumer not found"));

        // 3. Find payment using Razorpay Order ID
        Payment payment = paymentRepository
                .findByRazorpayOrderId(
                        request.getRazorpayOrderId())
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Payment not found"));

        // 4. Check that this payment belongs to
        //    the logged-in consumer
        if (!payment.getConsumerId()
                .equals(consumer.getId())) {

            throw new IllegalArgumentException(
                    "You are not authorized to verify this payment.");
        }

        // 5. Make sure payment isn't already successful
        if (payment.getPaymentStatus()
                == PaymentStatus.SUCCESS) {

            throw new IllegalArgumentException(
                    "Payment has already been verified.");
        }

        try {

            // 6. Create verification payload
            String payload =
                    request.getRazorpayOrderId()
                            + "|"
                            + request.getRazorpayPaymentId();

            // 7. Verify Razorpay signature
            boolean isValid =
                    Utils.verifySignature(
                            payload,
                            request.getRazorpaySignature(),
                            razorpayKeySecret);

            // 8. Invalid signature
            if (!isValid) {

                payment.setPaymentStatus(
                        PaymentStatus.FAILED);

                paymentRepository.save(payment);

                throw new IllegalArgumentException(
                        "Invalid payment signature.");
            }

            // 9. Valid payment
            payment.setPaymentStatus(
                    PaymentStatus.SUCCESS);

            payment.setTransactionId(
                    request.getRazorpayPaymentId());

            // 10. Save updated payment
            Payment updatedPayment =
                    paymentRepository.save(payment);

            // 11. Return response
            return paymentMapper.toResponse(
                    updatedPayment);

        } catch (RazorpayException e) {

            throw new RuntimeException(
                    "Payment verification failed.",
                    e);
        }
    }
    
    @Override
    public List<PaymentResponse> getMyPayments() {

        Authentication authentication =
                SecurityContextHolder.getContext()
                        .getAuthentication();

        String email = authentication.getName();

        User consumer = userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Consumer not found"));

        return paymentRepository
                .findByConsumerId(consumer.getId())
                .stream()
                .map(paymentMapper::toResponse)
                .toList();
    }
    
    @Override
    public PaymentResponse getPaymentById(Long id) {

        Authentication authentication =
                SecurityContextHolder.getContext()
                        .getAuthentication();

        String email = authentication.getName();

        User consumer = userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Consumer not found"));

        Payment payment = paymentRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Payment not found with id: " + id));

        // Security check
        if (!payment.getConsumerId()
                .equals(consumer.getId())) {

            throw new IllegalArgumentException(
                    "You are not authorized to view this payment.");
        }

        return paymentMapper.toResponse(payment);
    }
    
    @Override
    public List<PaymentResponse> getAllPayments() {

        return paymentRepository.findAll()
                .stream()
                .map(paymentMapper::toResponse)
                .toList();
    }
    
    @Override
    public PaymentResponse getPaymentByIdForAdmin(Long id) {

        Payment payment = paymentRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Payment not found with id: " + id));

        return paymentMapper.toResponse(payment);
    }
    
    @Override
    public RevenueResponse getRevenue() {

        List<Payment> successfulPayments =
                paymentRepository.findByPaymentStatus(
                        PaymentStatus.SUCCESS);

        List<Payment> pendingPayments =
                paymentRepository.findByPaymentStatus(
                        PaymentStatus.PENDING);

        List<Payment> failedPayments =
                paymentRepository.findByPaymentStatus(
                        PaymentStatus.FAILED);

        BigDecimal totalRevenue =
                successfulPayments.stream()
                        .map(Payment::getAmount)
                        .reduce(
                                BigDecimal.ZERO,
                                BigDecimal::add);

        return RevenueResponse.builder()
                .totalRevenue(totalRevenue)
                .totalPayments(
                        paymentRepository.count())
                .successfulPayments(
                        successfulPayments.size())
                .pendingPayments(
                        pendingPayments.size())
                .failedPayments(
                        failedPayments.size())
                .build();
    }

}