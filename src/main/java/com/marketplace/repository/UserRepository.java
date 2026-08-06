package com.marketplace.repository;

import com.marketplace.entity.ApprovalStatus;
import com.marketplace.entity.User;

import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
    boolean existsByEmail(String email);
    long countByRole_Name(String roleName);
    
    @Query("""
    		SELECT u
    		FROM User u
    		JOIN u.role r
    		WHERE LOWER(u.fullName) LIKE LOWER(CONCAT('%', :keyword, '%'))
    		   OR LOWER(u.email) LIKE LOWER(CONCAT('%', :keyword, '%'))
    		   OR LOWER(r.name) LIKE LOWER(CONCAT('%', :keyword, '%'))
    		""")
    		List<User> searchUsers(@Param("keyword") String keyword);
    
    List<User> findByRole_NameAndApprovalStatus(
            String roleName,
            ApprovalStatus approvalStatus);
    
    long countByRole_NameAndApprovalStatus(
            String roleName,
            ApprovalStatus approvalStatus);
}
