package com.example.ApiMarketplace;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.domain.EntityScan;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;

@SpringBootApplication(scanBasePackages = {"com.marketplace", "com.example.ApiMarketplace"})
@EntityScan(basePackages = "com.marketplace.entity")
@EnableJpaRepositories(basePackages = "com.marketplace.repository")
public class ApiMarketplaceApplication {

	public static void main(String[] args) {
		SpringApplication.run(ApiMarketplaceApplication.class, args);
	}

}
