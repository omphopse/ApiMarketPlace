# Data Contract Fixes - Code Changes Reference

## Complete Code Modifications

---

## File 1: ConsumerServiceImpl.java

### Change 1: Added ProviderProfile Import
**Location:** Import section (line ~25)

```java
// ADDED
import com.marketplace.entity.ProviderProfile;
```

### Change 2: Added ProviderProfileRepository Import
**Location:** Import section (line ~45)

```java
// ADDED
import com.marketplace.repository.ProviderProfileRepository;
```

### Change 3: Injected ProviderProfileRepository
**Location:** Field declarations (line ~95)

```java
@Service
@RequiredArgsConstructor
public class ConsumerServiceImpl implements ConsumerService {
    private final ConsumerProfileRepository consumerProfileRepository;
    private final UserRepository userRepository;
    private final ApiRepository apiRepository;
    private final CategoryRepository categoryRepository;
    private final ProviderProfileRepository providerProfileRepository;  // ADDED
    private final SubscriptionPlanRepository subscriptionPlanRepository;
    private final SubscriptionRepository subscriptionRepository;
    private final ApiKeyRepository apiKeyRepository;
    private final ApiDocumentationRepository apiDocumentationRepository;
    private final UsageLogRepository usageLogRepository;
    private final NotificationService notificationService;
}
```

### Change 4: Fixed toMarketplaceCard() Method
**Location:** Lines 426-445
**Issue:** Provider name returned numeric ID instead of company name

```java
// BEFORE
private ApiMarketplaceCardResponse toMarketplaceCard(Api api) {
    Category category = categoryRepository.findById(api.getCategoryId()).orElse(null);
    return ApiMarketplaceCardResponse.builder()
            .id(api.getId())
            .name(api.getName())
            .shortDescription(api.getDescription())
            .logoUrl(api.getLogo())
            .category(category != null ? category.getName() : null)
            .providerName(api.getProviderId() != null ? String.valueOf(api.getProviderId()) : null)  // BUG: Returns numeric ID
            .version(api.getVersion())
            .startingPrice(subscriptionPlanRepository.findByApiId(api.getId()).stream().filter(SubscriptionPlan::isActive).min((a, b) -> a.getPrice().compareTo(b.getPrice())).map(SubscriptionPlan::getPrice).orElse(BigDecimal.ZERO))
            .hasFreePlan(subscriptionPlanRepository.findByApiId(api.getId()).stream().anyMatch(plan -> plan.isActive() && plan.getPrice().compareTo(BigDecimal.ZERO) == 0))
            .build();
}

// AFTER
private ApiMarketplaceCardResponse toMarketplaceCard(Api api) {
    Category category = categoryRepository.findById(api.getCategoryId()).orElse(null);
    String providerName = null;
    if (api.getProviderId() != null) {
        providerName = providerProfileRepository.findByUserId(api.getProviderId())
                .map(ProviderProfile::getCompanyName)
                .orElse(null);
    }
    return ApiMarketplaceCardResponse.builder()
            .id(api.getId())
            .name(api.getName())
            .shortDescription(api.getDescription())
            .logoUrl(api.getLogo())
            .category(category != null ? category.getName() : null)
            .providerName(providerName)  // FIXED: Returns actual company name
            .version(api.getVersion())
            .startingPrice(subscriptionPlanRepository.findByApiId(api.getId()).stream().filter(SubscriptionPlan::isActive).min((a, b) -> a.getPrice().compareTo(b.getPrice())).map(SubscriptionPlan::getPrice).orElse(BigDecimal.ZERO))
            .hasFreePlan(subscriptionPlanRepository.findByApiId(api.getId()).stream().anyMatch(plan -> plan.isActive() && plan.getPrice().compareTo(BigDecimal.ZERO) == 0))
            .build();
}
```

### Change 5: Fixed getMarketplaceApi() Method
**Location:** Lines 130-160
**Issue:** Provider summary had null name field

