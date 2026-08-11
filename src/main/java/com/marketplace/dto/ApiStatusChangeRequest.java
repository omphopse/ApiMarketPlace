package com.marketplace.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ApiStatusChangeRequest {
    private String newStatus;
    private String reason;
}
