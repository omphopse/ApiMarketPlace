package com.marketplace.repository;

import com.marketplace.entity.ApiDocumentation;
import java.util.Optional;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface ApiDocumentationRepository extends MongoRepository<ApiDocumentation, Long> {
    Optional<ApiDocumentation> findByApiId(Long apiId);
}
