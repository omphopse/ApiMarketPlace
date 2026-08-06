package com.marketplace.controller;

import com.marketplace.dto.ApiDetailsDto;
import com.marketplace.dto.ApiRequestDto;
import com.marketplace.dto.ApiDocumentationDto;
import com.marketplace.dto.ApiSummaryDto;
import com.marketplace.dto.CategoryDto;
import com.marketplace.dto.DashboardDto;
import com.marketplace.dto.ProviderProfileDto;
import com.marketplace.dto.SubscriptionPlanDto;
import com.marketplace.repository.UserRepository;
import com.marketplace.service.ProviderService;
import jakarta.validation.Valid;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/provider")
@RequiredArgsConstructor
@PreAuthorize("hasRole('PROVIDER')")
public class ProviderController {
    private final ProviderService providerService;
    private final UserRepository userRepository;

    @GetMapping("/profile")
    public ResponseEntity<ProviderProfileDto> getProfile() {
        Long userId = getCurrentUserId();
        return ResponseEntity.ok(providerService.getProfile(userId));
    }

    @PutMapping("/profile")
    public ResponseEntity<ProviderProfileDto> updateProfile(@Valid @RequestBody ProviderProfileDto profileDto) {
        Long userId = getCurrentUserId();
        return ResponseEntity.ok(providerService.saveProfile(userId, profileDto));
    }

    @GetMapping("/dashboard")
    public ResponseEntity<DashboardDto> getDashboard() {
        Long userId = getCurrentUserId();
        return ResponseEntity.ok(providerService.getDashboard(userId));
    }

    @GetMapping("/apis")
    public ResponseEntity<List<ApiSummaryDto>> getApis() {
        Long userId = getCurrentUserId();
        return ResponseEntity.ok(providerService.getApis(userId));
    }

    @GetMapping("/apis/{id}")
    public ResponseEntity<ApiDetailsDto> getApi(@PathVariable Long id) {
        Long userId = getCurrentUserId();
        return ResponseEntity.ok(providerService.getApi(userId, id));
    }

    @PostMapping("/apis")
    public ResponseEntity<ApiDetailsDto> createApi(@Valid @RequestBody ApiRequestDto request) {
        Long userId = getCurrentUserId();
        return ResponseEntity.status(HttpStatus.CREATED).body(providerService.createApi(userId, request));
    }

    @PutMapping("/apis/{id}")
    public ResponseEntity<ApiDetailsDto> updateApi(@PathVariable Long id, @Valid @RequestBody ApiRequestDto request) {
        Long userId = getCurrentUserId();
        return ResponseEntity.ok(providerService.updateApi(userId, id, request));
    }

    @DeleteMapping("/apis/{id}")
    public ResponseEntity<Void> deleteApi(@PathVariable Long id) {
        Long userId = getCurrentUserId();
        providerService.deleteApi(userId, id);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/apis/{id}/submit")
    public ResponseEntity<ApiDetailsDto> submitApi(@PathVariable Long id) {
        Long userId = getCurrentUserId();
        return ResponseEntity.ok(providerService.submitApi(userId, id));
    }

    @PatchMapping("/apis/{id}/archive")
    public ResponseEntity<ApiDetailsDto> archiveApi(@PathVariable Long id) {
        Long userId = getCurrentUserId();
        return ResponseEntity.ok(providerService.archiveApi(userId, id));
    }

    @PostMapping("/apis/{id}/plans")
    public ResponseEntity<SubscriptionPlanDto> createPlan(@PathVariable Long id, @Valid @RequestBody SubscriptionPlanDto planDto) {
        Long userId = getCurrentUserId();
        return ResponseEntity.status(HttpStatus.CREATED).body(providerService.createPlan(userId, id, planDto));
    }

    @PutMapping("/plans/{id}")
    public ResponseEntity<SubscriptionPlanDto> updatePlan(@PathVariable Long id, @Valid @RequestBody SubscriptionPlanDto planDto) {
        Long userId = getCurrentUserId();
        return ResponseEntity.ok(providerService.updatePlan(userId, id, planDto));
    }

    @DeleteMapping("/plans/{id}")
    public ResponseEntity<Void> deletePlan(@PathVariable Long id) {
        Long userId = getCurrentUserId();
        providerService.deletePlan(userId, id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/apis/{id}/plans")
    public ResponseEntity<List<SubscriptionPlanDto>> getPlans(@PathVariable Long id) {
        Long userId = getCurrentUserId();
        return ResponseEntity.ok(providerService.getPlans(userId, id));
    }

    @PostMapping("/apis/{id}/documentation")
    public ResponseEntity<ApiDocumentationDto> createDocumentation(@PathVariable Long id, @RequestBody ApiDocumentationDto documentationDto) {
        Long userId = getCurrentUserId();
        return ResponseEntity.status(HttpStatus.CREATED).body(providerService.createDocumentation(userId, id, documentationDto));
    }

    @PutMapping("/apis/{id}/documentation")
    public ResponseEntity<ApiDocumentationDto> updateDocumentation(@PathVariable Long id, @RequestBody ApiDocumentationDto documentationDto) {
        Long userId = getCurrentUserId();
        return ResponseEntity.ok(providerService.updateDocumentation(userId, id, documentationDto));
    }

    @GetMapping("/apis/{id}/documentation")
    public ResponseEntity<ApiDocumentationDto> getDocumentation(@PathVariable Long id) {
        Long userId = getCurrentUserId();
        return ResponseEntity.ok(providerService.getDocumentation(userId, id));
    }

    @GetMapping("/categories")
    public ResponseEntity<List<CategoryDto>> getCategories() {
        return ResponseEntity.ok(providerService.getCategories());
    }

    @PostMapping("/upload")
    public ResponseEntity<String> uploadLogo(@RequestParam("file") MultipartFile file) {
        return ResponseEntity.ok(providerService.uploadImage(file));
    }

    private Long getCurrentUserId() {
        String email = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Authenticated user not found"))
                .getId();
    }
}
