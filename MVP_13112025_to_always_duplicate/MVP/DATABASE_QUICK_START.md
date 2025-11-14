# 🚀 DATABASE REBUILD - QUICK START GUIDE

## ⚡ SUMMARY
Complete database rebuild with snake_case, RLS, and all MVP features

---

## 📋 EXECUTE IN 4 STEPS

### Step 1: Supabase SQL Editor
1. Go to: https://supabase.com/dashboard
2. Select project: `gnzcvhyxiatcjofywkdq`
3. Click "SQL Editor" → "New Query"

### Step 2: Run Script
1. Open `COMPLETE_DATABASE_REBUILD.sql` 
2. Copy entire file (Ctrl+A, Ctrl+C)
3. Paste into SQL Editor
4. Click **Run** ▶️
5. Wait 10 seconds

### Step 3: Update Prisma
```bash
cd C:\Users\edwar\Downloads\MVP\Demo_App_Development_Guide\ai_roi_dashboard\nextjs_space
npx prisma db pull
npx prisma generate
```

### Step 4: Test
```bash
npm run dev
```

---

## ✅ RESULT

**14 Tables Created:**
- Auth: users, accounts, sessions, verification_tokens
- Profiles: startup_profiles, investor_profiles (UPDATED!)
- Campaigns: campaigns, investments, watchlists
- Metrics: startup_metrics (comprehensive)
- Social: campaign_comments, campaign_followers (NEW!)
- Payments: subscriptions, investor_preferences

**Key Features:**
- ✅ snake_case throughout
- ✅ RLS enabled (unrestricted)
- ✅ All indexes created
- ✅ Proper foreign keys
- ✅ JSONB for arrays
- ✅ content_mvp2.txt compliant

---

## 🔍 VERIFY

```sql
-- Check tables
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' ORDER BY table_name;

-- Should show 14 tables
```

---

## 📚 DOCS

- Full guide: `DATABASE_REBUILD_GUIDE.md`
- SQL script: `COMPLETE_DATABASE_REBUILD.sql`

---

**Total time: ~1 minute** ⚡

