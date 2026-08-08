# Email Testing Guide

## Prerequisites

Start MongoDB and the backend. Use `MAIL_ENABLED=false` for automated tests.

## Gmail App Password

For manual delivery, configure a Gmail App Password through environment variables only. Do not place it in source, documentation, or frontend files.

## Environment Setup

Set `MONGODB_URI`, `MONGODB_DATABASE`, `JWT_SECRET`, `MAIL_USERNAME`, and `MAIL_PASSWORD`. Enable delivery with `MAIL_ENABLED=true`.

## Test Flows

1. Register a provider and confirm one registration message.
2. Log in successfully twice and confirm only the first login sends a first-login message.
3. Create and submit an API, then approve and reject APIs from the admin flow.
4. Create and activate a consumer subscription, cancel one, and verify the API-key messages never contain the raw key.
5. Set a subscription expiry to three days from the application date and run the scheduler logic; repeat it and confirm no duplicate warning.
6. Set an active subscription expiry in the past and confirm one expiration message and status transition.

## Failure Testing

With `MAIL_ENABLED=true`, use an invalid SMTP password. Confirm the business response still succeeds and logs contain only masked recipient, event, and safe error type.

## Scheduler Testing

Exercise the scheduler service with subscriptions expiring in 2, 3, and 4 days, already expired, cancelled, and already marked as notified. The three-day case and expired case should each claim once.

## Duplicate Prevention

Repeat first login and scheduler runs. Atomic Mongo updates ensure only one first-login or scheduled notification is claimed.

## Troubleshooting

`EMAIL_DISABLED` means mail is intentionally off. `EMAIL_FAILED` indicates delivery failure. `EMAIL_TEMPLATE_FAILED` indicates a missing or unreadable template.

## Security Checklist

Do not email passwords, password hashes, JWTs, raw API keys, API-key hashes, SMTP credentials, or payment credentials. Rotate credentials that were exposed before this phase.