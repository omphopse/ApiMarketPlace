package com.marketplace.dto;

import com.marketplace.entity.ApprovalStatus;

import lombok.*;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class ApiResponse {

    private Long id;

    private String name;

    private String description;

    private String provider;

    private String category;

    private String version;

    private String baseUrl;

    private String documentationUrl;

    private String pricing;

    private ApprovalStatus approvalStatus;

}
