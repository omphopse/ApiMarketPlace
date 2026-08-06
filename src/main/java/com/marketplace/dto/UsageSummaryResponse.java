package com.marketplace.dto;

import java.time.LocalDateTime;
import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UsageSummaryResponse {
    private Long totalRequests;
    private Long successfulRequests;
    private Long failedRequests;
    private Integer requestLimit;
    private Long remainingRequests;
    private LocalDateTime periodStart;
    private LocalDateTime periodEnd;
    private List<UsageLogResponse> recentRequests;
}
