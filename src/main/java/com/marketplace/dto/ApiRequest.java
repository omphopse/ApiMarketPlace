package com.marketplace.dto;

import lombok.Data;

@Data
public class ApiRequest {

    private String name;

    private String description;

    private Long categoryId;

    private String version;

    private String baseUrl;

    private String documentationUrl;

    private String pricing;

}
