package com.marketplace.controller;

import com.marketplace.dto.CreatePaymentOrderRequest;
import com.marketplace.dto.PaymentOrderResponse;
import com.marketplace.dto.SubscriptionActivationResponse;
import com.marketplace.service.PaymentService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/consumer/payments")
@RequiredArgsConstructor
@PreAuthorize("hasRole('CONSUMER')")
@Tag(name = "Consumer Payments", description = "Consumer-facing Razorpay payment operations")
public class PaymentController {
    private final PaymentService paymentService;

    @Operation(summary = "Create a Razorpay order for a pending subscription")
    @PostMapping("/create-order")
    public ResponseEntity<PaymentOrderResponse> createOrder(@Valid @RequestBody CreatePaymentOrderRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(paymentService.createOrder(request));
    }

    @Operation(summary = "Verify a Razorpay payment and activate the subscription")
    @PostMapping("/verify")
    public ResponseEntity<SubscriptionActivationResponse> verifyPayment(@RequestBody VerifyPaymentRequest request) {
        return ResponseEntity.ok(paymentService.verifyPayment(request.subscriptionId(), request.razorpayPaymentId(), request.razorpayOrderId(), request.razorpaySignature()));
    }

    private static record VerifyPaymentRequest(
            String subscriptionId,
            String razorpayPaymentId,
            String razorpayOrderId,
            String razorpaySignature
    ) {
    }
}
