# Email Notification Matrix

| Event | Trigger | Recipient | Subject | Template | One-Time? | Scheduler? | Status |
|---|---|---|---|---|---|---|---|
| USER_REGISTERED | Registration saved | New user | Welcome to API Marketplace | user-registered.html | Yes | No | Implemented |
| FIRST_LOGIN | First successful login | User | Welcome - Your First Login | first-login.html | Yes | No | Implemented |
| API_SUBMITTED | Provider submits API | Provider | API Submitted for Review | api-submitted.html | Per submission | No | Implemented |
| API_APPROVED | Admin approves API | Provider | Your API Has Been Approved | api-approved.html | Per approval | No | Implemented |
| API_REJECTED | Admin rejects API | Provider | Your API Submission Needs Changes | api-rejected.html | Per rejection | No | Implemented |
| SUBSCRIPTION_PURCHASED | Subscription saved | Consumer | Subscription Confirmed | subscription-purchased.html | Per subscription | No | Implemented |
| SUBSCRIPTION_EXPIRING | Active subscription reaches 3-day window | Consumer | Your Subscription Expires in 3 Days | subscription-expiring.html | Yes | Yes | Implemented |
| SUBSCRIPTION_EXPIRED | Active subscription expires | Consumer | Your Subscription Has Expired | subscription-expired.html | Yes | Yes | Implemented |
| SUBSCRIPTION_CANCELLED | Consumer cancels subscription | Consumer | Subscription Cancelled | subscription-cancelled.html | Per cancellation | No | Implemented |
| API_KEY_CREATED | Subscription activation | Consumer | Your API Key Is Ready | api-key-created.html | Per key | No | Implemented |
| API_KEY_REGENERATED | Consumer regenerates key | Consumer | Your API Key Was Regenerated | api-key-regenerated.html | Per key | No | Implemented |
| API_KEY_REVOKED | Consumer revokes key | Consumer | Your API Key Was Revoked | api-key-revoked.html | Per revocation | No | Implemented |

Payment, password reset, and profile approval events are not implemented in the backend and are intentionally unsupported in this phase.