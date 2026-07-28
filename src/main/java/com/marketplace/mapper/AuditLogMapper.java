package com.marketplace.mapper;

import org.springframework.stereotype.Component;

import com.marketplace.dto.AuditLogResponse;
import com.marketplace.entity.AuditLog;

@Component
public class AuditLogMapper {

    public AuditLogResponse toResponse(AuditLog auditLog) {

        return AuditLogResponse.builder()
                .id(auditLog.getId())
                .adminEmail(auditLog.getAdminEmail())
                .action(auditLog.getAction())
                .module(auditLog.getModule())
                .description(auditLog.getDescription())
                .createdAt(auditLog.getCreatedAt())
                .build();
    }
}
