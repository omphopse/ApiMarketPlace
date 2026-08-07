package com.marketplace.mapper;

import com.marketplace.dto.UserResponse;
import com.marketplace.entity.User;
import org.springframework.stereotype.Component;

@Component
public class UserMapper {
    public UserResponse toResponse(User user) {
        String roleName = user.getRole() != null ? user.getRole().getName() : null;
        return UserResponse.builder()
                .id(user.getId())
                .fullName(user.getFullName())
                .email(user.getEmail())
                .role(roleName)
                .build();
    }
}
