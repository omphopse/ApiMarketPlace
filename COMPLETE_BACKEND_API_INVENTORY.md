# Complete Backend API Inventory

Source: controller and DTO code on `master`, rescanned during the second integration pass. Total discovered HTTP endpoints: **63**.

| ID | Method | Endpoint | Role | Feature | Frontend Page | Frontend Service | Status |
|---:|---|---|---|---|---|---|---|
| 1 | GET | `/api/admin/users` | ADMIN | List users | Admin users | adminService.getUsers | CONNECTED |
| 2 | GET | `/api/admin/users/{id}` | ADMIN | User detail | Admin user detail | adminService.getUserById | CONNECTED |
| 3 | PUT | `/api/admin/users/{id}/status` | ADMIN | Enable/disable user | Admin user detail | adminService.suspendUser/reactivateUser | CONNECTED |
| 4 | GET | `/api/admin/users/search` | ADMIN | Search users | Admin users | adminService.getUsers | CONNECTED |
| 5 | DELETE | `/api/admin/users/{id}` | ADMIN | Delete user | Admin user detail | adminService.deleteUser | CONNECTED |
| 6 | GET | `/api/admin/providers/pending` | ADMIN | Pending providers | Admin providers | adminService.getPendingProviders | CONNECTED |
| 7 | PUT | `/api/admin/providers/{id}/approve` | ADMIN | Approve provider | Admin providers | adminService.approveProvider | CONNECTED |
| 8 | PUT | `/api/admin/providers/{id}/reject` | ADMIN | Reject provider | Admin providers | adminService.rejectProvider | CONNECTED |
| 9 | GET | `/api/admin/apis` | ADMIN | List APIs | Admin APIs | adminService.getApis | CONNECTED |
| 10 | GET | `/api/admin/apis/pending` | ADMIN | Pending APIs | Admin approvals | adminService.getApprovalQueue | CONNECTED |
| 11 | GET | `/api/admin/apis/{id}` | ADMIN | API review/detail | Admin API detail/review | adminService.getApiById/getApiForReview | CONNECTED |
| 12 | PUT | `/api/admin/apis/{id}/approve` | ADMIN | Approve API | Admin API review | adminService.approveApi | CONNECTED |
| 13 | PUT | `/api/admin/apis/{id}/reject` | ADMIN | Reject API | Admin API review | adminService.rejectApi | CONNECTED |
| 14 | GET | `/api/admin/analytics` | ADMIN | Platform analytics | Admin dashboard | adminService.getAnalytics | CONNECTED |
| 15 | GET | `/api/admin/audit-logs` | ADMIN | Audit log list | Admin audit logs | adminService.getAuditLogs | CONNECTED |
| 16 | GET | `/api/admin/audit-logs/{id}` | ADMIN | Audit log detail | Admin audit logs | adminService.getAuditLogById | CONNECTED |
| 17 | POST | `/api/auth/register` | PUBLIC | Registration | Register | authService.register | CONNECTED |
| 18 | POST | `/api/auth/login` | PUBLIC | Login | Login | authService.login | CONNECTED |
| 19 | GET | `/api/auth/me` | AUTHENTICATED | Current identity/session | AuthContext | authService.restoreSession | CONNECTED |
| 20 | POST | `/api/admin/categories` | ADMIN | Create category | Admin categories | adminService.createCategory | CONNECTED |
| 21 | GET | `/api/admin/categories` | ADMIN | List categories | Admin categories | adminService.getCategories | CONNECTED |
| 22 | GET | `/api/admin/categories/{id}` | ADMIN | Category detail | Admin categories inspect dialog | adminService.getCategoryById | CONNECTED |
| 23 | PUT | `/api/admin/categories/{id}` | ADMIN | Update category | Service available; no edit control | adminService.updateCategory | CONNECTED |
| 24 | DELETE | `/api/admin/categories/{id}` | ADMIN | Delete category | Admin categories deactivate action | adminService.deactivateCategory | CONNECTED |
| 25 | GET | `/api/consumer/profile` | CONSUMER | Consumer profile | Consumer profile | consumerService.getProfile | CONNECTED |
| 26 | PUT | `/api/consumer/profile` | CONSUMER | Update consumer profile | Consumer profile | consumerService.updateProfile | CONNECTED |
| 27 | GET | `/api/consumer/marketplace/apis` | CONSUMER | Authenticated marketplace list | Marketplace | consumerService.getMarketplaceApis | CONNECTED |
| 28 | GET | `/api/consumer/marketplace/apis/{id}` | CONSUMER | Authenticated marketplace detail | API details | consumerService.getMarketplaceApiById | CONNECTED |
| 29 | GET | `/api/consumer/marketplace/apis/{apiId}/plans` | CONSUMER | Authenticated marketplace plans | API details | consumerService.getApiPlans | CONNECTED |
| 30 | POST | `/api/consumer/subscriptions` | CONSUMER | Create pending subscription | Checkout | consumerService.createSubscription | CONNECTED |
| 31 | POST | `/api/consumer/dev/subscriptions/{subscriptionId}/activate` | CONSUMER | Development activation | Checkout | consumerService.activateSubscription | CONNECTED |
| 32 | GET | `/api/consumer/api-keys` | CONSUMER | List API keys | API keys | consumerService.getApiKeys | CONNECTED |
| 33 | POST | `/api/consumer/subscriptions/{subscriptionId}/api-key/regenerate` | CONSUMER | Regenerate key | API keys | consumerService.regenerateApiKey | CONNECTED |
| 34 | DELETE | `/api/consumer/api-keys/{id}` | CONSUMER | Revoke key | API keys | consumerService.revokeApiKey | CONNECTED |
| 35 | GET | `/api/consumer/subscriptions` | CONSUMER | List subscriptions | Subscriptions | consumerService.getSubscriptions | CONNECTED |
| 36 | GET | `/api/consumer/subscriptions/{id}` | CONSUMER | Subscription detail | Subscription detail | consumerService.getSubscriptionById | CONNECTED |
| 37 | PATCH | `/api/consumer/subscriptions/{id}/cancel` | CONSUMER | Cancel subscription | Subscriptions | consumerService.cancelSubscription | CONNECTED |
| 38 | GET | `/api/consumer/subscriptions/{subscriptionId}/documentation` | CONSUMER | Subscription documentation | Documentation | consumerService.getDocumentation | CONNECTED |
| 39 | GET | `/api/consumer/usage` | CONSUMER | Usage summary | Usage | consumerService.getUsage | CONNECTED |
| 40 | GET | `/api/consumer/dashboard` | CONSUMER | Consumer dashboard | Consumer dashboard | consumerService.getDashboard | CONNECTED |
| 41 | GET | `/api/admin/dashboard` | ADMIN | Admin dashboard totals | Admin dashboard | adminService.getDashboard | CONNECTED |
| 42 | GET | `/api/marketplace/apis` | PUBLIC | Public marketplace list | Landing/Marketplace | consumerService.getMarketplaceApis | CONNECTED |
| 43 | GET | `/api/marketplace/apis/{id}` | PUBLIC | Public marketplace detail | API details | consumerService.getMarketplaceApiById | CONNECTED |
| 44 | GET | `/api/marketplace/apis/{apiId}/plans` | PUBLIC | Public marketplace plans | API details | consumerService.getApiPlans | CONNECTED |
| 45 | GET | `/api/provider/profile` | PROVIDER | Provider profile | Provider profile | providerService.getProfile | CONNECTED |
| 46 | PUT | `/api/provider/profile` | PROVIDER | Update provider profile | Provider profile | providerService.updateProfile | CONNECTED |
| 47 | GET | `/api/provider/dashboard` | PROVIDER | Provider dashboard | Provider dashboard | providerService.getDashboard | CONNECTED |
| 48 | GET | `/api/provider/apis` | PROVIDER | Provider API list | Provider APIs | providerService.getApis | CONNECTED |
| 49 | GET | `/api/provider/apis/{id}` | PROVIDER | Provider API detail | Provider API detail | providerService.getApiById | CONNECTED |
| 50 | POST | `/api/provider/apis` | PROVIDER | Create API | Provider create API | providerService.createApi | CONNECTED |
| 51 | PUT | `/api/provider/apis/{id}` | PROVIDER | Update API | Provider API edit | providerService.updateApi | CONNECTED |
| 52 | DELETE | `/api/provider/apis/{id}` | PROVIDER | Delete API | Provider APIs | providerService.deleteApi | CONNECTED |
| 53 | PATCH | `/api/provider/apis/{id}/submit` | PROVIDER | Submit API | Provider APIs/detail | providerService.submitApi | CONNECTED |
| 54 | PATCH | `/api/provider/apis/{id}/archive` | PROVIDER | Archive API | Provider APIs | providerService.archiveApi | CONNECTED |
| 55 | POST | `/api/provider/apis/{id}/plans` | PROVIDER | Create plan | Provider plan editor | providerService.createPlan | CONNECTED |
| 56 | PUT | `/api/provider/plans/{id}` | PROVIDER | Update plan | Provider plan editor | providerService.updatePlan | CONNECTED |
| 57 | DELETE | `/api/provider/plans/{id}` | PROVIDER | Delete plan | Provider plan editor | providerService.deletePlan | CONNECTED |
| 58 | GET | `/api/provider/apis/{id}/plans` | PROVIDER | List plans | Provider plan editor | providerService.getPlans | CONNECTED |
| 59 | POST | `/api/provider/apis/{id}/documentation` | PROVIDER | Create documentation | Provider documentation editor | providerService.createDocumentation | CONNECTED |
| 60 | PUT | `/api/provider/apis/{id}/documentation` | PROVIDER | Update documentation | Provider documentation editor | providerService.saveDocumentation | CONNECTED |
| 61 | GET | `/api/provider/apis/{id}/documentation` | PROVIDER | Read documentation | Provider documentation editor | providerService.getDocumentation | CONNECTED |
| 62 | GET | `/api/provider/categories` | PROVIDER | Provider category list | Provider create API | providerService.getCategories | CONNECTED |
| 63 | POST | `/api/provider/upload` | PROVIDER | Upload logo | Provider create API | providerService.uploadLogo | CONNECTED |

## Endpoint Classes Verified Absent

No payment, Razorpay, billing, admin settings, admin reports, admin activity, provider revenue, provider subscriber analytics, password reset, email verification, or notification HTTP controllers were found. These are documented backend gaps, not frontend endpoints.

The backend also exposes no public category-list endpoint. The provider form uses `/api/provider/categories`; public marketplace category filtering cannot be populated from a backend category-list API without changing the locked backend.

## Validation Status

`CONNECTED` means a frontend service and page/route/action exist. Endpoint-level live testing requires running Spring Boot with configured MongoDB data; this pass performs build validation but does not claim E2E success.
