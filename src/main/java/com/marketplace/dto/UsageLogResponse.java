package com.marketplace.dto;

import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UsageLogResponse {
    private String id;
    private String endpoint;
    private String httpMethod;
    private int statusCode;
    private long responseTimeMs;
    private LocalDateTime timestamp;
}
