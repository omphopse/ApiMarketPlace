package com.marketplace.dto;

import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ConsumerProfileUpdateRequest {
    @Size(max = 150, message = "Display name must be at most 150 characters")
    private String displayName;

    @Size(max = 150, message = "Company name must be at most 150 characters")
    private String companyName;

    @Size(max = 255, message = "Website must be at most 255 characters")
    private String website;

    @Size(max = 100, message = "Country must be at most 100 characters")
    private String country;

    @Size(max = 255, message = "Profile image must be at most 255 characters")
    private String profileImage;
}
