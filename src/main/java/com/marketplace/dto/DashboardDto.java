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
public class DashboardDto {
    private long totalApis;
    private long approvedApis;
    private long pendingApis;
    private long rejectedApis;
    private long archivedApis;
    private long monthlyRevenue;
    private long totalSubscribers;
    private List<ApiSummaryDto> recentApis;
}
