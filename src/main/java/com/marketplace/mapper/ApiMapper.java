package com.marketplace.mapper;

import com.marketplace.dto.ApiDetailsDto;
import com.marketplace.dto.ApiSummaryDto;
import com.marketplace.entity.Api;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.Named;

@Mapper(componentModel = "spring")
public interface ApiMapper {
    ApiSummaryDto toSummaryDto(Api api);
    ApiDetailsDto toDetailsDto(Api api);
}
