package com.capgemini.startup.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.cache.annotation.Caching;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.capgemini.startup.config.RabbitMQConfig;
import com.capgemini.startup.dto.StartupCreatedEvent;
import com.capgemini.startup.dto.StartupRejectedEvent;
import com.capgemini.startup.dto.StartupRequest;
import com.capgemini.startup.dto.StartupResponse;
import com.capgemini.startup.entity.Startup;
import com.capgemini.startup.entity.StartupFollower;
import com.capgemini.startup.enums.StartupStage;
import com.capgemini.startup.exception.DuplicateResourceException;
import com.capgemini.startup.exception.ResourceNotFoundException;
import com.capgemini.startup.exception.UnauthorizedAccessException;
import com.capgemini.startup.repository.StartupFollowerRepository;
import com.capgemini.startup.repository.StartupRepository;
import com.capgemini.startup.specification.StartupSpecification;

import java.math.BigDecimal;
import java.util.List;

@Service
@Transactional
@Slf4j
public class StartupServiceImpl implements StartupService {

    private final StartupRepository startupRepository;
    private final StartupFollowerRepository startupFollowerRepository;
    private final RabbitTemplate rabbitTemplate;

    public StartupServiceImpl(StartupRepository startupRepository,
                              StartupFollowerRepository startupFollowerRepository,
                              RabbitTemplate rabbitTemplate) {
        this.startupRepository = startupRepository;
        this.startupFollowerRepository = startupFollowerRepository;
        this.rabbitTemplate = rabbitTemplate;
    }

    @Override
    @Caching(evict = {
        @CacheEvict(value = "startups", allEntries = true),
        @CacheEvict(value = "startupsByFounder", key = "#founderId")
    })
    public StartupResponse createStartup(Long founderId, StartupRequest request) {
        Startup startup = Startup.builder()
                .name(request.getName())
                .description(request.getDescription())
                .industry(request.getIndustry())
                .problemStatement(request.getProblemStatement())
                .solution(request.getSolution())
                .fundingGoal(request.getFundingGoal())
                .stage(request.getStage())
                .location(request.getLocation())
                .founderId(founderId)
                .isApproved(false)
                .build();

        Startup saved = startupRepository.save(startup);

        StartupCreatedEvent event = StartupCreatedEvent.builder()
                .startupId(saved.getId())
                .founderId(saved.getFounderId())
                .startupName(saved.getName())
                .industry(saved.getIndustry())
                .fundingGoal(saved.getFundingGoal())
                .build();

        rabbitTemplate.convertAndSend(
                RabbitMQConfig.EXCHANGE_NAME,
                RabbitMQConfig.STARTUP_CREATED_ROUTING_KEY,
                event
        );

        log.info("Startup created: id={}, name={}, founderId={}", saved.getId(), saved.getName(), founderId);
        return mapToResponse(saved);
    }

    @Override
    @Transactional(readOnly = true)
    @Cacheable(value = "startups", key = "#id")
    public StartupResponse getStartupById(Long id) {
        log.info("Fetching startup from DB: id={}", id);
        Startup startup = startupRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Startup not found with ID: " + id));
        return mapToResponse(startup);
    }

    @Override
    @CacheEvict(value = "startups", key = "#id")
    public StartupResponse updateStartup(Long id, Long founderId, StartupRequest request) {
        Startup startup = startupRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Startup not found with ID: " + id));

        if (!startup.getFounderId().equals(founderId)) {
            throw new UnauthorizedAccessException("Only the founder can update this startup");
        }

        startup.setName(request.getName());
        startup.setDescription(request.getDescription());
        startup.setIndustry(request.getIndustry());
        startup.setProblemStatement(request.getProblemStatement());
        startup.setSolution(request.getSolution());
        startup.setFundingGoal(request.getFundingGoal());
        startup.setStage(request.getStage());
        startup.setLocation(request.getLocation());

        Startup updated = startupRepository.save(startup);
        log.info("Startup updated: id={}", id);
        return mapToResponse(updated);
    }

