package com.marketplace.startup;

import com.marketplace.constants.AppConstants;
import com.marketplace.entity.Role;
import com.marketplace.entity.User;
import com.marketplace.repository.RoleRepository;
import com.marketplace.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Component
@RequiredArgsConstructor
public class DefaultAdminInitializer implements ApplicationRunner {
    private final RoleRepository roleRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        createRoleIfMissing(AppConstants.ROLE_ADMIN);
        createRoleIfMissing(AppConstants.ROLE_PROVIDER);
        createRoleIfMissing(AppConstants.ROLE_CONSUMER);

        if (!userRepository.existsByEmail(AppConstants.DEFAULT_ADMIN_EMAIL)) {
            Role adminRole = roleRepository.findByName(AppConstants.ROLE_ADMIN).orElseThrow();
            User admin = User.builder()
                    .fullName("System Administrator")
                    .email(AppConstants.DEFAULT_ADMIN_EMAIL)
                    .password(passwordEncoder.encode(AppConstants.DEFAULT_ADMIN_PASSWORD))
                    .enabled(true)
                    .role(adminRole)
                    .build();
            userRepository.save(admin);
        }
    }

    private void createRoleIfMissing(String roleName) {
        if (roleRepository.findByName(roleName).isEmpty()) {
            roleRepository.save(Role.builder().name(roleName).build());
        }
    }
}
