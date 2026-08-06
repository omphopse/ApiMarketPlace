package com.marketplace.controller;

import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.marketplace.dto.DashboardResponse;
import com.marketplace.service.AdminService;

@RestController
@RequestMapping("/api")
public class DashboardController {
	
	@Autowired
	AdminService adminService;

    @GetMapping("/admin/dashboard")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<DashboardResponse> adminDashboard() {

        return ResponseEntity.ok(adminService.getDashboard());

    }
}
