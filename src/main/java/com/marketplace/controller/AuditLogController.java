package com.marketplace.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import com.marketplace.dto.AuditLogResponse;
import com.marketplace.service.AuditLogService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/admin/audit-logs")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AuditLogController {

    private final AuditLogService auditLogService;

    @GetMapping
    public ResponseEntity<List<AuditLogResponse>> getAllLogs() {

        return ResponseEntity.ok(auditLogService.getAllLogs());
    }

    @GetMapping("/{id}")
    public ResponseEntity<AuditLogResponse> getLogById(
            @PathVariable Long id) {

        return ResponseEntity.ok(auditLogService.getLogById(id));
    }
}
