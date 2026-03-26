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
        // Amount in paise (multiply by 100)
        int amountInPaise = (int) (request.getAmount() * 100);

        JSONObject orderRequest = new JSONObject();
        orderRequest.put("amount", amountInPaise);
        orderRequest.put("currency", "INR");
        orderRequest.put("receipt", "receipt_" + System.currentTimeMillis());

        Order razorpayOrder = razorpayClient.orders.create(orderRequest);

        // Save payment record
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
        try {
            // Verify signature
            JSONObject attributes = new JSONObject();
            attributes.put("razorpay_order_id", request.getRazorpayOrderId());
            attributes.put("razorpay_payment_id", request.getRazorpayPaymentId());
            attributes.put("razorpay_signature", request.getRazorpaySignature());

            boolean isValid = Utils.verifyPaymentSignature(attributes, razorpayKeySecret);

            Payment payment = paymentRepository.findByRazorpayOrderId(request.getRazorpayOrderId())
                    .orElseThrow(() -> new RuntimeException("Payment not found"));

            if (isValid) {
                payment.setRazorpayPaymentId(request.getRazorpayPaymentId());
                payment.setRazorpaySignature(request.getRazorpaySignature());
                payment.setStatus(Payment.PaymentStatus.SUCCESS);
                payment.setUpdatedAt(LocalDateTime.now());
                paymentRepository.save(payment);

                // Publish success event to RabbitMQ
                PaymentEventDTO event = new PaymentEventDTO(
                        payment.getId(),
                        payment.getInvestorId(),
                        payment.getFounderId(),
                        payment.getStartupId(),
                        payment.getStartupName(),
                        payment.getInvestorName(),
                        payment.getAmount(),
                        request.getRazorpayPaymentId(),
                        "SUCCESS"
                );
                rabbitTemplate.convertAndSend(RabbitMQConfig.PAYMENT_EXCHANGE, RabbitMQConfig.PAYMENT_SUCCESS_KEY, event);
                log.info("Payment success event published for paymentId: {}", payment.getId());

                // Send email notifications
                emailService.sendPaymentSuccessEmailToInvestor(payment);
                emailService.sendPaymentReceivedEmailToFounder(payment);

                response.put("success", true);
                response.put("message", "Payment verified successfully");
                response.put("paymentId", payment.getId());
            } else {
                payment.setStatus(Payment.PaymentStatus.FAILED);
                payment.setUpdatedAt(LocalDateTime.now());
                paymentRepository.save(payment);

                PaymentEventDTO event = new PaymentEventDTO(
                        payment.getId(),
                        payment.getInvestorId(),
                        payment.getFounderId(),
                        payment.getStartupId(),
                        payment.getStartupName(),
                        payment.getInvestorName(),
                        payment.getAmount(),
                        null,
                        "FAILED"
                );
                rabbitTemplate.convertAndSend(RabbitMQConfig.PAYMENT_EXCHANGE, RabbitMQConfig.PAYMENT_FAILED_KEY, event);

                response.put("success", false);
                response.put("message", "Payment verification failed");
            }
        } catch (Exception e) {
            log.error("Error verifying payment: {}", e.getMessage());
            response.put("success", false);
            response.put("message", "Error: " + e.getMessage());
        }
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
