# HEBED AI - DATABASE REBUILD EXECUTION GUIDE

**Created:** 2025-11-08  
**Status:** Ready to Execute  
**Purpose:** Complete database rebuild from scratch

---

## 🎯 WHAT THIS DOES

This rebuild will:
1. **DELETE** all existing Supabase tables (mock data only)
2. Create a **clean, consistent schema** using snake_case
3. Implement **all MVP features** from content_mvp2.txt
4. Enable **RLS with unrestricted access** (MVP mode)
5. Create proper **indexes** for performance
6. Generate **new Prisma schema**

---

## ⚠️ BEFORE YOU START

### Pre-Flight Checklist

- [ ] Confirmed database contains only mock data
- [ ] Have Supabase credentials ready (.env file)
- [ ] Backed up any important data (if applicable)
- [ ] Ready to regenerate Prisma client after

---

## 📝 STEP-BY-STEP EXECUTION

### STEP 1: Open Supabase SQL Editor

1. Go to https://supabase.com/dashboard
2. Select your project: `gnzcvhyxiatcjofywkdq`
3. Click "SQL Editor" in left sidebar
4. Click "New Query"

### STEP 2: Execute Database Rebuild Script

1. Open the file: `COMPLETE_DATABASE_REBUILD.sql`
2. Copy **ALL** contents
3. Paste into Supabase SQL Editor
4. Click "Run" button (bottom right)
5. Wait for completion (should take 5-10 seconds)

**Expected Output:**
```
✅ All tables dropped
✅ All types created
✅ All tables created
✅ All indexes created
✅ RLS enabled on all tables
✅ Triggers created
✅ Permissions granted

NOTICE: HEBED AI DATABASE REBUILD COMPLETE!
```

### STEP 3: Verify Tables Created

Run this query to verify:
```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;
```

**Expected Tables:**
- accounts
- campaign_comments
- campaign_followers
- campaigns
- investments
- investor_preferences
- investor_profiles
- sessions
- startup_metrics
- startup_profiles
- subscriptions
- users
- verification_tokens
- watchlists

### STEP 4: Update Prisma Schema

Navigate to your project directory:
```bash
cd C:\Users\edwar\Downloads\MVP\Demo_App_Development_Guide\ai_roi_dashboard\nextjs_space
```

Run Prisma introspection to sync with new database:
```bash
npx prisma db pull
```

This will update your `prisma/schema.prisma` file to match the new database structure.

### STEP 5: Generate Prisma Client

```bash
npx prisma generate
```

This creates the type-safe Prisma client for your application.

### STEP 6: Verify Application Connection

Test that the app can connect:
```bash
npm run dev
```

Visit `http://localhost:3000` and verify:
- No database connection errors
- Can access signup page
- Can access discover page

---

## 📊 NEW SCHEMA HIGHLIGHTS

### Users & Authentication
- `users` - Core user table
- `accounts` - OAuth accounts
- `sessions` - User sessions
- `verification_tokens` - Email verification

### Profiles (Updated per content_mvp2.txt)
- `startup_profiles` - Includes new fields:
  - `geographic_presence` - UAE location
  - `data_migration_method` - plugin/manual
- `investor_profiles` - Includes new fields:
  - `investor_type` - Individual/Angel/VC/FO
  - `investment_types` - JSONB array
  - `ticket_range` - Investment range
  - `investment_stages` - JSONB array
  - `sector_focus` - JSONB array
  - `geo_focus` - JSONB (UAE pre-checked)
  - `roi_priorities` - JSONB array
  - `profile_visibility` - visible/after_interest
  - `is_accredited` - Boolean

### Campaigns & Investments
- `campaigns` - Fundraising campaigns
- `investments` - Investment records
- `watchlists` - Investor bookmarks

### Social Features (New!)
- `campaign_comments` - Comments on campaigns
- `campaign_followers` - Campaign followers