    @Override
    @CacheEvict(value = "startups", key = "#id")
    public void deleteStartup(Long id, Long userId, boolean isAdmin) {
        Startup startup = startupRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Startup not found with ID: " + id));

        if (!isAdmin && !startup.getFounderId().equals(userId)) {
            throw new UnauthorizedAccessException("Only the founder or an admin can delete this startup");
        }

        startupRepository.delete(startup);
        log.info("Startup deleted: id={}", id);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<StartupResponse> getAllApprovedStartups(Pageable pageable) {
        return startupRepository.findByIsApprovedTrue(pageable).map(this::mapToResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<StartupResponse> getAllStartups(Pageable pageable) {
        return startupRepository.findAll(pageable).map(this::mapToResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<StartupResponse> searchStartups(String industry, StartupStage stage,
                                                BigDecimal minFunding, BigDecimal maxFunding,
                                                String location, Pageable pageable) {
        Specification<Startup> spec = Specification.where(StartupSpecification.isApproved());

        if (industry != null && !industry.isBlank()) spec = spec.and(StartupSpecification.hasIndustry(industry));
        if (stage != null)                           spec = spec.and(StartupSpecification.hasStage(stage));
        if (minFunding != null)                      spec = spec.and(StartupSpecification.hasMinFunding(minFunding));
        if (maxFunding != null)                      spec = spec.and(StartupSpecification.hasMaxFunding(maxFunding));
        if (location != null && !location.isBlank()) spec = spec.and(StartupSpecification.hasLocation(location));

        return startupRepository.findAll(spec, pageable).map(this::mapToResponse);
    }

    @Override
    public void followStartup(Long startupId, Long investorId) {
        if (!startupRepository.existsById(startupId)) {
            throw new ResourceNotFoundException("Startup not found with ID: " + startupId);
        }
        if (startupFollowerRepository.existsByStartupIdAndInvestorId(startupId, investorId)) {
            throw new DuplicateResourceException("Already following this startup");
        }
        startupFollowerRepository.save(StartupFollower.builder()
                .startupId(startupId)
                .investorId(investorId)
                .build());
        log.info("Investor {} followed startup {}", investorId, startupId);
    }

    @Override
    @Caching(evict = {
        @CacheEvict(value = "startups", key = "#id"),
        @CacheEvict(value = "startupsByFounder", allEntries = true)
    })
    public StartupResponse approveStartup(Long id) {
        Startup startup = startupRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Startup not found with ID: " + id));

        startup.setIsApproved(true);
        startup.setIsRejected(false);
        Startup approved = startupRepository.save(startup);
        log.info("Startup approved: id={}", id);
        return mapToResponse(approved);
    }

    @Override
    @Caching(evict = {
        @CacheEvict(value = "startups", key = "#id"),
        @CacheEvict(value = "startupsByFounder", allEntries = true)
    })
    public StartupResponse rejectStartup(Long id) {
        Startup startup = startupRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Startup not found with ID: " + id));

        startup.setIsRejected(true);
        startup.setIsApproved(false);
        Startup rejected = startupRepository.save(startup);

        StartupRejectedEvent event = StartupRejectedEvent.builder()
                .startupId(rejected.getId())
                .founderId(rejected.getFounderId())
                .startupName(rejected.getName())
                .build();
        rabbitTemplate.convertAndSend(
                RabbitMQConfig.EXCHANGE_NAME,
                RabbitMQConfig.STARTUP_REJECTED_ROUTING_KEY,
                event
        );

        log.info("Startup rejected: id={}", id);
        return mapToResponse(rejected);
    }

    @Override
    @Transactional(readOnly = true)
    @Cacheable(value = "startupsByFounder", key = "#founderId")
    public List<StartupResponse> getStartupsByFounderId(Long founderId) {
        return startupRepository.findByFounderId(founderId).stream()
                .map(this::mapToResponse)
                .collect(java.util.stream.Collectors.toList());
    }

    private StartupResponse mapToResponse(Startup startup) {
        return StartupResponse.builder()
                .id(startup.getId())
                .name(startup.getName())
                .description(startup.getDescription())
                .industry(startup.getIndustry())
                .problemStatement(startup.getProblemStatement())
                .solution(startup.getSolution())
                .fundingGoal(startup.getFundingGoal())
                .stage(startup.getStage())
                .location(startup.getLocation())
                .founderId(startup.getFounderId())
                .isApproved(startup.getIsApproved())
                .isRejected(startup.getIsRejected())
                .createdAt(startup.getCreatedAt())
                .updatedAt(startup.getUpdatedAt())
                .build();
    }
}
