# DATA CONTRACT AUDIT

**Date:** 2026-08-09  
**Status:** PHASE 1-2 COMPLETE - Identifying Data Inconsistencies

---

## EXECUTIVE SUMMARY

The API Marketplace has **multiple critical data contract failures**:

1. **Provider Name Resolution BROKEN**: Backend returns `providerId` as string instead of actual provider name
2. **ProviderProfile Data NOT EXPOSED**: ProviderProfile entity exists but is never returned in marketplace responses
3. **API Short Description MISSING**: Frontend expects `shortDescription` but backend only has `description`
4. **Dashboard Metrics HARDCODED**: Consumer/Provider dashboards show placeholder values (0 for revenue/subscribers)
5. **Usage Data INCOMPLETE**: Backend mock implementation returns zero actual metrics
6. **Category Response INCOMPLETE**: Category in API details missing category ID
7. **Consumer Profile MISSING USER LINK**: No userId exposed in ConsumerProfileResponse
8. **API Key Status INCONSISTENT**: LastUsedAt not tracked, not visible in response
9. **Provider Name DUPLICATED**: Some responses show providerId, others show provider.name
10. **Related APIs MISSING PROVIDER DATA**: Related APIs card lists provider but backend returns null

---

## PHASE 1: DATA FLOW ANALYSIS

### MongoDB → Entity → DTO → Controller → API → Frontend

#### **AUTHENTICATION FLOW**

| Component | Field | MongoDB | Entity | DTO | API Response | Frontend |
|-----------|-------|---------|--------|-----|--------------|----------|
| User | id | ✓ | ✓ | ✓ | ✓ | ✓ |
| User | email | ✓ | ✓ | ✓ | ✓ | ✓ |
| User | role | ✓ | DocumentReference | ✓ (role.name) | ✓ | ✓ |
| User | fullName | ✓ | ✓ | LoginResponse | ✓ | ✓ |
| User | password | ✓ | ✓ (hash) | ✗ | ✗ | ✗ |
| User | approvalStatus | ✓ | ✓ | UserResponse | ✓ (admin only) | N/A |
| User | createdAt | ✓ | ✓ | ✗ | ✗ | ✗ |

**ISSUES:**
- ✓ Secure (password not exposed)
- ? approvalStatus shown in admin user response but not consumer profile

#### **MARKETPLACE API LIST FLOW**

| Component | Field | MongoDB | Entity | DTO | API Response | Frontend |
|-----------|-------|---------|--------|-----|--------------|----------|
| Api | id | ✓ | ✓ | ✓ ApiMarketplaceCardResponse | ✓ | ✓ |
| Api | name | ✓ | ✓ | ✓ | ✓ | ✓ |
| Api | description | ✓ | ✓ | ✓ (as shortDescription) | ✓ | ✓ |
| Api | baseUrl | ✓ | ✓ | ✗ | ✗ | N/A (list view) |
| Api | categoryId | ✓ | ✓ | category.name only | ✓ | ✓ |
| Api | logo | ✓ | ✓ (as logoUrl) | ✓ | ✓ | ✓ |
| Api | version | ✓ | ✓ | ✓ | ✓ | ✓ |
| Api | providerId | ✓ | ✓ | ✗ BROKEN: returns String providerId | ✗ Shows ID as name | ✗ Shows "Provider unavailable" |
| Provider | companyName | ✓ ProviderProfile | MISSING | NEVER FETCHED | ✗ | ✗ |
| Plans | startingPrice | ✓ subscription_plans | DERIVED | ✓ (correct logic) | ✓ | ✓ |
| Plans | hasFreePlan | N/A | DERIVED | ✓ (correct logic) | ✓ | ✓ |

**CRITICAL ISSUES:**
1. **Provider name is BROKEN**: `String.valueOf(api.getProviderId())` instead of actual ProviderProfile.companyName
2. **ProviderProfile never fetched**: Service has access to repo but doesn't use it
3. **Frontend shows "Provider unavailable"**: Because backend returns null provider.name

#### **MARKETPLACE API DETAIL FLOW**

| Component | Field | MongoDB | Entity | DTO | API Response | Frontend |
|-----------|-------|---------|--------|-----|--------------|----------|
| Api | id | ✓ | ✓ | ApiMarketplaceDetailsResponse | ✓ | ✓ |
| Api | name | ✓ | ✓ | ✓ | ✓ | ✓ |
| Api | description | ✓ | ✓ | ✓ | ✓ | ✓ |
| Api | logo | ✓ | ✓ (logoUrl) | ✓ | ✓ | ✓ |
| Api | category | ✓ categoryId ref | Category lookup | CategoryResponse (id + name) | ✓ | ✓ |
| Api | provider | ✓ providerId | BROKEN: String.valueOf(providerId) | provider.name = null | provider.name = null | "Provider unavailable" |
| Provider | companyName | ✓ ProviderProfile | NOT FETCHED | ✓ ProviderSummary has name field | ✗ |  ✗ |
| Plans | list | ✓ subscription_plans | ✓ | SubscriptionPlanResponse | ✓ | ✓ |
| Plans | billingCycle | ✓ | ✓ | ✓ | ✓ | ✓ |
| Plans | requestLimit | ✓ | ✓ | ✓ | ✓ | ✓ |
| Documentation | available | ✓ ApiDocumentation | ✓ (exists check) | documentationAvailable boolean | ✓ | ✓ |

