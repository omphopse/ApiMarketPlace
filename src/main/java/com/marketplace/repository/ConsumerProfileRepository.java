package com.marketplace.repository;

import com.marketplace.entity.ConsumerProfile;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ConsumerProfileRepository extends JpaRepository<ConsumerProfile, Long> {
    Optional<ConsumerProfile> findByUserId(Long userId);
}
