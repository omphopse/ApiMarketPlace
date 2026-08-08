package com.marketplace.service;

import java.util.List;

import com.marketplace.dto.PaymentRequest;
import com.marketplace.dto.PaymentResponse;
import com.marketplace.dto.PaymentVerificationRequest;
import com.marketplace.dto.RevenueResponse;

public interface PaymentService {

    PaymentResponse createPayment(PaymentRequest request);

    PaymentResponse verifyPayment(
            PaymentVerificationRequest request);

    List<PaymentResponse> getMyPayments();

    PaymentResponse getPaymentById(Long id);
    
    List<PaymentResponse> getAllPayments();
    
    PaymentResponse getPaymentByIdForAdmin(Long id);
    
    RevenueResponse getRevenue();
}