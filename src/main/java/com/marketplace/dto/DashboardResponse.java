package com.marketplace.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class DashboardResponse {

    private long totalUsers;
    private long totalProviders;
    private long totalConsumers;
    private long totalApis;
    private long totalSubscriptions;
    private double totalRevenue;
}