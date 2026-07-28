package com.marketplace.service;

import java.util.List;

import com.marketplace.dto.AuditLogResponse;

public interface AuditLogService {

    List<AuditLogResponse> getAllLogs();

    AuditLogResponse getLogById(Long id);

    void saveLog(String action, String module, String description);

}