**CRITICAL ISSUES:**
1. **Provider name still BROKEN** in detail view
2. **ProviderSummary has name field but it's set to null**
3. **Frontend displays: "Provider unavailable"**

#### **CONSUMER DASHBOARD FLOW**

| Component | Field | MongoDB | Entity | DTO | API Response | Frontend |
|-----------|-------|---------|--------|-----|--------------|----------|
| Dashboard | activeSubscriptions | ✓ subscriptions (status=ACTIVE) | COUNT | ✓ long | ✓ | ✓ |
| Dashboard | totalSubscriptions | ✓ subscriptions | COUNT | ✓ long | ✓ | ✓ |
| Dashboard | totalRequestsThisMonth | ✓ usage_logs (filtered) | QUERY | ✓ long | ✓ | ✓ |
| Dashboard | remainingRequests | DERIVED | CALCULATED | ✓ long | ✓ | ✓ |
| Dashboard | recentSubscriptions | ✓ subscriptions (recent) | LIST | SubscriptionResponse | ✓ | ✓ (but missing provider name) |
| Subscription | api.name | ✓ apis | DocumentReference | ✓ | ✓ | ✓ |
| Subscription | plan.name | ✓ subscription_plans | DocumentReference | ✓ | ✓ | ✓ |
| Subscription | plan.price | ✓ | ✓ | ✓ | ✓ | ✓ |
| Subscription | status | ✓ | ✓ | ✓ | ✓ | ✓ |

**ISSUES:**
- ✓ Dashboard counts look correct
- ? recentSubscriptions array format looks correct but provider info not included

#### **SUBSCRIPTION DETAILS FLOW**

| Component | Field | MongoDB | Entity | DTO | API Response | Frontend |
|-----------|-------|---------|--------|-----|--------------|----------|
| Subscription | id | ✓ | ✓ | subscriptionId | ✓ | ✓ |
| Subscription | api.name | ✓ | ✓ | ✓ | ✓ | ✓ |
| Subscription | plan.name | ✓ | ✓ | ✓ | ✓ | ✓ |
| Subscription | status | ✓ | ✓ | ✓ | ✓ | ✓ |
| Subscription | startedAt | ✓ | ✓ | ✓ | ✓ | ✓ |
| Subscription | expiresAt | ✓ | ✓ | ✓ | ✓ | ✓ |
| Usage | totalRequests | ✓ usage_logs | COUNT | UsageSummaryResponse | ✓ | ✓ |
| Usage | successRate | ✓ usage_logs | CALCULATED | ✓ (100% hardcoded) | ✓ | ✓ |
| Usage | responseTime | NEVER TRACKED | NOT IN DB | ✗ | ✗ | "Not returned by backend" |
| ApiKey | id | ✓ | ✓ | ApiKeyMetadata | ✓ | ✓ |
| ApiKey | status | ✓ | ✓ | ✓ | ✓ | ✓ |
| ApiKey | lastUsedAt | ✓ (but never updated) | ✓ (never written) | ✓ | ✓ | ✓ |

**ISSUES:**
1. successRate is hardcoded to 100%: `successfulRequests = totalRequests`
2. responseTime never tracked in database
3. lastUsedAt never actually updated when key is used

#### **PROVIDER PROFILE FLOW**

| Component | Field | MongoDB | Entity | DTO | API Response | Frontend |
|-----------|-------|---------|--------|-----|--------------|----------|
| Profile | id | ✓ | ✓ | ✓ | ✓ | ✓ |
| Profile | userId | ✓ | ✓ | ✓ (READ_ONLY) | ✓ | ✓ |
| Profile | companyName | ✓ | ✓ | ✓ | ✓ | ✓ |
| Profile | website | ✓ | ✓ | ✓ | ✓ | ✓ |
| Profile | description | ✓ | ✓ | ✓ | ✓ | ✓ |
| Profile | supportEmail | ✓ | ✓ | ✓ | ✓ | ✓ |
| Profile | contactNumber | ✓ | ✓ | ✓ | ✓ | ✓ |
| Profile | country | ✓ | ✓ | ✓ | ✓ | ✓ |
| Profile | logo | ✓ | ✓ | ✓ | ✓ | ✓ |

