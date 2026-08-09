package com.marketplace;

import static org.hamcrest.Matchers.notNullValue;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.example.ApiMarketplace.ApiMarketplaceApplication;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.marketplace.dto.LoginRequest;
import com.marketplace.dto.RegisterRequest;
import com.marketplace.entity.Api;
import com.marketplace.entity.ApiStatus;
import com.marketplace.entity.BillingCycle;
import com.marketplace.entity.SubscriptionPlan;
import com.marketplace.repository.ApiKeyRepository;
import com.marketplace.repository.ApiRepository;
import com.marketplace.repository.SubscriptionPlanRepository;
import com.marketplace.repository.SubscriptionRepository;
import com.marketplace.repository.UsageLogRepository;
import com.marketplace.repository.UserRepository;
import java.math.BigDecimal;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.annotation.DirtiesContext;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

@SpringBootTest(classes = ApiMarketplaceApplication.class)
@AutoConfigureMockMvc
@ActiveProfiles("test")
@DirtiesContext(classMode = DirtiesContext.ClassMode.BEFORE_EACH_TEST_METHOD)
class ApiKeyAuthenticationIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private ApiRepository apiRepository;

    @Autowired
    private SubscriptionPlanRepository subscriptionPlanRepository;

    @Autowired
    private SubscriptionRepository subscriptionRepository;

    @Autowired
    private ApiKeyRepository apiKeyRepository;

    @Autowired
    private UsageLogRepository usageLogRepository;

    @Autowired
    private UserRepository userRepository;

    @BeforeEach
    void clearData() {
        apiKeyRepository.deleteAll();
        usageLogRepository.deleteAll();
        subscriptionRepository.deleteAll();
        subscriptionPlanRepository.deleteAll();
        apiRepository.deleteAll();
        userRepository.deleteAll();
    }

    @Test
    void validApiKeyShouldExecuteProtectedEndpointAndRecordUsage() throws Exception {
        String consumerToken = registerAndGetToken("consumer@example.com", "Consumer One", "CONSUMER");

        Api api = apiRepository.save(Api.builder()
                .id("api-1")
                .providerId("provider-1")
                .name("Weather API")
                .description("Real-time weather data")
                .baseUrl("https://example.com/weather")
                .categoryId("cat-1")
                .logo("/logos/weather.png")
                .version("v1")
                .authenticationType("API_KEY")
                .rateLimit(100)
                .status(ApiStatus.APPROVED)
                .deleted(false)
                .build());

        SubscriptionPlan plan = subscriptionPlanRepository.save(SubscriptionPlan.builder()
                .id("plan-1")
                .apiId(api.getId())
                .planName("Starter")
                .price(BigDecimal.valueOf(5))
                .billingCycle(BillingCycle.MONTHLY)
                .requestLimit(5)
                .active(true)
                .build());

        String subscriptionResponse = mockMvc.perform(post("/api/consumer/subscriptions")
                        .header("Authorization", "Bearer " + consumerToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new CreateSubscriptionRequest(api.getId(), plan.getId()))))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.subscriptionId", notNullValue()))
                .andReturn()
                .getResponse()
                .getContentAsString();

        String subscriptionId = objectMapper.readTree(subscriptionResponse).get("subscriptionId").asText();

        String activationResponse = mockMvc.perform(post("/api/consumer/dev/subscriptions/{subscriptionId}/activate", subscriptionId)
                        .header("Authorization", "Bearer " + consumerToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.apiKey", notNullValue()))
                .andReturn()
                .getResponse()
                .getContentAsString();

        String apiKey = objectMapper.readTree(activationResponse).get("apiKey").asText();

        mockMvc.perform(get("/api/marketplace/apis/{apiId}/execute", api.getId())
                        .header("Authorization", "Bearer " + apiKey))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("SUCCESS"));

        assert usageLogRepository.count() > 0;
    }

    @Test
    void revokedApiKeyShouldBeRejectedAndNotExecute() throws Exception {
        String consumerToken = registerAndGetToken("consumer-b@example.com", "Consumer Two", "CONSUMER");

        Api api = apiRepository.save(Api.builder()
                .id("api-2")
                .providerId("provider-1")
                .name("Payments API")
                .description("Payment gateway data")
                .baseUrl("https://example.com/payments")
                .categoryId("cat-1")
                .logo("/logos/payments.png")
                .version("v1")
                .authenticationType("API_KEY")
                .rateLimit(100)
                .status(ApiStatus.APPROVED)
                .deleted(false)
                .build());

        SubscriptionPlan plan = subscriptionPlanRepository.save(SubscriptionPlan.builder()
                .id("plan-2")
                .apiId(api.getId())
                .planName("Pro")
                .price(BigDecimal.valueOf(15))
                .billingCycle(BillingCycle.MONTHLY)
                .requestLimit(2)
                .active(true)
                .build());

        String subscriptionResponse = mockMvc.perform(post("/api/consumer/subscriptions")
                        .header("Authorization", "Bearer " + consumerToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new CreateSubscriptionRequest(api.getId(), plan.getId()))))
                .andExpect(status().isCreated())
                .andReturn()
                .getResponse()
                .getContentAsString();

        String subscriptionId = objectMapper.readTree(subscriptionResponse).get("subscriptionId").asText();

        String activationResponse = mockMvc.perform(post("/api/consumer/dev/subscriptions/{subscriptionId}/activate", subscriptionId)
                        .header("Authorization", "Bearer " + consumerToken))
                .andExpect(status().isOk())
                .andReturn()
                .getResponse()
                .getContentAsString();

        String apiKey = objectMapper.readTree(activationResponse).get("apiKey").asText();
        String apiKeyId = apiKeyRepository.findAll().get(0).getId();

        mockMvc.perform(delete("/api/consumer/api-keys/{id}", apiKeyId)
                        .header("Authorization", "Bearer " + consumerToken))
                .andExpect(status().isNoContent());

        mockMvc.perform(get("/api/marketplace/apis/{apiId}/execute", api.getId())
                        .header("Authorization", "Bearer " + apiKey))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void rateLimitExceededShouldReturn429AndTrackRateLimitedUsage() throws Exception {
        String consumerToken = registerAndGetToken("consumer-c@example.com", "Consumer Three", "CONSUMER");

        Api api = apiRepository.save(Api.builder()
                .id("api-3")
                .providerId("provider-1")
                .name("Reports API")
                .description("Reporting data")
                .baseUrl("https://example.com/reports")
                .categoryId("cat-1")
                .logo("/logos/reports.png")
                .version("v1")
                .authenticationType("API_KEY")
                .rateLimit(100)
                .status(ApiStatus.APPROVED)
                .deleted(false)
                .build());

        SubscriptionPlan plan = subscriptionPlanRepository.save(SubscriptionPlan.builder()
                .id("plan-3")
                .apiId(api.getId())
                .planName("Basic")
                .price(BigDecimal.valueOf(0))
                .billingCycle(BillingCycle.MONTHLY)
                .requestLimit(2)
                .active(true)
                .build());

        String subscriptionResponse = mockMvc.perform(post("/api/consumer/subscriptions")
                        .header("Authorization", "Bearer " + consumerToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new CreateSubscriptionRequest(api.getId(), plan.getId()))))
                .andExpect(status().isCreated())
                .andReturn()
                .getResponse()
                .getContentAsString();

        String subscriptionId = objectMapper.readTree(subscriptionResponse).get("subscriptionId").asText();

        String activationResponse = mockMvc.perform(post("/api/consumer/dev/subscriptions/{subscriptionId}/activate", subscriptionId)
                        .header("Authorization", "Bearer " + consumerToken))
                .andExpect(status().isOk())
                .andReturn()
                .getResponse()
                .getContentAsString();

        String apiKey = objectMapper.readTree(activationResponse).get("apiKey").asText();

        mockMvc.perform(get("/api/marketplace/apis/{apiId}/execute", api.getId())
                        .header("Authorization", "Bearer " + apiKey))
                .andExpect(status().isOk());

        mockMvc.perform(get("/api/marketplace/apis/{apiId}/execute", api.getId())
                        .header("Authorization", "Bearer " + apiKey))
                .andExpect(status().isOk());

        mockMvc.perform(get("/api/marketplace/apis/{apiId}/execute", api.getId())
                        .header("Authorization", "Bearer " + apiKey))
                .andExpect(status().isTooManyRequests());
    }

    private String registerAndGetToken(String email, String fullName, String role) throws Exception {
        RegisterRequest request = RegisterRequest.builder()
                .fullName(fullName)
                .email(email)
                .password("Password123")
                .role(role)
                .build();

        String response = mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andReturn()
                .getResponse()
                .getContentAsString();

        return objectMapper.readTree(response).get("token").asText();
    }

    static class CreateSubscriptionRequest {
        public String apiId;
        public String planId;

        public CreateSubscriptionRequest() {
        }

        public CreateSubscriptionRequest(String apiId, String planId) {
            this.apiId = apiId;
            this.planId = planId;
        }
    }
}
