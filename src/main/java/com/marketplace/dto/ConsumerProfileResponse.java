package com.marketplace.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ConsumerProfileResponse {
    private Long id;
    private String fullName;
    private String email;
    private String displayName;
    private String companyName;
    private String website;
    private String country;
    private String profileImage;
}
