package com.marketplace.repository;

import com.marketplace.entity.ApiDocumentation;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ApiDocumentationRepository extends JpaRepository<ApiDocumentation, Long> {
    Optional<ApiDocumentation> findByApiId(Long apiId);
}
