package com.marketplace.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import com.marketplace.dto.AnalyticsResponse;
import com.marketplace.dto.ApiSummaryDto;
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
    public ResponseEntity<UserResponse> getUserById(@PathVariable String id) {

        return ResponseEntity.ok(adminService.getUserById(id));

    }
    
    @PutMapping("/users/{id}/status")
    public ResponseEntity<UserResponse> updateUserStatus(
            @PathVariable String id,
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
    public ResponseEntity<String> deleteUser(@PathVariable String id) {

        adminService.deleteUser(id);

        return ResponseEntity.ok("User deleted successfully.");
    }
    
    @GetMapping("/providers/pending")
    public ResponseEntity<List<UserResponse>> getPendingProviders() {

        return ResponseEntity.ok(
                adminService.getPendingProviders());

    }
    
    @PutMapping("/providers/{id}/approve")
    public ResponseEntity<UserResponse> approveProvider(@PathVariable String id) {

        return ResponseEntity.ok(adminService.approveProvider(id));
    }
    
    @PutMapping("/providers/{id}/reject")
    public ResponseEntity<UserResponse> rejectProvider(@PathVariable String id) {

        return ResponseEntity.ok(adminService.rejectProvider(id));
    }

    @GetMapping("/apis")
    public ResponseEntity<List<ApiSummaryDto>> getAllApis() {
        return ResponseEntity.ok(adminService.getAllApis());
    }

    @GetMapping("/apis/pending")
    public ResponseEntity<List<ApiSummaryDto>> getPendingApis() {
        return ResponseEntity.ok(adminService.getPendingApis());
    }

    @GetMapping("/apis/{id}")
    public ResponseEntity<ApiSummaryDto> getApi(@PathVariable String id) {
        return ResponseEntity.ok(adminService.getApi(id));
    }

    @PutMapping("/apis/{id}/approve")
    public ResponseEntity<ApiSummaryDto> approveApi(@PathVariable String id) {
        return ResponseEntity.ok(adminService.approveApi(id));
    }

    @PutMapping("/apis/{id}/reject")
    public ResponseEntity<ApiSummaryDto> rejectApi(@PathVariable String id) {
        return ResponseEntity.ok(adminService.rejectApi(id));
    }

    @PutMapping("/apis/{id}/status")
    public ResponseEntity<ApiSummaryDto> changeApiStatus(@PathVariable String id, @RequestBody com.marketplace.dto.ApiStatusChangeRequest request) {
        return ResponseEntity.ok(adminService.changeApiStatus(id, request.getNewStatus(), request.getReason()));
    }
    
    @GetMapping("/analytics")
    public ResponseEntity<AnalyticsResponse> getAnalytics() {

        return ResponseEntity.ok(adminService.getAnalytics());

    }
}