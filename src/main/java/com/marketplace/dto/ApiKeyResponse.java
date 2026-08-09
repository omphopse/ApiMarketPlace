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
public class ApiKeyResponse {
    private String id;
    private String subscriptionId;
    private String apiName;
    private String keyPrefix;
    private String maskedKey;
    private String status;
    private LocalDateTime createdAt;
    private LocalDateTime lastUsedAt;
}
