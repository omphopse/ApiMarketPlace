package com.marketplace.dto;

import java.time.LocalDateTime;

import lombok.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AuditLogResponse {

    private String id;

    private String adminEmail;

    private String action;

    private String module;

    private String description;

    private LocalDateTime createdAt;
}