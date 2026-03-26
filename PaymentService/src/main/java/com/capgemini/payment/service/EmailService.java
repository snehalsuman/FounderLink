package com.capgemini.payment.service;

import com.capgemini.payment.entity.Payment;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailService {

    private final JavaMailSender mailSender;

    @Value("${spring.mail.username}")
    private String fromEmail;

    public void sendPaymentSuccessEmailToInvestor(Payment payment) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(fromEmail); // replace with investor email lookup if available
            message.setSubject("✅ Payment Successful - FounderLink");
            message.setText(
                "Dear " + payment.getInvestorName() + ",\n\n" +
                "Your investment payment has been processed successfully!\n\n" +
                "Payment Details:\n" +
                "━━━━━━━━━━━━━━━━━━━━━━\n" +
                "Startup       : " + payment.getStartupName() + "\n" +
                "Amount        : ₹" + payment.getAmount() + "\n" +
                "Payment ID    : " + payment.getRazorpayPaymentId() + "\n" +
                "Status        : SUCCESS\n" +
                "━━━━━━━━━━━━━━━━━━━━━━\n\n" +
                "Thank you for investing through FounderLink!\n\n" +
                "Regards,\nFounderLink Team"
            );
            mailSender.send(message);
            log.info("Payment success email sent to investor: {}", payment.getInvestorName());
        } catch (Exception e) {
            log.error("Failed to send investor email: {}", e.getMessage());
        }
    }

    public void sendPaymentReceivedEmailToFounder(Payment payment) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(fromEmail); // replace with founder email lookup if available
            message.setSubject("💰 Investment Received - FounderLink");
            message.setText(
                "Dear Founder,\n\n" +
                "Great news! You have received an investment for your startup!\n\n" +
                "Investment Details:\n" +
                "━━━━━━━━━━━━━━━━━━━━━━\n" +
                "Startup       : " + payment.getStartupName() + "\n" +
                "Investor      : " + payment.getInvestorName() + "\n" +
                "Amount        : ₹" + payment.getAmount() + "\n" +
                "Payment ID    : " + payment.getRazorpayPaymentId() + "\n" +
                "Status        : RECEIVED\n" +
                "━━━━━━━━━━━━━━━━━━━━━━\n\n" +
                "Login to FounderLink to connect with your investor.\n\n" +
                "Regards,\nFounderLink Team"
            );
            mailSender.send(message);
            log.info("Payment received email sent to founder for startup: {}", payment.getStartupName());
        } catch (Exception e) {
            log.error("Failed to send founder email: {}", e.getMessage());
        }
    }
}
