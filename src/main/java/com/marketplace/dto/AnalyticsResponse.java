package com.marketplace.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class AnalyticsResponse {

    private long totalUsers;

    private long totalProviders;

    private long totalConsumers;

    private long pendingProviders;

    private long approvedProviders;

    private long rejectedProviders;

    private long totalCategories;

}