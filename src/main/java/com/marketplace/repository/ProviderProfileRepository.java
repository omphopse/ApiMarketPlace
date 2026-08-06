package com.marketplace.repository;

import com.marketplace.entity.ProviderProfile;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ProviderProfileRepository extends JpaRepository<ProviderProfile, Long> {
    Optional<ProviderProfile> findByUserId(Long userId);
    boolean existsByUserId(Long userId);
}
