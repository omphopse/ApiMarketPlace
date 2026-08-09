package com.marketplace.controller;

import com.marketplace.dto.ApiDetailsDto;
import com.marketplace.dto.ApiRequestDto;
import com.marketplace.dto.ApiDocumentationDto;
import com.marketplace.dto.ApiSummaryDto;
import com.marketplace.dto.CategoryDto;
import com.marketplace.dto.DashboardDto;
import com.marketplace.dto.PagedResponse;
import com.marketplace.dto.ProviderProfileDto;
import com.marketplace.dto.ProviderSubscriberResponse;
import com.marketplace.dto.SubscriptionPlanDto;
import com.marketplace.repository.UserRepository;
import com.marketplace.service.ProviderService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
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
@Tag(name = "Provider API", description = "APIs for managing provider profile, APIs, subscription plans, and documentation")
public class ProviderController {
    private final ProviderService providerService;
    private final UserRepository userRepository;

    @GetMapping("/profile")
    public ResponseEntity<ProviderProfileDto> getProfile() {
        String userId = getCurrentUserId();
        return ResponseEntity.ok(providerService.getProfile(userId));
    }

    @PutMapping("/profile")
    public ResponseEntity<ProviderProfileDto> updateProfile(@Valid @RequestBody ProviderProfileDto profileDto) {
        String userId = getCurrentUserId();
        return ResponseEntity.ok(providerService.saveProfile(userId, profileDto));
    }

    @GetMapping("/dashboard")
    public ResponseEntity<DashboardDto> getDashboard() {
        String userId = getCurrentUserId();
        return ResponseEntity.ok(providerService.getDashboard(userId));
    }