**STATUS:** ✓ This flow looks complete and correct

#### **CONSUMER PROFILE FLOW**

| Component | Field | MongoDB | Entity | DTO | API Response | Frontend |
|-----------|-------|---------|--------|-----|--------------|----------|
| Profile | id | ✓ | ✓ | ✓ | ✓ | ✓ |
| Profile | fullName | ✓ users | JOINED | ✓ | ✓ | ✓ |
| Profile | email | ✓ users | JOINED | ✓ | ✓ | ✓ |
| Profile | displayName | ✓ | ✓ | ✓ | ✓ | ✓ |
| Profile | companyName | ✓ | ✓ | ✓ | ✓ | ✓ |
| Profile | website | ✓ | ✓ | ✓ | ✓ | ✓ |
| Profile | country | ✓ | ✓ | ✓ | ✓ | ✓ |
| Profile | profileImage | ✓ | ✓ | ✓ | ✓ | ✓ |

**STATUS:** ✓ This flow looks complete

#### **PROVIDER DASHBOARD FLOW**

| Component | Field | MongoDB | Entity | DTO | API Response | Frontend |
|-----------|-------|---------|--------|-----|--------------|----------|
| Dashboard | totalApis | ✓ apis (count) | COUNT | ✓ | ✓ | ✓ |
| Dashboard | approvedApis | ✓ apis (status=APPROVED) | COUNT | ✓ | ✓ | ✓ |
| Dashboard | pendingApis | ✓ apis (status=PENDING) | COUNT | ✓ | ✓ | ✓ |
| Dashboard | rejectedApis | ✓ apis (status=REJECTED) | COUNT | ✓ | ✓ | ✓ |
| Dashboard | archivedApis | ✓ apis (status=ARCHIVED) | COUNT | ✓ | ✓ | ✓ |
| Dashboard | monthlyRevenue | ✗ NOT TRACKED | HARDCODED 0 | ✗ | ✗ | ✗ |
| Dashboard | totalSubscribers | ✗ NOT TRACKED | HARDCODED 0 | ✗ | ✗ | ✗ |
| Dashboard | recentApis | ✓ apis | LIST | ApiSummaryDto | ✓ | ✓ |

**CRITICAL ISSUES:**
1. monthlyRevenue is hardcoded to 0
2. totalSubscribers is hardcoded to 0
3. No actual revenue/subscriber tracking implemented

#### **ADMIN USER MANAGEMENT FLOW**

| Component | Field | MongoDB | Entity | DTO | API Response | Frontend |
|-----------|-------|---------|--------|-----|--------------|----------|
| User | id | ✓ | ✓ | UserResponse | ✓ | ✓ |
| User | email | ✓ | ✓ | ✓ | ✓ | ✓ |
| User | fullName | ✓ | ✓ | ✓ | ✓ | ✓ |
| User | enabled | ✓ | ✓ | ✓ | ✓ | ✓ |
| User | role | ✓ | DocumentReference | role.name | ✓ | ✓ |
| User | approvalStatus | ✓ | ✓ | ✓ | ✓ | ✓ |

**STATUS:** ✓ Looks correct

#### **ADMIN PROVIDER MANAGEMENT FLOW**

| Component | Field | MongoDB | Entity | DTO | API Response | Frontend |
|-----------|-------|---------|--------|-----|--------------|----------|
| Provider | userId | ✓ | ✓ | ✓ | ✓ | ✓ |
| Provider | companyName | ✓ | ✓ | ✓ | ✓ | ✓ |
| Profile | supportEmail | ✓ | ✓ | ✓ | ✓ | ✓ |

**STATUS:** ✓ Looks correct

---

## CRITICAL ISSUES SUMMARY

### 🔴 HIGH PRIORITY - BROKEN DATA CONTRACTS

1. **Provider Name Resolution**
   - Location: `ConsumerServiceImpl.toMarketplaceCard()` line 436
   - Issue: Returns `String.valueOf(api.getProviderId())` instead of ProviderProfile.companyName
   - Impact: Frontend shows "Provider unavailable" or provider ID number instead of company name
   - Fix: Look up ProviderProfile and return companyName

2. **ProviderProfile Not Fetched**
   - Location: `ConsumerServiceImpl.getMarketplaceApi()` line 132
   - Issue: ProviderSummary.name is hardcoded to null
   - Impact: Related API cards show provider as null
   - Fix: Fetch ProviderProfile by providerId and populate name field

3. **Usage Metrics Hardcoded**
   - Location: `ConsumerServiceImpl.buildUsageSummary()` line 431
   - Issue: successfulRequests = totalRequests (100% success rate)
   - Issue: failedRequests = 0
   - Impact: Fake usage statistics shown to users
   - Fix: Calculate actual successful vs failed from usage_logs

