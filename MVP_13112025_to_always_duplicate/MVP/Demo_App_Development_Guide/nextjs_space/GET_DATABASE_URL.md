# How to Get the Correct DATABASE_URL from Supabase

## Step 1: Go to Supabase Dashboard

1. Open: https://supabase.com/dashboard
2. Select your project: **xbinlxkkfxmgjdukxtbn**

## Step 2: Get Database Connection String

1. Click on **Settings** (gear icon) in the left sidebar
2. Click on **Database**
3. Scroll down to **Connection string**
4. You'll see multiple options - use **"URI"**

## Step 3: Choose the Right Connection Mode

You'll see tabs like:
- **Session mode** (recommended for Prisma)
- **Transaction mode** (for serverless)

**For your setup, use SESSION MODE (port 5432)**

## Step 4: Copy the Connection String

The format will be:
```
postgresql://postgres.xbinlxkkfxmgjdukxtbn:[YOUR-PASSWORD]@aws-0-us-east-1.pooler.supabase.com:5432/postgres
```

## Step 5: Replace [YOUR-PASSWORD]

1. In the same Database settings page, find your database password
2. If you don't have it, you can reset it:
   - Click **"Reset database password"**
   - Copy the new password
   - Replace `[YOUR-PASSWORD]` in the connection string with the actual password

## Step 6: URL Encode Special Characters

If your password has special characters like `@`, `#`, `%`, etc., they need to be URL-encoded:

- `@` becomes `%40`
- `#` becomes `%23`
- `%` becomes `%25`
- `&` becomes `%26`

For example, if your password is `Pass@123`, the URL becomes:
```
postgresql://postgres.xbinlxkkfxmgjdukxtbn:Pass%40123@aws-0-us-east-1.pooler.supabase.com:5432/postgres
```

## Step 7: Update Your .env File

Copy the complete connection string and update your `.env`:

```env
DATABASE_URL="postgresql://postgres.xbinlxkkfxmgjdukxtbn:YOUR_PASSWORD_HERE@aws-0-us-east-1.pooler.supabase.com:5432/postgres"
```

## Step 8: Restart Your Server

```bash
# Stop server (Ctrl+C)
npm run dev
```

---

## Quick Fix: Try This Connection String

Based on the password from your metrics-api .env (FdhX9PUdEfzPuD3m), try this:

```env
DATABASE_URL="postgresql://postgres.xbinlxkkfxmgjdukxtbn:FdhX9PUdEfzPuD3m@aws-0-us-east-1.pooler.supabase.com:5432/postgres"
```

This should work if that's your actual database password.
