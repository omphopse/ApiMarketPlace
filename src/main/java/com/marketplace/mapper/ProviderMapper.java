package com.marketplace.mapper;

import com.marketplace.dto.ProviderProfileDto;
import com.marketplace.entity.ProviderProfile;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface ProviderMapper {
    ProviderProfileDto toDto(ProviderProfile entity);
    ProviderProfile toEntity(ProviderProfileDto dto);
}
