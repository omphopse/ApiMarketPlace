package com.marketplace.repository;

import com.marketplace.entity.ApprovalStatus;
import com.marketplace.entity.User;
import java.util.List;
import java.util.Optional;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;

public interface UserRepository extends MongoRepository<User, String> {
    Optional<User> findByEmail(String email);
    boolean existsByEmail(String email);

    long countByRole_Id(String roleId);

    long countByRole_IdAndApprovalStatus(String roleId, ApprovalStatus approvalStatus);

    @Query("{ $or: [ { 'fullName': { $regex: ?0, $options: 'i' } }, { 'email': { $regex: ?0, $options: 'i' } } ] }")
    List<User> searchUsers(String keyword);

    List<User> findByRole_IdAndApprovalStatus(String roleId, ApprovalStatus approvalStatus);

}
