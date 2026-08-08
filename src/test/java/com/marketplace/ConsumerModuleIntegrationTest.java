package com.marketplace;

import static org.hamcrest.Matchers.hasSize;
import static org.hamcrest.Matchers.notNullValue;
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
import com.marketplace.repository.ApiRepository;
import com.marketplace.repository.SubscriptionPlanRepository;
import com.marketplace.repository.SubscriptionRepository;
import com.marketplace.repository.UserRepository;
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
class ConsumerModuleIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private ApiRepository apiRepository;

    @Autowired
    private SubscriptionPlanRepository subscriptionPlanRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private SubscriptionRepository subscriptionRepository;

    @BeforeEach
    void clearData() {
        subscriptionRepository.deleteAll();
        subscriptionPlanRepository.deleteAll();
        apiRepository.deleteAll();
    }

    @Test
    void marketplaceShouldExposeOnlyApprovedApisAndConsumerCanCreateSubscription() throws Exception {
        String providerToken = registerAndGetToken("provider@example.com", "Provider One", "PROVIDER");
        String consumerToken = registerAndGetToken("consumer@example.com", "Consumer One", "CONSUMER");

        Api approvedApi = apiRepository.save(Api.builder()
                .id("1001")
                .providerId("1")
                .name("Weather API")
                .description("Real-time weather data")
                .baseUrl("https://example.com/weather")
                .categoryId("1")
                .logo("/logos/weather.png")
                .version("v1")
                .authenticationType("API_KEY")
                .rateLimit(100)
                .status(ApiStatus.APPROVED)
                .deleted(false)
                .build());

        Api pendingApi = apiRepository.save(Api.builder()
                .id("1002")
                .providerId("1")
                .name("Pending API")
                .description("Should not be visible")
                .baseUrl("https://example.com/pending")
                .categoryId("1")
                .logo("/logos/pending.png")
                .version("v1")
                .authenticationType("API_KEY")
                .rateLimit(100)
                .status(ApiStatus.PENDING)
                .deleted(false)
                .build());

        SubscriptionPlan plan = subscriptionPlanRepository.save(SubscriptionPlan.builder()
                .id("2001")
                .apiId(approvedApi.getId())
                .planName("Starter")
                .price(java.math.BigDecimal.valueOf(499.00))
                .billingCycle(BillingCycle.MONTHLY)
                .requestLimit(1000)
                .active(true)
                .build());

        mockMvc.perform(get("/api/marketplace/apis")
                        .header("Authorization", "Bearer " + consumerToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content", hasSize(1)))
                .andExpect(jsonPath("$.content[0].name").value("Weather API"))
                .andExpect(jsonPath("$.content[0].id").value(approvedApi.getId()));

        mockMvc.perform(post("/api/consumer/subscriptions")
                        .header("Authorization", "Bearer " + consumerToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new CreateSubscriptionRequest(approvedApi.getId(), plan.getId()))))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.subscriptionId", notNullValue()))
                .andExpect(jsonPath("$.status").value("PENDING"));
    }

    @Test
    void consumerShouldNotAccessAnotherConsumersSubscription() throws Exception {
        String consumerOneToken = registerAndGetToken("consumer-a@example.com", "Consumer A", "CONSUMER");
        String consumerTwoToken = registerAndGetToken("consumer-b@example.com", "Consumer B", "CONSUMER");

        Api approvedApi = apiRepository.save(Api.builder()
                .id("1003")
                .providerId("1")
                .name("Analytics API")
                .description("Analytics data")
                .baseUrl("https://example.com/analytics")
                .categoryId("1")
                .logo("/logos/analytics.png")
                .version("v1")
                .authenticationType("API_KEY")
                .rateLimit(100)
                .status(ApiStatus.APPROVED)
                .deleted(false)
                .build());

        SubscriptionPlan plan = subscriptionPlanRepository.save(SubscriptionPlan.builder()
                .id("2002")
                .apiId(approvedApi.getId())
                .planName("Pro")
                .price(java.math.BigDecimal.valueOf(199.00))
                .billingCycle(BillingCycle.MONTHLY)
                .requestLimit(5000)
                .active(true)
                .build());

        String body = mockMvc.perform(post("/api/consumer/subscriptions")
                        .header("Authorization", "Bearer " + consumerOneToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new CreateSubscriptionRequest(approvedApi.getId(), plan.getId()))))
                .andExpect(status().isCreated())
                .andReturn()
                .getResponse()
                .getContentAsString();

        String subscriptionId = objectMapper.readTree(body).get("subscriptionId").asText();

        mockMvc.perform(get("/api/consumer/subscriptions/{id}", subscriptionId)
                        .header("Authorization", "Bearer " + consumerTwoToken))
                .andExpect(status().isForbidden());
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
