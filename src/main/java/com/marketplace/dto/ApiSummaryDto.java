package com.marketplace.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ApiSummaryDto {
    private Long id;
    private String name;
    private String description;
    private String categoryName;
    private String logo;
    private String version;
    private String status;
    private Integer rateLimit;
    private String authenticationType;
}
