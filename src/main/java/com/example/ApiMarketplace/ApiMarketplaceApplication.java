package com.example.ApiMarketplace;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.mongodb.config.EnableMongoAuditing;
import org.springframework.data.mongodb.repository.config.EnableMongoRepositories;

@SpringBootApplication(scanBasePackages = {"com.marketplace", "com.example.ApiMarketplace"})
@EnableMongoRepositories(basePackages = "com.marketplace.repository")
@EnableMongoAuditing
public class ApiMarketplaceApplication {

	public static void main(String[] args) {
		SpringApplication.run(ApiMarketplaceApplication.class, args);
	}

}
