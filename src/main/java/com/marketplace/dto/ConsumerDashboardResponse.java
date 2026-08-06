package com.marketplace.dto;

import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ConsumerDashboardResponse {
    private long activeSubscriptions;
    private long totalSubscriptions;
    private long totalRequestsThisMonth;
    private long remainingRequests;
    private List<SubscriptionResponse> recentSubscriptions;
    private List<UsageLogResponse> recentUsage;
}