```java
// BEFORE
@Override
@Transactional
public ApiMarketplaceDetailsResponse getMarketplaceApi(String apiId) {
    Api api = apiRepository.findByIdAndDeletedFalse(apiId)
            .filter(a -> a.getStatus() == ApiStatus.APPROVED)
            .orElseThrow(() -> new ApiNotAvailableException("API is not available"));
    Category category = categoryRepository.findById(api.getCategoryId()).orElse(null);
    return ApiMarketplaceDetailsResponse.builder()
            .id(api.getId())
            .name(api.getName())
            .description(api.getDescription())
            .logoUrl(api.getLogo())
            .category(category != null ? CategoryResponse.builder().id(category.getId()).name(category.getName()).build() : null)
            .provider(new ApiMarketplaceDetailsResponse.ProviderSummary(api.getProviderId() != null ? String.valueOf(api.getProviderId()) : null, null))  // BUG: name=null
            .version(api.getVersion())
            .documentationAvailable(apiDocumentationRepository.findFirstByApiId(api.getId()).isPresent())
            .build();
}

// AFTER
@Override
@Transactional
public ApiMarketplaceDetailsResponse getMarketplaceApi(String apiId) {
    Api api = apiRepository.findByIdAndDeletedFalse(apiId)
            .filter(a -> a.getStatus() == ApiStatus.APPROVED)
            .orElseThrow(() -> new ApiNotAvailableException("API is not available"));
    Category category = categoryRepository.findById(api.getCategoryId()).orElse(null);
    
    String providerName = null;
    if (api.getProviderId() != null) {
        providerName = providerProfileRepository.findByUserId(api.getProviderId())
                .map(ProviderProfile::getCompanyName)
                .orElse(null);
    }
    
    return ApiMarketplaceDetailsResponse.builder()
            .id(api.getId())
            .name(api.getName())
            .description(api.getDescription())
            .logoUrl(api.getLogo())
            .category(category != null ? CategoryResponse.builder().id(category.getId()).name(category.getName()).build() : null)
            .provider(new ApiMarketplaceDetailsResponse.ProviderSummary(providerName, null))  // FIXED: name=actual company name
            .version(api.getVersion())
            .documentationAvailable(apiDocumentationRepository.findFirstByApiId(api.getId()).isPresent())
            .build();
}
```

### Change 6: Fixed buildUsageSummary() Method
**Location:** Lines 476-500
**Issue:** Success rate always 100%, failures always 0

```java
// BEFORE
private UsageSummaryResponse buildUsageSummary(Subscription subscription) {
    long totalRequests = usageLogRepository.countByConsumerSince(subscription.getConsumer(), subscription.getStartedAt() != null ? subscription.getStartedAt() : LocalDateTime.now().minusYears(10));
    long successfulRequests = totalRequests;  // BUG: Always equals total
    long failedRequests = 0;                   // BUG: Always zero
    int requestLimit = subscription.getSubscriptionPlan().getRequestLimit();
    long remainingRequests = Math.max(0L, (long) requestLimit - totalRequests);
    return UsageSummaryResponse.builder()
            .totalRequests(totalRequests)
            .successfulRequests(successfulRequests)
            .failedRequests(failedRequests)
            .requestLimit(requestLimit)
            .remainingRequests(remainingRequests)
            .periodStart(subscription.getStartedAt())
            // ... rest of fields
}

// AFTER
private UsageSummaryResponse buildUsageSummary(Subscription subscription) {
    LocalDateTime startDate = subscription.getStartedAt() != null ? subscription.getStartedAt() : LocalDateTime.now().minusYears(10);
    List<UsageLog> usageLogs = usageLogRepository.findByConsumerAndTimestampAfter(subscription.getConsumer(), startDate);
    long totalRequests = usageLogs.size();
    
    // Calculate successful (2xx) and failed (non-2xx) requests
    long successfulRequests = usageLogs.stream()
            .filter(log -> log.getStatusCode() >= 200 && log.getStatusCode() < 300)
            .count();
    long failedRequests = totalRequests - successfulRequests;
    
    int requestLimit = subscription.getSubscriptionPlan().getRequestLimit();
    long remainingRequests = Math.max(0L, (long) requestLimit - totalRequests);
    return UsageSummaryResponse.builder()
            .totalRequests(totalRequests)
            .successfulRequests(successfulRequests)  // FIXED: Calculated from actual data
            .failedRequests(failedRequests)          // FIXED: Calculated from actual data
            .requestLimit(requestLimit)
            .remainingRequests(remainingRequests)
            .periodStart(subscription.getStartedAt())
            // ... rest of fields
}
```

