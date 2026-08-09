package com.marketplace.controller;

import com.marketplace.dto.UsageLogResponse;
import com.marketplace.entity.UsageLog;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import org.bson.types.ObjectId;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/internal/debug")
@RequiredArgsConstructor
public class DebugController {
    private final MongoTemplate mongoTemplate;

    @GetMapping("/usage-by-subscription")
    public ResponseEntity<List<UsageLogResponse>> usageBySubscription(@RequestParam String subscriptionId) {
        Query q = Query.query(Criteria.where("subscription").is(new ObjectId(subscriptionId)));
        List<UsageLog> logs = mongoTemplate.find(q, UsageLog.class, "usage_logs");
        List<UsageLogResponse> resp = logs.stream().map(this::toDto).collect(Collectors.toList());
        return ResponseEntity.ok(resp);
    }

    private UsageLogResponse toDto(UsageLog l) {
        return UsageLogResponse.builder()
                .id(l.getId())
                .endpoint(l.getEndpoint())
                .httpMethod(l.getHttpMethod())
                .statusCode(l.getStatusCode())
                .responseTimeMs(l.getResponseTimeMs())
                .timestamp(l.getTimestamp() == null ? LocalDateTime.MIN : l.getTimestamp())
                .build();
    }
}
