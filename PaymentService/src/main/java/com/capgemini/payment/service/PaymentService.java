package com.capgemini.payment.service;

import com.capgemini.payment.config.RabbitMQConfig;
import com.capgemini.payment.dto.CreateOrderRequest;
import com.capgemini.payment.dto.PaymentEventDTO;
import com.capgemini.payment.dto.VerifyPaymentRequest;
import com.capgemini.payment.entity.Payment;
import com.capgemini.payment.repository.PaymentRepository;
import com.razorpay.Order;
import com.razorpay.RazorpayClient;
import com.razorpay.RazorpayException;
import com.razorpay.Utils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.json.JSONObject;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class PaymentService {

    private final PaymentRepository paymentRepository;
    private final RazorpayClient razorpayClient;
    private final RabbitTemplate rabbitTemplate;
    private final EmailService emailService;

    @Value("${razorpay.key-id}")
    private String razorpayKeyId;

    @Value("${razorpay.key-secret}")
    private String razorpayKeySecret;

    public Map<String, Object> createOrder(CreateOrderRequest request) throws RazorpayException {
        int amountInPaise = (int) (request.getAmount() * 100);

        JSONObject orderRequest = new JSONObject();
        orderRequest.put("amount", amountInPaise);
        orderRequest.put("currency", "INR");
        orderRequest.put("receipt", "receipt_" + System.currentTimeMillis());

        Order razorpayOrder = razorpayClient.orders.create(orderRequest);

        Payment payment = new Payment();
        payment.setRazorpayOrderId(razorpayOrder.get("id"));
        payment.setInvestorId(request.getInvestorId());
        payment.setFounderId(request.getFounderId());
        payment.setStartupId(request.getStartupId());
        payment.setStartupName(request.getStartupName());
        payment.setInvestorName(request.getInvestorName());
        payment.setAmount(request.getAmount());
        payment.setStatus(Payment.PaymentStatus.PENDING);
        paymentRepository.save(payment);

        Map<String, Object> response = new HashMap<>();
        response.put("orderId", razorpayOrder.get("id"));
        response.put("amount", amountInPaise);
        response.put("currency", "INR");
        response.put("keyId", razorpayKeyId);
        return response;
    }

    public Map<String, Object> verifyPayment(VerifyPaymentRequest request) {
        Map<String, Object> response = new HashMap<>();

        // Step 1: Verify Razorpay signature
        boolean isValid;
        try {
            JSONObject attributes = new JSONObject();
            attributes.put("razorpay_order_id", request.getRazorpayOrderId());
            attributes.put("razorpay_payment_id", request.getRazorpayPaymentId());
            attributes.put("razorpay_signature", request.getRazorpaySignature());
            isValid = Utils.verifyPaymentSignature(attributes, razorpayKeySecret);
        } catch (Exception e) {
            log.error("Signature verification error: {}", e.getMessage());
            response.put("success", false);
            response.put("message", "Signature verification error: " + e.getMessage());
            return response;
        }

        // Step 2: Find payment record
        Payment payment;
        try {
            payment = paymentRepository.findByRazorpayOrderId(request.getRazorpayOrderId())
                    .orElseThrow(() -> new RuntimeException("Payment record not found for order: " + request.getRazorpayOrderId()));
        } catch (Exception e) {
            log.error("Payment lookup error: {}", e.getMessage());
            response.put("success", false);
            response.put("message", e.getMessage());
            return response;
        }

        // Step 3: Razorpay verified — save as AWAITING_APPROVAL (founder must accept)
        if (isValid) {
            payment.setRazorpayPaymentId(request.getRazorpayPaymentId());
            payment.setRazorpaySignature(request.getRazorpaySignature());
            payment.setStatus(Payment.PaymentStatus.AWAITING_APPROVAL);
            payment.setUpdatedAt(LocalDateTime.now());
            paymentRepository.save(payment);
            log.info("Payment Razorpay-verified, awaiting founder approval. paymentId={}", payment.getId());

            // Notify founder to review (non-critical)
            try {
                PaymentEventDTO event = new PaymentEventDTO(
                        payment.getId(), payment.getInvestorId(), payment.getFounderId(),
                        payment.getStartupId(), payment.getStartupName(), payment.getInvestorName(),
                        payment.getAmount(), request.getRazorpayPaymentId(), "AWAITING_APPROVAL"
                );
                rabbitTemplate.convertAndSend(RabbitMQConfig.PAYMENT_EXCHANGE, RabbitMQConfig.PAYMENT_PENDING_KEY, event);
            } catch (Exception e) {
                log.warn("RabbitMQ unavailable: {}", e.getMessage());
            }

            response.put("success", true);
            response.put("message", "Payment received. Awaiting founder approval.");
            response.put("paymentId", payment.getId());
            response.put("status", "AWAITING_APPROVAL");
        } else {
            payment.setStatus(Payment.PaymentStatus.FAILED);
            payment.setUpdatedAt(LocalDateTime.now());
            paymentRepository.save(payment);
            log.warn("Payment signature invalid for orderId: {}", request.getRazorpayOrderId());
            response.put("success", false);
            response.put("message", "Payment signature invalid");
        }
        return response;
    }

    // Founder accepts the investment — fires notifications and emails
    public Map<String, Object> acceptPayment(Long paymentId) {
        Map<String, Object> response = new HashMap<>();
        Payment payment = paymentRepository.findById(paymentId)
                .orElseThrow(() -> new RuntimeException("Payment not found"));

        payment.setStatus(Payment.PaymentStatus.SUCCESS);
        payment.setUpdatedAt(LocalDateTime.now());
        paymentRepository.save(payment);
        log.info("Founder accepted payment. paymentId={}", paymentId);

        // Publish success event → NotificationService sends in-app notifications
        try {
            PaymentEventDTO event = new PaymentEventDTO(
                    payment.getId(), payment.getInvestorId(), payment.getFounderId(),
                    payment.getStartupId(), payment.getStartupName(), payment.getInvestorName(),
                    payment.getAmount(), payment.getRazorpayPaymentId(), "SUCCESS"
            );
            rabbitTemplate.convertAndSend(RabbitMQConfig.PAYMENT_EXCHANGE, RabbitMQConfig.PAYMENT_SUCCESS_KEY, event);
        } catch (Exception e) {
            log.warn("RabbitMQ unavailable: {}", e.getMessage());
        }

        // Send emails
        try {
            emailService.sendPaymentSuccessEmailToInvestor(payment);
            emailService.sendPaymentReceivedEmailToFounder(payment);
        } catch (Exception e) {
            log.warn("Email sending failed: {}", e.getMessage());
        }

        response.put("success", true);
        response.put("message", "Investment accepted successfully");
        return response;
    }

    // Founder rejects the investment
    public Map<String, Object> rejectPayment(Long paymentId) {
        Map<String, Object> response = new HashMap<>();
        Payment payment = paymentRepository.findById(paymentId)
                .orElseThrow(() -> new RuntimeException("Payment not found"));

        payment.setStatus(Payment.PaymentStatus.REJECTED);
        payment.setUpdatedAt(LocalDateTime.now());
        paymentRepository.save(payment);
        log.info("Founder rejected payment. paymentId={}", paymentId);

        response.put("success", true);
        response.put("message", "Investment rejected");
        return response;
    }

    public List<Payment> getPaymentsByInvestor(Long investorId) {
        return paymentRepository.findByInvestorIdOrderByCreatedAtDesc(investorId);
    }

    public List<Payment> getPaymentsByFounder(Long founderId) {
        return paymentRepository.findByFounderIdOrderByCreatedAtDesc(founderId);
    }

    public List<Payment> getPaymentsByStartup(Long startupId) {
        return paymentRepository.findByStartupIdOrderByCreatedAtDesc(startupId);
    }
}
