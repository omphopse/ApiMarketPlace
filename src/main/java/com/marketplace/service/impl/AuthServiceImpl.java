package com.marketplace.service.impl;

import com.marketplace.constants.AppConstants;
import com.marketplace.dto.LoginRequest;
import com.marketplace.dto.LoginResponse;
import com.marketplace.dto.RegisterRequest;
import com.marketplace.dto.UserResponse;
import com.marketplace.entity.Role;
import com.marketplace.entity.User;
import com.marketplace.exception.EmailAlreadyExistsException;
import com.marketplace.exception.InvalidCredentialsException;
import com.marketplace.exception.ResourceNotFoundException;
import com.marketplace.mapper.UserMapper;
import com.marketplace.repository.RoleRepository;
import com.marketplace.repository.UserRepository;
import com.marketplace.security.jwt.JwtUtil;
import com.marketplace.service.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {
    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final UserMapper userMapper;

    @Override
    @Transactional
    public LoginResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail().trim().toLowerCase())) {
            throw new EmailAlreadyExistsException("Email already exists");
        }

        String normalizedRole = normalizeRole(request.getRole());
        Role role = roleRepository.findByName(normalizedRole)
                .orElseThrow(() -> new ResourceNotFoundException("Role not found"));

        User user = User.builder()
                .fullName(request.getFullName().trim())
                .email(request.getEmail().trim().toLowerCase())
                .password(passwordEncoder.encode(request.getPassword()))
                .enabled(true)
                .role(role)
                .build();

        userRepository.save(user);
        return generateLoginResponse(user);
    }

    @Override
    @Transactional(readOnly = true)
    public LoginResponse login(LoginRequest request) {
        User user = userRepository.findByEmail(request.getEmail().trim().toLowerCase())
                .orElseThrow(() -> new InvalidCredentialsException("Invalid email or password"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new InvalidCredentialsException("Invalid email or password");
        }

        return generateLoginResponse(user);
    }

    @Override
    @Transactional(readOnly = true)
    public UserResponse getCurrentUser(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        return userMapper.toResponse(user);
    }

    private LoginResponse generateLoginResponse(User user) {
        String token = jwtUtil.generateToken(user.getEmail(), user.getRole().getName());
        return LoginResponse.builder()
                .token(token)
                .type("Bearer")
                .role(user.getRole().getName())
                .userId(user.getId())
                .fullName(user.getFullName())
                .build();
    }

    private String normalizeRole(String role) {
        return switch (role.toUpperCase()) {
            case "ADMIN" -> AppConstants.ROLE_ADMIN;
            case "PROVIDER" -> AppConstants.ROLE_PROVIDER;
            case "CONSUMER" -> AppConstants.ROLE_CONSUMER;
            default -> throw new InvalidCredentialsException("Unsupported role");
        };
    }
}
