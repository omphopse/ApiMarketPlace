package com.marketplace.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.marketplace.entity.AuditLog;

public interface AuditLogRepository extends JpaRepository<AuditLog, Long> {

}