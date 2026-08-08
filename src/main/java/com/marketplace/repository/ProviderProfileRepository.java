package com.marketplace.repository;

import com.marketplace.entity.ProviderProfile;
import java.util.Optional;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface ProviderProfileRepository extends MongoRepository<ProviderProfile, String> {
    Optional<ProviderProfile> findByUserId(String userId);
    boolean existsByUserId(String userId);
}
