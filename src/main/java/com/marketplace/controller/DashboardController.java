package com.marketplace.controller;

import java.util.Map;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api")
public class DashboardController {

    @GetMapping("/provider/dashboard")
    @PreAuthorize("hasRole('PROVIDER')")
    public ResponseEntity<Map<String, String>> providerDashboard() {
        return ResponseEntity.ok(Map.of("message", "Provider Dashboard"));
    }

    @GetMapping("/consumer/dashboard")
    @PreAuthorize("hasRole('CONSUMER')")
    public ResponseEntity<Map<String, String>> consumerDashboard() {
        return ResponseEntity.ok(Map.of("message", "Consumer Dashboard"));
    }

    @GetMapping("/admin/dashboard")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, String>> adminDashboard() {
        return ResponseEntity.ok(Map.of("message", "Admin Dashboard"));
    }
}
