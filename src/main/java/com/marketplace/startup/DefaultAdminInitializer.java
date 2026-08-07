package com.marketplace.startup;

import com.marketplace.constants.AppConstants;
import com.marketplace.entity.ApprovalStatus;
import com.marketplace.entity.Category;
import com.marketplace.entity.Role;
import com.marketplace.entity.User;
import com.marketplace.repository.CategoryRepository;
import com.marketplace.repository.RoleRepository;
import com.marketplace.repository.UserRepository;
import java.util.List;
import java.util.concurrent.atomic.AtomicLong;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Component
@RequiredArgsConstructor
public class DefaultAdminInitializer implements ApplicationRunner {
    private final AtomicLong idGenerator = new AtomicLong(1L);
    private final RoleRepository roleRepository;
    private final CategoryRepository categoryRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        createRoleIfMissing(AppConstants.ROLE_ADMIN);
        createRoleIfMissing(AppConstants.ROLE_PROVIDER);
        createRoleIfMissing(AppConstants.ROLE_CONSUMER);
        seedCategories();

        if (!userRepository.existsByEmail(AppConstants.DEFAULT_ADMIN_EMAIL)) {
            Role adminRole = roleRepository.findByName(AppConstants.ROLE_ADMIN).orElseThrow();
            User admin = User.builder()
                    .id(idGenerator.getAndIncrement())
                    .fullName("System Administrator")
                    .email(AppConstants.DEFAULT_ADMIN_EMAIL)
                    .password(passwordEncoder.encode(AppConstants.DEFAULT_ADMIN_PASSWORD))
                    .enabled(true)
                    .role(adminRole)
                    .approvalStatus(ApprovalStatus.APPROVED)
                    .build();
            userRepository.save(admin);
        }
    }

    private void seedCategories() {
        if (categoryRepository.count() > 0) {
            return;
        }
        List<Category> categories = List.of(
                Category.builder().id(idGenerator.getAndIncrement()).name("AI").description("Artificial intelligence and machine learning APIs").icon("ai").active(true).build(),
                Category.builder().id(idGenerator.getAndIncrement()).name("Finance").description("Financial data and payments APIs").icon("finance").active(true).build(),
                Category.builder().id(idGenerator.getAndIncrement()).name("Crypto").description("Cryptocurrency and blockchain APIs").icon("crypto").active(true).build(),
                Category.builder().id(idGenerator.getAndIncrement()).name("Weather").description("Weather and climate APIs").icon("weather").active(true).build(),
                Category.builder().id(idGenerator.getAndIncrement()).name("Maps").description("Location and mapping APIs").icon("maps").active(true).build(),
                Category.builder().id(idGenerator.getAndIncrement()).name("Payments").description("Payments and billing APIs").icon("payments").active(true).build(),
                Category.builder().id(idGenerator.getAndIncrement()).name("Messaging").description("Chat and messaging APIs").icon("messaging").active(true).build(),
                Category.builder().id(idGenerator.getAndIncrement()).name("Social Media").description("Social networking APIs").icon("social").active(true).build(),
                Category.builder().id(idGenerator.getAndIncrement()).name("Developer Tools").description("Developer utilities and integrations").icon("developer-tools").active(true).build(),
                Category.builder().id(idGenerator.getAndIncrement()).name("Storage").description("Data and file storage APIs").icon("storage").active(true).build(),
                Category.builder().id(idGenerator.getAndIncrement()).name("Authentication").description("Identity and authentication APIs").icon("authentication").active(true).build(),
                Category.builder().id(idGenerator.getAndIncrement()).name("Healthcare").description("Health and medical APIs").icon("healthcare").active(true).build(),
                Category.builder().id(idGenerator.getAndIncrement()).name("Education").description("Learning and educational APIs").icon("education").active(true).build(),
                Category.builder().id(idGenerator.getAndIncrement()).name("Travel").description("Travel and booking APIs").icon("travel").active(true).build(),
                Category.builder().id(idGenerator.getAndIncrement()).name("News").description("News and media APIs").icon("news").active(true).build()
        );
        categoryRepository.saveAll(categories);
    }

    private void createRoleIfMissing(String roleName) {
        if (roleRepository.findByName(roleName).isEmpty()) {
            roleRepository.save(Role.builder().id(idGenerator.getAndIncrement()).name(roleName).build());
        }
    }
}
