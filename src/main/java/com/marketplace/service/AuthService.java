package com.marketplace.service;

import com.marketplace.dto.LoginRequest;
import com.marketplace.dto.LoginResponse;
import com.marketplace.dto.RegisterRequest;
import com.marketplace.dto.UserResponse;

public interface AuthService {
    LoginResponse register(RegisterRequest request);
    LoginResponse login(LoginRequest request);
    UserResponse getCurrentUser(String email);
}