    @GetMapping("/apis")
    public ResponseEntity<List<ApiSummaryDto>> getApis(
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "ALL") String status,
            @RequestParam(required = false) String category,
            @RequestParam(defaultValue = "NEWEST") String sort) {
        String userId = getCurrentUserId();
        return ResponseEntity.ok(providerService.getApis(userId, search, status, category, sort));
    }

    @GetMapping("/apis/{id}")
    public ResponseEntity<ApiDetailsDto> getApi(@PathVariable String id) {
        String userId = getCurrentUserId();
        return ResponseEntity.ok(providerService.getApi(userId, id));
    }

    @PostMapping("/apis")
    public ResponseEntity<ApiDetailsDto> createApi(@Valid @RequestBody ApiRequestDto request) {
        String userId = getCurrentUserId();
        return ResponseEntity.status(HttpStatus.CREATED).body(providerService.createApi(userId, request));
    }

    @PutMapping("/apis/{id}")
    public ResponseEntity<ApiDetailsDto> updateApi(@PathVariable String id, @Valid @RequestBody ApiRequestDto request) {
        String userId = getCurrentUserId();
        return ResponseEntity.ok(providerService.updateApi(userId, id, request));
    }

    @DeleteMapping("/apis/{id}")
    public ResponseEntity<Void> deleteApi(@PathVariable String id) {
        String userId = getCurrentUserId();
        providerService.deleteApi(userId, id);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/apis/{id}/submit")
    public ResponseEntity<ApiDetailsDto> submitApi(@PathVariable String id) {
        String userId = getCurrentUserId();
        return ResponseEntity.ok(providerService.submitApi(userId, id));
    }

    @PatchMapping("/apis/{id}/archive")
    public ResponseEntity<ApiDetailsDto> archiveApi(@PathVariable String id) {
        String userId = getCurrentUserId();
        return ResponseEntity.ok(providerService.archiveApi(userId, id));
    }

    @GetMapping("/apis/{id}/subscribers")
    public ResponseEntity<PagedResponse<ProviderSubscriberResponse>> getSubscribers(
            @PathVariable String id,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        String userId = getCurrentUserId();
        return ResponseEntity.ok(providerService.getSubscribers(userId, id, page, size));
    }

    @PostMapping("/apis/{id}/plans")
    @Operation(summary = "Create a new subscription plan", description = "Creates a new subscription plan for the specified API")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "201", description = "Subscription plan created successfully",
                    content = @Content(mediaType = "application/json", schema = @Schema(implementation = SubscriptionPlanDto.class))),
            @ApiResponse(responseCode = "400", description = "Invalid request body or validation error"),
            @ApiResponse(responseCode = "401", description = "Unauthorized - authentication required"),
            @ApiResponse(responseCode = "403", description = "Forbidden - user doesn't have PROVIDER role"),
            @ApiResponse(responseCode = "404", description = "API not found")
    })
    public ResponseEntity<SubscriptionPlanDto> createPlan(@PathVariable String id, @Valid @RequestBody SubscriptionPlanDto planDto) {
        String userId = getCurrentUserId();
        return ResponseEntity.status(HttpStatus.CREATED).body(providerService.createPlan(userId, id, planDto));
    }

    @PutMapping("/plans/{id}")
    @Operation(summary = "Update a subscription plan", description = "Updates an existing subscription plan")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Subscription plan updated successfully",
                    content = @Content(mediaType = "application/json", schema = @Schema(implementation = SubscriptionPlanDto.class))),
            @ApiResponse(responseCode = "400", description = "Invalid request body or validation error"),
            @ApiResponse(responseCode = "401", description = "Unauthorized - authentication required"),
            @ApiResponse(responseCode = "403", description = "Forbidden - user doesn't have PROVIDER role"),
            @ApiResponse(responseCode = "404", description = "Subscription plan not found")
    })
    public ResponseEntity<SubscriptionPlanDto> updatePlan(@PathVariable String id, @Valid @RequestBody SubscriptionPlanDto planDto) {
        String userId = getCurrentUserId();
        return ResponseEntity.ok(providerService.updatePlan(userId, id, planDto));
    }

    @DeleteMapping("/plans/{id}")
    @Operation(summary = "Delete a subscription plan", description = "Deletes a subscription plan by ID")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "204", description = "Subscription plan deleted successfully"),
            @ApiResponse(responseCode = "401", description = "Unauthorized - authentication required"),
            @ApiResponse(responseCode = "403", description = "Forbidden - user doesn't have PROVIDER role"),
            @ApiResponse(responseCode = "404", description = "Subscription plan not found")
    })
    public ResponseEntity<Void> deletePlan(@PathVariable String id) {
        String userId = getCurrentUserId();
        providerService.deletePlan(userId, id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/apis/{id}/plans")
    @Operation(summary = "Get subscription plans for an API", description = "Retrieves all subscription plans associated with a specific API")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Subscription plans retrieved successfully",
                    content = @Content(mediaType = "application/json", schema = @Schema(implementation = SubscriptionPlanDto.class))),
            @ApiResponse(responseCode = "401", description = "Unauthorized - authentication required"),
            @ApiResponse(responseCode = "403", description = "Forbidden - user doesn't have PROVIDER role"),
            @ApiResponse(responseCode = "404", description = "API not found")
    })
    public ResponseEntity<List<SubscriptionPlanDto>> getPlans(@PathVariable String id) {
        String userId = getCurrentUserId();
        return ResponseEntity.ok(providerService.getPlans(userId, id));
    }

    @PostMapping("/apis/{id}/documentation")
    @Operation(summary = "Create API documentation", description = "Creates comprehensive documentation for the specified API")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "201", description = "API documentation created successfully",
                    content = @Content(mediaType = "application/json", schema = @Schema(implementation = ApiDocumentationDto.class))),
            @ApiResponse(responseCode = "400", description = "Invalid request body or validation error"),
            @ApiResponse(responseCode = "401", description = "Unauthorized - authentication required"),
            @ApiResponse(responseCode = "403", description = "Forbidden - user doesn't have PROVIDER role"),
            @ApiResponse(responseCode = "404", description = "API not found")
    })
    public ResponseEntity<ApiDocumentationDto> createDocumentation(@PathVariable String id, @RequestBody ApiDocumentationDto documentationDto) {
        String userId = getCurrentUserId();
        return ResponseEntity.status(HttpStatus.CREATED).body(providerService.createDocumentation(userId, id, documentationDto));
    }

    @PutMapping("/apis/{id}/documentation")
    @Operation(summary = "Update API documentation", description = "Updates the documentation for the specified API")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "API documentation updated successfully",
                    content = @Content(mediaType = "application/json", schema = @Schema(implementation = ApiDocumentationDto.class))),
            @ApiResponse(responseCode = "400", description = "Invalid request body or validation error"),
            @ApiResponse(responseCode = "401", description = "Unauthorized - authentication required"),
            @ApiResponse(responseCode = "403", description = "Forbidden - user doesn't have PROVIDER role"),
            @ApiResponse(responseCode = "404", description = "API or documentation not found")
    })
    public ResponseEntity<ApiDocumentationDto> updateDocumentation(@PathVariable String id, @RequestBody ApiDocumentationDto documentationDto) {
        String userId = getCurrentUserId();
        return ResponseEntity.ok(providerService.updateDocumentation(userId, id, documentationDto));
    }

    @GetMapping("/apis/{id}/documentation")
    @Operation(summary = "Get API documentation", description = "Retrieves the documentation for the specified API")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "API documentation retrieved successfully",
                    content = @Content(mediaType = "application/json", schema = @Schema(implementation = ApiDocumentationDto.class))),
            @ApiResponse(responseCode = "401", description = "Unauthorized - authentication required"),
            @ApiResponse(responseCode = "403", description = "Forbidden - user doesn't have PROVIDER role"),
            @ApiResponse(responseCode = "404", description = "API or documentation not found")
    })
    public ResponseEntity<ApiDocumentationDto> getDocumentation(@PathVariable String id) {
        String userId = getCurrentUserId();
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

    private String getCurrentUserId() {
        String email = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Authenticated user not found"))
                .getId();
    }
}
