package com.marketplace.dto;

import java.math.BigDecimal;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ApiMarketplaceCardResponse {
    private Long id;
    private String name;
    private String shortDescription;
    private String logoUrl;
    private String category;
    private String providerName;
    private String version;
    private BigDecimal startingPrice;
    private boolean hasFreePlan;
}
