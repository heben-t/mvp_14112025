# Database Migration Instructions

## Problem
Prisma CLI cannot connect to the Supabase database due to network/firewall restrictions (Error P1001). However, the application's Supabase client works fine.

## Solution
Run the SQL migration directly in Supabase's SQL Editor.

## Steps

### Option 1: Supabase SQL Editor (Recommended)

1. **Open Supabase Dashboard**
   - Go to: https://supabase.com/dashboard
   - Navigate to your project: `xbinlxkkfxmgjdukxtbn`

2. **Open SQL Editor**
   - Click on "SQL Editor" in the left sidebar
   - Click "New Query"

3. **Copy and Paste SQL**
   - Open the file: `prisma/migrations/schema_migration.sql`
   - Copy the entire contents
   - Paste into the SQL Editor

4. **Execute Migration**
   - Click "Run" button (or press Ctrl+Enter)
   - Wait for execution to complete
   - Verify success message

5. **Verify Tables Created**
   - Go to "Table Editor" in the left sidebar
   - You should see all 17 tables:
     - users
     - accounts
     - sessions
     - verification_tokens
     - startup_profiles
     - investor_profiles
     - investor_preferences
     - subscriptions
     - campaigns
     - investments
     - watchlists
     - startup_metrics
     - portfolio_companies
     - time_series_data
     - operations
     - alerts
     - benchmarks

### Option 2: Check Current Tables via API

Before running the migration, you can check what tables currently exist:

```bash
curl http://localhost:3000/api/admin/check-tables
```

This will show you which tables are already present in the database.

### Option 3: Prisma Generate (After Tables Exist)

Once the tables are created in Supabase, regenerate the Prisma client:

```bash
cd Demo_App_Development_Guide/ai_roi_dashboard/nextjs_space
npx prisma generate
```

**Note:** You may need to close the dev server first if you get permission errors on Windows.

## What This Migration Does

1. **Creates 5 Enums:**
   - UserRole (STARTUP, INVESTOR, ADMIN)
   - VerificationStatus (PENDING, VERIFIED, REJECTED)
   - InvestmentStatus (PENDING, ACCEPTED, REJECTED, COMPLETED, CANCELLED)
   - SubscriptionTier (STARTUP_BASIC, INVESTOR_BASIC)
   - DataVerificationLevel (VERIFIED, PARTIALLY_VERIFIED, SELF_REPORTED)

2. **Creates 17 Tables with proper snake_case naming:**
   - All tables use correct snake_case names (e.g., `campaigns` not `Campaign`)
   - All foreign keys and relationships configured
   - All indexes and unique constraints added

3. **Fixes the Prisma ↔ Supabase Naming Mismatch:**
   - Prisma models use PascalCase (Campaign)
   - Database tables use snake_case (campaigns)
   - The `@@map` directives in `schema.prisma` bridge this gap

## After Migration

Once the migration is complete:

1. **Restart the dev server** (if running)
2. **Test the discover page:** http://localhost:3000/discover
3. **Test campaign APIs:** http://localhost:3000/api/campaigns/list
4. **Verify no more "table does not exist" errors**

## Troubleshooting

### If migration fails:
- Check for existing tables that might conflict
- Drop existing tables if needed (be careful!)
- Run statements one by one to identify the issue

### If tables already exist:
- You may see "already exists" errors
- This is okay - skip to regenerating Prisma client
- Some tables may have been created during testing

### If Prisma generate fails:
- Stop the dev server first
- Delete `node_modules/.prisma` folder
- Run `npx prisma generate` again