4. **Provider Revenue Hardcoded to Zero**
   - Location: `ProviderServiceImpl.getDashboard()` line 113
   - Issue: monthlyRevenue hardcoded to 0
   - Issue: totalSubscribers hardcoded to 0
   - Impact: Provider dashboard shows fake metrics
   - Fix: Implement actual revenue calculation from subscriptions

5. **Response Time Not Tracked**
   - Location: Database schema
   - Issue: responseTimeMs in UsageLog but never calculated
   - Impact: Frontend shows "Not returned by backend"
   - Fix: Calculate response time in usage tracking

6. **API Key Last Used Never Updated**
   - Location: `ConsumerServiceImpl` - key regeneration
   - Issue: ApiKey.lastUsedAt is set at creation, never updated
   - Impact: Can't track actual key usage
   - Fix: Track lastUsedAt when key is actually used

---

## PHASE 2: FIELD-BY-FIELD AUDIT

### Missing Request Fields (Frontend sends but backend ignores)

| Frontend Field | Frontend Send | Backend DTO | Backend Persist | Issue |
|---|---|---|---|---|
| supportUrl | ProviderCreateApiPage | ✗ ApiRequestDto | N/A | Form field exists but DTO doesn't accept it |

### Missing Response Fields (Frontend expects but backend doesn't return)

| Frontend Field | Display Location | Expected in DTO | Actually in DTO | Fallback | Issue |
|---|---|---|---|---|---|
| providerName | ApiMarketplaceCard | ApiMarketplaceCardResponse | ✗ (returns ID) | "Provider unavailable" | Provider lookup broken |
| provider.name | ApiDetailsPage | ApiMarketplaceDetailsResponse | ✗ (returns null) | "Provider unavailable" | Provider lookup broken |
| shortDescription | ApiMarketplaceCard | ApiMarketplaceCardResponse | ✓ (from Api.description) | N/A | ✓ Correct |
| startingPrice | ApiMarketplaceCard | ApiMarketplaceCardResponse | ✓ (derived) | N/A | ✓ Correct |
| hasFreePlan | ApiMarketplaceCard | ApiMarketplaceCardResponse | ✓ (derived) | N/A | ✓ Correct |
| responseTime | SubscriptionDetailsPage | SubscriptionDetailsResponse | ✗ UsageSummaryResponse | "Not returned by backend" | Feature not implemented |

### Hardcoded/Placeholder Data in Frontend

| Location | Value | Issue | Should Be |
|---|---|---|---|
| ProviderCreateApiPage | rateLimit: 1000 (default) | Not from API | Should use submitted value |
| ApiMarketplacePreview | rateLimit fallback: 1000 | Hardcoded fallback | Should come from API.rateLimit |
| ConsumerDashboardResponse | monthlyRevenue: 0 | Hardcoded | Should calculate from subscriptions |
| ProviderDashboardPage | monthlyRevenue: 0 | Hardcoded | Should calculate from subscriptions |
| ConsumerServiceImpl | successfulRequests = totalRequests | All requests marked successful | Should track failed requests |

---

## PHASE 3: API ENDPOINT COMPLETENESS

### Endpoints Returning Incomplete Data

1. **GET /api/marketplace/apis** - List
   - Missing: Provider name (only ID)
   - Should return: ProviderProfile.companyName

2. **GET /api/marketplace/apis/{id}** - Detail
   - Missing: Provider name (only ID)
   - Should return: ProviderProfile.companyName

3. **GET /api/consumer/marketplace/apis** - Consumer List
   - Missing: Provider name (only ID)
   - Should return: ProviderProfile.companyName

4. **GET /api/consumer/marketplace/apis/{id}** - Consumer Detail
   - Missing: Provider name (only ID)
   - Should return: ProviderProfile.companyName

5. **GET /api/provider/dashboard**
   - Missing: monthlyRevenue (real calculation)
   - Missing: totalSubscribers (real count)

6. **GET /api/consumer/usage**
   - Missing: responseTime data
   - Issue: Success rate always 100%

---

## FINAL ASSESSMENT

**Data Alignment Status:** ❌ FAILED

**Critical Issues:** 6  
**High Priority:** 4  
**Medium Priority:** 3  
**Low Priority:** 2

**Recommendation:** STOP - Fix critical issues before proceeding with E2E testing.

---

## NEXT STEPS

1. Fix Provider name resolution in ConsumerServiceImpl
2. Implement actual usage metric calculation
3. Implement revenue tracking for providers
4. Fix API key last-used tracking
5. Re-audit after fixes
6. Run E2E tests with real data