---

## File 2: ProviderServiceImpl.java

### Change: Fixed getDashboard() Method
**Location:** Lines 153-195
**Issue:** monthlyRevenue and totalSubscribers hardcoded to 0

```java
// BEFORE
@Override
@Transactional
public DashboardDto getDashboard(String userId) {
    long totalApis = apiRepository.countByProviderIdAndDeletedFalse(userId);
    long approvedApis = apiRepository.countByProviderIdAndStatusAndDeletedFalse(userId, ApiStatus.APPROVED);
    long pendingApis = apiRepository.countByProviderIdAndStatusAndDeletedFalse(userId, ApiStatus.PENDING);
    long rejectedApis = apiRepository.countByProviderIdAndStatusAndDeletedFalse(userId, ApiStatus.REJECTED);
    long archivedApis = apiRepository.countByProviderIdAndStatusAndDeletedFalse(userId, ApiStatus.ARCHIVED);

    List<ApiSummaryDto> recentApis = apiRepository.findTop5ByProviderIdAndDeletedFalseOrderByCreatedAtDesc(userId).stream()
        .map(this::apiToSummaryDto)
        .collect(Collectors.toList());

    return DashboardDto.builder()
            .totalApis(totalApis)
            .approvedApis(approvedApis)
            .pendingApis(pendingApis)
            .rejectedApis(rejectedApis)
            .archivedApis(archivedApis)
            .monthlyRevenue(0)              // BUG: Hardcoded zero
            .totalSubscribers(0)            // BUG: Hardcoded zero
            .recentApis(recentApis)
            .build();
}

// AFTER
@Override
@Transactional
public DashboardDto getDashboard(String userId) {
    long totalApis = apiRepository.countByProviderIdAndDeletedFalse(userId);
    long approvedApis = apiRepository.countByProviderIdAndStatusAndDeletedFalse(userId, ApiStatus.APPROVED);
    long pendingApis = apiRepository.countByProviderIdAndStatusAndDeletedFalse(userId, ApiStatus.PENDING);
    long rejectedApis = apiRepository.countByProviderIdAndStatusAndDeletedFalse(userId, ApiStatus.REJECTED);
    long archivedApis = apiRepository.countByProviderIdAndStatusAndDeletedFalse(userId, ApiStatus.ARCHIVED);

    List<ApiSummaryDto> recentApis = apiRepository.findTop5ByProviderIdAndDeletedFalseOrderByCreatedAtDesc(userId).stream()
        .map(this::apiToSummaryDto)
        .collect(Collectors.toList());

    // Calculate total subscribers from all active subscriptions for this provider's APIs
    List<Api> providerApis = apiRepository.findByProviderIdAndDeletedFalseOrderByCreatedAtDesc(userId);
    long totalSubscribers = 0;
    BigDecimal monthlyRevenue = BigDecimal.ZERO;
    
    for (Api api : providerApis) {
        // Count active subscriptions for each API
        List<Subscription> apiSubscriptions = subscriptionRepository.findByApi_IdAndStatus(api.getId(), SubscriptionStatus.ACTIVE);
        totalSubscribers += apiSubscriptions.size();
        
        // Sum revenue from subscriptions created in the last month
        LocalDateTime oneMonthAgo = LocalDateTime.now().minusMonths(1);
        for (Subscription sub : apiSubscriptions) {
            if (sub.getCreatedAt().isAfter(oneMonthAgo)) {
                if (sub.getPrice() != null) {
                    monthlyRevenue = monthlyRevenue.add(sub.getPrice());
                }
            }
        }
    }

    return DashboardDto.builder()
            .totalApis(totalApis)
            .approvedApis(approvedApis)
            .pendingApis(pendingApis)
            .rejectedApis(rejectedApis)
            .archivedApis(archivedApis)
            .monthlyRevenue(monthlyRevenue.intValue())  // FIXED: Calculated from subscriptions
            .totalSubscribers(totalSubscribers)          // FIXED: Calculated from subscriptions
            .recentApis(recentApis)
            .build();
}
```