### Metrics
- `startup_metrics` - Comprehensive metrics including:
  - Finance: MRR, ARR, churn, customers, etc.
  - Industry: Active users, engagement, retention
  - Technology: AI usage, improvements, model status
  - Community: Followers, team experience, mentions

### Subscriptions
- `subscriptions` - Stripe subscription tracking

---

## 🔐 RLS POLICIES

**All tables have unrestricted RLS for MVP:**
- Enabled: YES
- Policy: Allow ALL for authenticated users
- Reason: Simplify development for MVP
- Future: Will implement proper user-based policies

---

## 🎨 NAMING CONVENTION

**Consistent snake_case throughout:**
- Tables: `startup_profiles`, `campaign_comments`
- Columns: `user_id`, `created_at`, `mrr_now`
- No more camelCase conflicts!

---

## 🧪 POST-EXECUTION TESTING

### Test 1: Auth Flow
1. Sign up as new user
2. Verify user created in `users` table
3. Check session in `sessions` table

### Test 2: Startup Onboarding
1. Complete startup onboarding
2. Verify record in `startup_profiles`
3. Check all new fields populated

### Test 3: Investor Onboarding
1. Complete investor onboarding  
2. Verify record in `investor_profiles`
3. Check JSONB fields properly stored

### Test 4: Campaign Creation
1. Create a campaign as startup
2. Verify in `campaigns` table
3. Check foreign key to `startup_profiles`

### Test 5: Social Features
1. Add comment to campaign
2. Verify in `campaign_comments`
3. Follow a campaign
4. Verify in `campaign_followers`

---

## 🐛 TROUBLESHOOTING

### Issue: "Permission denied"
**Solution:** Make sure you're using the service role key in SQL Editor

### Issue: "Table already exists"
**Solution:** The script drops all tables first. If it fails, manually drop conflicting tables.

### Issue: "Prisma db pull fails"
**Solution:** 
1. Check DATABASE_URL in .env is correct
2. Ensure database has public schema
3. Try: `npx prisma db pull --force`

### Issue: "Type errors after generation"
**Solution:**
1. Delete `node_modules/.prisma`
2. Run `npx prisma generate` again
3. Restart TypeScript server in VS Code

---

## 📋 VERIFICATION CHECKLIST

After execution, verify:

- [ ] All 14 core tables exist
- [ ] No old camelCase tables remain
- [ ] RLS enabled on all tables
- [ ] Indexes created
- [ ] Triggers working (updated_at)
- [ ] Prisma schema updated
- [ ] Prisma client generated
- [ ] App runs without errors
- [ ] Can sign up new user
- [ ] Can create profiles
- [ ] Can create campaigns

---

## 🎯 WHAT'S DIFFERENT FROM OLD SCHEMA

### Removed
- portfolio_companies (not needed for MVP)
- alerts (not needed for MVP)
- benchmarks (not needed for MVP)
- operations (not needed for MVP)
- recommendations (not needed for MVP)
- chat_messages (not needed for MVP)
- time_series_data (not needed for MVP)
- Duplicate watchlist table

### Added
- campaign_comments (social feature)
- campaign_followers (social feature)
- New fields in startup_profiles (per content_mvp2)
- New fields in investor_profiles (per content_mvp2)

### Updated
- All tables use snake_case
- startup_metrics includes all fields from content_mvp2
- Proper JSONB types for arrays
- Consistent TEXT for IDs (not UUID type)
- Proper foreign key constraints

---

## 🚀 NEXT STEPS AFTER REBUILD

1. **Update API Routes** - Verify all API routes use new snake_case fields
2. **Update Frontend Components** - Update any hardcoded field names
3. **Test All Flows** - Run through complete user journeys
4. **Implement Onboarding Forms** - Use new schema fields
5. **Add Social Widgets** - Leverage new tables

---

## 📞 SUPPORT

If you encounter issues:
1. Check Supabase logs in dashboard
2. Check browser console for errors
3. Review Prisma error messages
4. Verify .env credentials are correct

---

**Ready to execute? Follow STEP 1 above!**

