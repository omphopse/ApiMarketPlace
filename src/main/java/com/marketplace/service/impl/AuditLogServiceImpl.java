package com.marketplace.service.impl;

import java.util.List;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import com.marketplace.dto.AuditLogResponse;
import com.marketplace.entity.AuditLog;
import com.marketplace.exception.ResourceNotFoundException;
import com.marketplace.mapper.AuditLogMapper;
import com.marketplace.repository.AuditLogRepository;
import com.marketplace.repository.UserRepository;
import com.marketplace.service.AuditLogService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AuditLogServiceImpl implements AuditLogService {

    private final AuditLogRepository auditLogRepository;
    private final AuditLogMapper auditLogMapper;
    @Override
    public void saveLog(String action, String module, String description) {

        Authentication authentication =
                SecurityContextHolder.getContext().getAuthentication();

        String email = authentication.getName();

        AuditLog auditLog = AuditLog.builder()
                .adminEmail(email)
                .action(action)
                .module(module)
                .description(description)
                .build();

        auditLogRepository.save(auditLog);
    }

    @Override
    public List<AuditLogResponse> getAllLogs() {

        return auditLogRepository.findAll()
                .stream()
                .map(auditLogMapper::toResponse)
                .toList();
    }

    @Override
    public AuditLogResponse getLogById(Long id) {

        AuditLog auditLog = auditLogRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Audit log not found."));

        return auditLogMapper.toResponse(auditLog);
    }
}
