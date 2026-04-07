# Push Notifications Setup

This project uses:

- Vercel Functions for the push subscription and reminder endpoints
- Vercel Cron for the daily reminder check
- Supabase for storing push subscriptions and reminder logs
- VAPID keys for Web Push delivery

## Environment Variables

Add these to your Vercel project:

- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `VAPID_PUBLIC_KEY`
- `VAPID_PRIVATE_KEY`
- `CRON_SECRET`

## Supabase Tables

Run these SQL statements in Supabase:

```sql
create extension if not exists pgcrypto;

create table if not exists public.david_via_push_subscriptions (
  id uuid primary key default gen_random_uuid(),
  endpoint text not null unique,
  p256dh text not null,
  auth text not null,
  user_agent text,
  is_active boolean not null default true,
  last_seen_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.david_via_push_notification_logs (
  id uuid primary key default gen_random_uuid(),
  stage_key text not null,
  sent_date date not null,
  sent_count integer not null default 0,
  created_at timestamptz not null default now(),
  unique (stage_key, sent_date)
);
```

## VAPID Keys

Generate a VAPID key pair locally with:

```bash
npx web-push generate-vapid-keys
```

Save the generated public and private keys into the Vercel environment variables listed above.

## Cron


to get CRON_SECRET
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

The cron is configured in `vercel.json` to call:

- `/api/cron/send-wedding-reminders`

once per day. The route checks the wedding date and RSVP deadline in Asia/Manila and sends reminders for:

Wedding reminders:
- 30 days
- 21 days
- 14 days
- 7 days
- 6 days
- 5 days
- 4 days
- 3 days
- 2 days
- 1 day

RSVP deadline reminders before June 1, 2026:
- 7 days
- 3 days
- 1 day


Test Notification
adjust date in api/_lib/push.js

then:
```bash
curl -X GET "https://david-via-wedding.vercel.app/api/cron/send-wedding-reminders" \
  -H "Authorization: Bearer YOUR_CRON_SECRET"

```
