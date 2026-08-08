package com.marketplace.mapper;

import com.marketplace.dto.SubscriptionPlanDto;
import com.marketplace.dto.SubscriptionPlanResponse;
import com.marketplace.entity.SubscriptionPlan;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface SubscriptionPlanMapper {
    SubscriptionPlanDto toDto(SubscriptionPlan entity);
    SubscriptionPlan toEntity(SubscriptionPlanDto dto);
    SubscriptionPlanResponse toResponse(SubscriptionPlan entity);
    SubscriptionPlan toEntityFromResponse(SubscriptionPlanResponse response);
}
