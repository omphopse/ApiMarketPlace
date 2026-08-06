package com.marketplace.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import com.marketplace.dto.AnalyticsResponse;
import com.marketplace.dto.UserResponse;
import com.marketplace.dto.UserStatusRequest;
import com.marketplace.service.AdminService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    private final AdminService adminService;

    @GetMapping("/users")
    public ResponseEntity<List<UserResponse>> getAllUsers() {
        return ResponseEntity.ok(adminService.getAllUsers());
    }
    
    @GetMapping("/users/{id}")
    public ResponseEntity<UserResponse> getUserById(@PathVariable Long id) {

        return ResponseEntity.ok(adminService.getUserById(id));

    }
    
    @PutMapping("/users/{id}/status")
    public ResponseEntity<UserResponse> updateUserStatus(
            @PathVariable Long id,
            @RequestBody UserStatusRequest request) {

        return ResponseEntity.ok(
                adminService.updateUserStatus(id, request.isEnabled()));
    }
    
    @GetMapping("/users/search")
    public ResponseEntity<List<UserResponse>> searchUsers(
            @RequestParam String keyword) {

        return ResponseEntity.ok(
                adminService.searchUsers(keyword));

    }
    
    @DeleteMapping("/users/{id}")
    public ResponseEntity<String> deleteUser(@PathVariable Long id) {

        adminService.deleteUser(id);

        return ResponseEntity.ok("User deleted successfully.");
    }
    
    @GetMapping("/providers/pending")
    public ResponseEntity<List<UserResponse>> getPendingProviders() {

        return ResponseEntity.ok(
                adminService.getPendingProviders());

    }
    
    @PutMapping("/providers/{id}/approve")
    public ResponseEntity<UserResponse> approveProvider(@PathVariable Long id) {

        return ResponseEntity.ok(adminService.approveProvider(id));
    }
    
    @PutMapping("/providers/{id}/reject")
    public ResponseEntity<UserResponse> rejectProvider(@PathVariable Long id) {

        return ResponseEntity.ok(adminService.rejectProvider(id));
    }
    
    @GetMapping("/analytics")
    public ResponseEntity<AnalyticsResponse> getAnalytics() {

        return ResponseEntity.ok(adminService.getAnalytics());

    }
}