---

## File 3: UsageLogRepository.java

### Change: Added New Query Method
**Location:** End of interface (after existing methods)

```java
// BEFORE
public interface UsageLogRepository extends MongoRepository<UsageLog, String> {
    long countByConsumer(User consumer);

    @Query(value = "{ 'consumer': ?0, 'timestamp': { $gte: ?1 } }", count = true)
    long countByConsumerSince(User consumer, LocalDateTime start);

    @Query("{ 'consumer': ?0 }")
    List<UsageLog> findTop10ByConsumerOrderByTimestampDesc(User consumer);

    long countByApi_Id(String apiId);
}

// AFTER
public interface UsageLogRepository extends MongoRepository<UsageLog, String> {
    long countByConsumer(User consumer);

    @Query(value = "{ 'consumer': ?0, 'timestamp': { $gte: ?1 } }", count = true)
    long countByConsumerSince(User consumer, LocalDateTime start);

    @Query("{ 'consumer': ?0 }")
    List<UsageLog> findTop10ByConsumerOrderByTimestampDesc(User consumer);

    @Query("{ 'consumer': ?0, 'timestamp': { $gte: ?1 } }")  // ADDED
    List<UsageLog> findByConsumerAndTimestampAfter(User consumer, LocalDateTime start);

    long countByApi_Id(String apiId);
}
```

---

## Summary of Changes

| File | Method | Change Type | Lines | Issue Fixed |
|------|--------|-------------|-------|------------|
| ConsumerServiceImpl.java | toMarketplaceCard() | Logic change | 426-445 | Issue #1 |
| ConsumerServiceImpl.java | getMarketplaceApi() | Logic change | 130-160 | Issue #1 |
| ConsumerServiceImpl.java | buildUsageSummary() | Logic change | 476-500 | Issue #2 |
| ConsumerServiceImpl.java | (class level) | Import + injection | ~25, ~45, ~95 | Support Issue #1 |
| ProviderServiceImpl.java | getDashboard() | Logic change | 153-195 | Issue #3 |
| UsageLogRepository.java | (interface) | New method | end | Support Issue #2 |

**Total Changes:** ~150 lines across 3 files

---

## How to Apply These Changes

If working from version control:

```bash
# These changes have already been applied to:
# - src/main/java/com/marketplace/service/impl/ConsumerServiceImpl.java
# - src/main/java/com/marketplace/service/impl/ProviderServiceImpl.java
# - src/main/java/com/marketplace/repository/UsageLogRepository.java

# Verify changes compiled
.\mvnw.cmd clean compile

# Run tests
.\mvnw.cmd test
```

---

## Testing the Changes

See `DATA_CONTRACT_E2E_TEST_PLAN.md` for comprehensive test scenarios.

Quick validation:
```bash
# Provider name should display correctly
GET /api/consumer/marketplace
# Expected: providerName = "Acme Corp" (not "123")

# Usage metrics should be realistic
GET /api/consumer/subscriptions/{id}
# Expected: successfulRequests < totalRequests (if failures exist)

# Provider revenue should be non-zero
GET /api/provider/dashboard
# Expected: monthlyRevenue > 0, totalSubscribers > 0
```

---

End of Code Changes Reference
