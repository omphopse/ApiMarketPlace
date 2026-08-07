package com.marketplace.repository;

import com.marketplace.entity.ApprovalStatus;
import com.marketplace.entity.User;
import java.util.List;
import java.util.Optional;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;

public interface UserRepository extends MongoRepository<User, Long> {
    Optional<User> findByEmail(String email);
    boolean existsByEmail(String email);

    @Query(value = "{ 'role.name': ?0 }", count = true)
    long countByRole_Name(String roleName);

    @Query(value = "{ 'role.name': ?0, 'approvalStatus': ?1 }", count = true)
    long countByRole_NameAndApprovalStatus(String roleName, ApprovalStatus approvalStatus);

    @Query("{ $or: [ { 'fullName': { $regex: ?0, $options: 'i' } }, { 'email': { $regex: ?0, $options: 'i' } }, { 'role.name': { $regex: ?0, $options: 'i' } } ] }")
    List<User> searchUsers(String keyword);

    @Query("{ 'role.name': ?0, 'approvalStatus': ?1 }")
    List<User> findByRole_NameAndApprovalStatus(String roleName, ApprovalStatus approvalStatus);
}
