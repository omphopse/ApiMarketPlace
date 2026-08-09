# Frontend API Coverage

Source of truth: controllers and DTOs on `master`.

| Backend endpoint | Method | Role | Frontend page/service | Connected | Tested | Notes |
|---|---|---|---|---|---|---|
| `/api/auth/register` | POST | Public | Register / authService | Yes | Build | Roles are sent as backend enum text. |
| `/api/auth/login` | POST | Public | Login / authService | Yes | Build | Stores backend token and role. |
| `/api/auth/me` | GET | Authenticated | AuthContext / authService | Yes | Build | Session restoration validates the token. |
| `/api/marketplace/apis` | GET | Public | Landing, Marketplace / consumerService | Yes | Build | Uses backend page, size, search, pricing, sort parameters. |
| `/api/marketplace/apis/{id}` | GET | Public | API details / consumerService | Yes | Build | String IDs are preserved. |
| `/api/marketplace/apis/{apiId}/plans` | GET | Public | API details / consumerService | Yes | Build | Backend plan DTO is used. |
| `/api/provider/profile` | GET/PUT | PROVIDER | providerService | Yes | Build | |
| `/api/provider/dashboard` | GET | PROVIDER | Provider dashboard | Yes | Build | Uses DashboardDto only. |
| `/api/provider/apis` | GET/POST | PROVIDER | Provider APIs/create | Yes | Build | Request fields mapped to ApiRequestDto. |
| `/api/provider/apis/{id}` | GET/PUT/DELETE | PROVIDER | Provider API pages | Yes | Build | |
| `/api/provider/apis/{id}/submit` | PATCH | PROVIDER | Provider API pages | Yes | Build | Status comes from response. |
| `/api/provider/apis/{id}/archive` | PATCH | PROVIDER | Provider API pages | Yes | Build | |
| `/api/provider/apis/{id}/plans` | GET/POST | PROVIDER | providerService | Yes | Build | Dedicated plan UI remains limited. |
| `/api/provider/plans/{id}` | PUT/DELETE | PROVIDER | providerService | Yes | Build | |
| `/api/provider/apis/{id}/documentation` | GET/POST/PUT | PROVIDER | providerService | Yes | Build | |
| `/api/provider/categories` | GET | PROVIDER | providerService | Yes | Build | |
| `/api/provider/upload` | POST | PROVIDER | providerService | Yes | Build | Multipart upload adapter. |
| `/api/consumer/profile` | GET/PUT | CONSUMER | Profile / consumerService | Yes | Build | |
| `/api/consumer/dashboard` | GET | CONSUMER | Consumer dashboard | Yes | Build | Uses ConsumerDashboardResponse only. |
| `/api/consumer/marketplace/apis` | GET | CONSUMER | Marketplace / consumerService | Yes | Build | Authenticated consumer sessions use this endpoint; public sessions use the public equivalent. |
| `/api/consumer/marketplace/apis/{id}` | GET | CONSUMER | API details / consumerService | Yes | Build | Authenticated consumer sessions use this endpoint. |
| `/api/consumer/subscriptions` | GET/POST | CONSUMER | Subscriptions/checkout | Yes | Build | Payment confirmation is not exposed by this backend. |
| `/api/consumer/subscriptions/{id}` | GET | CONSUMER | Subscription details | Yes | Build | |
| `/api/consumer/subscriptions/{id}/cancel` | PATCH | CONSUMER | Subscriptions | Yes | Build | |
| `/api/consumer/subscriptions/{id}/documentation` | GET | CONSUMER | Documentation | Yes | Build | |
| `/api/consumer/api-keys` | GET/DELETE | CONSUMER | API keys | Yes | Build | |
| `/api/consumer/subscriptions/{id}/api-key/regenerate` | POST | CONSUMER | API keys | Yes | Build | Raw key is handled only from backend response. |
| `/api/consumer/usage` | GET | CONSUMER | Usage | Yes | Build | |
| `/api/consumer/dev/subscriptions/{id}/activate` | POST | CONSUMER | consumerService | Yes | Build | Development/testing backend path. |
| `/api/admin/dashboard` | GET | ADMIN | Admin dashboard | Yes | Build | Uses DashboardResponse only. |
| `/api/admin/users` and `/search` | GET | ADMIN | Admin users | Yes | Build | |
| `/api/admin/users/{id}` | GET | ADMIN | Admin user detail | Yes | Build | |
| `/api/admin/users/{id}/status` | PUT | ADMIN | Admin user detail | Yes | Build | Enabled flag mapped exactly. |
| `/api/admin/apis` and `/pending` | GET | ADMIN | Admin API pages | Yes | Build | |
| `/api/admin/apis/{id}` | GET | ADMIN | Admin API detail/review | Yes | Build | |
| `/api/admin/apis/{id}/approve` | PUT | ADMIN | Admin review | Yes | Build | |
| `/api/admin/apis/{id}/reject` | PUT | ADMIN | Admin review | Yes | Build | Backend accepts no rejection reason field. |
| `/api/admin/categories` | GET/POST/PUT/DELETE | ADMIN | Admin categories | Yes | Build | |
| `/api/admin/analytics` | GET | ADMIN | adminService | Yes | Build | No chart data is invented. |
| `/api/admin/audit-logs` and `/{id}` | GET | ADMIN | Admin audit logs / adminService | Yes | Build | Real audit response fields only. |
| Payments/Razorpay endpoints | Any | Any | None | No | N/A | No payment controller exists in the current backend. |
| Admin settings/reports/activity | Any | ADMIN | None | No | N/A | No matching backend endpoints exist. |

## Known Backend Gaps

- No Razorpay/order/payment verification controller is present.
- No payment history, billing, provider revenue, or analytics-series endpoints are present.
- Admin rejection accepts no rejection reason in the current DTO/controller contract.
- Provider subscriber details and profile approval workflow are not exposed as dedicated endpoints.
- Public category listing is not exposed; provider categories are role-protected.

No mock fallback is enabled. Errors are surfaced to the page state.

## Second Pass Coverage

The complete controller rescan found **63 endpoints**. The authoritative row-by-row inventory is [COMPLETE_BACKEND_API_INVENTORY.md](COMPLETE_BACKEND_API_INVENTORY.md). All discovered user-facing endpoints now have a service consumer and page/action, including provider approvals, user deletion, category detail/update, audit logs, provider profile, provider plan/documentation editors, and the consumer development activation path.
