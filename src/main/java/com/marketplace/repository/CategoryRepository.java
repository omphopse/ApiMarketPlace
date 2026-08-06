package com.marketplace.repository;

import com.marketplace.entity.Category;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CategoryRepository extends JpaRepository<Category, Long> {
    List<Category> findByActiveTrueOrderByNameAsc();
    Optional<Category> findByName(String name);
    boolean existsByName(String name);
}
