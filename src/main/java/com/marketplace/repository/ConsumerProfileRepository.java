package com.marketplace.repository;

import com.marketplace.entity.ConsumerProfile;
import java.util.Optional;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface ConsumerProfileRepository extends MongoRepository<ConsumerProfile, Long> {
    Optional<ConsumerProfile> findByUserId(Long userId);
}
