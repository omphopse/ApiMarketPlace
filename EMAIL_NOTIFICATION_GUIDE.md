# Email Notification Guide

## Overview

The backend sends centralized, asynchronous email notifications after successful business operations. Email delivery failures are logged and do not roll back registration, subscriptions, API review actions, or key changes.

## Gmail App Password Setup

Enable two-step verification on the Gmail account, create an App Password, and use that value only in the local `MAIL_PASSWORD` environment variable. Rotate any credential that has previously been shared or committed.

## Environment Variables

Set `MAIL_USERNAME`, `MAIL_PASSWORD`, and `MAIL_ENABLED`. SMTP defaults to Gmail on port 587 with STARTTLS. `MONGODB_URI` and `JWT_SECRET` are also environment-backed.

## Local Configuration

Use `.env.example` as a placeholder reference. Spring Boot does not read `.env` automatically; export the variables in PowerShell or configure them in the run profile.

## Enable/Disable Email

Set `MAIL_ENABLED=false` for local tests. Set it to `true` only with a valid sender address and App Password. Missing `MAIL_USERNAME` fails startup when mail is enabled.

## Supported Events

Registration, first login, API submission, API approval/rejection, subscription creation/cancellation, subscription expiration warning/expiration, and API-key creation/regeneration/revocation.

## Email Templates

Templates are external HTML files under `src/main/resources/templates/email/`. Variables are escaped before rendering and raw API keys, passwords, JWTs, and SMTP credentials are never included.

## Scheduler

The expiry check runs from `notification.subscription-expiry-check-cron` in `notification.time-zone` (default `Asia/Kolkata`). It checks active subscriptions expiring in three days and active subscriptions already expired.

## Subscription Expiration

`expirationWarning3DaysSent` and `expirationEmailSent` are atomically claimed in MongoDB before dispatch, preventing duplicates across repeated scheduler runs and concurrent local instances.

## Notification Idempotency

First login is claimed with an atomic `firstLoginAt == null` update. Scheduled subscription messages use atomic boolean claims.

## Testing

Run `mvnw.cmd clean test`. Tests use `MAIL_ENABLED=false` or mocked mail components; no real Gmail delivery is required. See [EMAIL_TESTING_GUIDE.md](EMAIL_TESTING_GUIDE.md).

## Troubleshooting

Check `EMAIL_DISABLED`, `EMAIL_SENT`, `EMAIL_FAILED`, and `EMAIL_TEMPLATE_FAILED` log events. Logs contain masked recipients and exception types only.

## Security

Never commit Gmail App Passwords, MongoDB URIs with credentials, JWT secrets, passwords, raw API keys, or tokens. Rotate secrets that were previously exposed.