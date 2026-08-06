package com.marketplace.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProviderProfileDto {
    private Long id;
    private Long userId;

    @NotBlank(message = "Company name is required")
    @Size(max = 150, message = "Company name must be at most 150 characters")
    private String companyName;

    @Size(max = 255, message = "Website must be at most 255 characters")
    private String website;

    @NotBlank(message = "Description is required")
    @Size(max = 1000, message = "Description must be at most 1000 characters")
    private String description;

    @NotBlank(message = "Support email is required")
    @Email(message = "Support email must be valid")
    private String supportEmail;

    @NotBlank(message = "Contact number is required")
    @Size(max = 50, message = "Contact number must be at most 50 characters")
    private String contactNumber;

    @Size(max = 100, message = "Country must be at most 100 characters")
    private String country;

    private String logo;
}
