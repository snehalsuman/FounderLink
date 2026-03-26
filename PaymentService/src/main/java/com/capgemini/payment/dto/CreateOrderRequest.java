package com.capgemini.payment.dto;

import lombok.Data;

@Data
public class CreateOrderRequest {
    private Long investorId;
    private Long founderId;
    private Long startupId;
    private String startupName;
    private String investorName;
    private Double amount;
}
