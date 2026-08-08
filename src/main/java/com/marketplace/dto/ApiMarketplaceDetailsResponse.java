package com.marketplace.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ApiMarketplaceDetailsResponse {
    private String id;
    private String name;
    private String description;
    private String logoUrl;
    private CategoryResponse category;
    private ProviderSummary provider;
    private String version;
    private boolean documentationAvailable;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ProviderSummary {
        private String name;
        private String companyName;
    }
}
