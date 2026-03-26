package com.capgemini.notification.listener;

import com.capgemini.notification.enums.NotificationType;
import com.capgemini.notification.event.InvestmentApprovedEvent;
import com.capgemini.notification.event.InvestmentCreatedEvent;
import com.capgemini.notification.event.StartupCreatedEvent;
import com.capgemini.notification.event.StartupRejectedEvent;
import com.capgemini.notification.event.TeamInviteSentEvent;
import com.capgemini.notification.service.NotificationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class NotificationEventListener {

    private final NotificationService notificationService;

    @RabbitListener(queues = "${rabbitmq.queue.startup-created}")
    public void handleStartupCreated(StartupCreatedEvent event) {
        log.info("Received startup created event for startupId: {}", event.getStartupId());
        notificationService.createNotification(
                event.getFounderId(),
                "Your startup has been submitted for review. Startup ID: " + event.getStartupId(),
                NotificationType.STARTUP_CREATED
        );
    }

    @RabbitListener(queues = "${rabbitmq.queue.investment-created}")
    public void handleInvestmentCreated(InvestmentCreatedEvent event) {
        log.info("Received investment created event for startupId: {}", event.getStartupId());
        notificationService.createNotification(
                event.getFounderId(),
                "New investment request of amount " + event.getAmount() + " received for your startup.",
                NotificationType.INVESTMENT_CREATED
        );
    }

    @RabbitListener(queues = "${rabbitmq.queue.investment-approved}")
    public void handleInvestmentApproved(InvestmentApprovedEvent event) {
        log.info("Received investment approved event for investorId: {}", event.getInvestorId());
        notificationService.createNotification(
                event.getInvestorId(),
                "Your investment of amount " + event.getAmount() + " has been approved.",
                NotificationType.INVESTMENT_APPROVED
        );
    }

    @RabbitListener(queues = "${rabbitmq.queue.startup-rejected}")
    public void handleStartupRejected(StartupRejectedEvent event) {
        log.info("Received startup rejected event for startupId: {}", event.getStartupId());
        notificationService.createNotification(
                event.getFounderId(),
                "We're sorry, your startup \"" + event.getStartupName() + "\" has been reviewed and was not approved at this time. We're not moving forward with this submission.",
                NotificationType.STARTUP_REJECTED
        );
    }

    @RabbitListener(queues = "${rabbitmq.queue.team-invite-sent}")
    public void handleTeamInvite(TeamInviteSentEvent event) {
        log.info("Received team invite event for userId: {}", event.getInvitedUserId());
        notificationService.createNotification(
                event.getInvitedUserId(),
                "You have been invited to join a startup team as " + event.getRole(),
                NotificationType.TEAM_INVITE_SENT
        );
    }
}
