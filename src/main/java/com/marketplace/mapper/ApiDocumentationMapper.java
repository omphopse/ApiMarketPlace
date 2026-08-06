package com.marketplace.mapper;

import com.marketplace.dto.ApiDocumentationDto;
import com.marketplace.entity.ApiDocumentation;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface ApiDocumentationMapper {
    ApiDocumentationDto toDto(ApiDocumentation entity);
    ApiDocumentation toEntity(ApiDocumentationDto dto);
}
