package com.marketplace.repository;

import com.marketplace.entity.ProviderProfile;
import java.util.Optional;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface ProviderProfileRepository extends MongoRepository<ProviderProfile, Long> {
    Optional<ProviderProfile> findByUserId(Long userId);
    boolean existsByUserId(Long userId);
}
