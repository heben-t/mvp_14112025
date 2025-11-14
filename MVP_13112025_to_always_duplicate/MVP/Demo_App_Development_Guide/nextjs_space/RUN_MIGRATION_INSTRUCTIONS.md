# 🚀 DATABASE MIGRATION - CRITICAL FIRST STEP

## ⚠️ YOU MUST RUN THIS BEFORE USING NEW FEATURES

The SQL migration file cannot be executed programmatically via Supabase JS client (it requires DDL permissions).

---

## 📋 STEP-BY-STEP INSTRUCTIONS

### Method 1: Supabase Dashboard (RECOMMENDED) ✅

1. **Open Supabase Dashboard**
   - URL: https://supabase.com/dashboard
   - Login with your credentials

2. **Select Your Project**
   - Project: `gnzcvhyxiatcjofywkdq`
   - Or search for: "ai_roi_dashboard"

3. **Navigate to SQL Editor**
   - Left sidebar → Click "SQL Editor"
   - Click "New Query" button

4. **Copy & Paste Migration SQL**
   - Open file: `prisma/migrations/product_design_enhancements.sql`
   - Select ALL content (Ctrl+A)
   - Copy (Ctrl+C)
   - Paste into Supabase SQL Editor (Ctrl+V)

5. **Execute Migration**
   - Click "Run" button (or Ctrl+Enter)
   - Wait for completion (~5-10 seconds)
   - You should see "Success" message

6. **Verify Tables Created**
   - Go to "Table Editor" in left sidebar
   - You should see 10 new tables:
     - watchlist_folders
     - campaign_analytics
     - saved_searches
     - campaign_templates
     - investment_calculations
     - campaign_questions
     - campaign_updates
     - investment_activity
     - plugin_integrations
     - csv_upload_history

---

### Method 2: psql Command Line (If you have PostgreSQL installed)

```bash
# Set password environment variable
set PGPASSWORD=hebedaihebed

# Run migration
psql -h aws-1-us-west-1.pooler.supabase.com -U postgres.gnzcvhyxiatcjofywkdq -d postgres -p 5432 -f prisma/migrations/product_design_enhancements.sql

# Or use the generated script
bash run-migration.sh
```

---

### Method 3: Using Supabase CLI (If installed)

```bash
# Login to Supabase
supabase login

# Link to project
supabase link --project-ref gnzcvhyxiatcjofywkdq

# Run migration
supabase db push --include-all
```

---

## ✅ VERIFICATION

After running the migration, verify with this test script:

```bash
cd C:\Users\edwar\Downloads\MVP\Demo_App_Development_Guide\ai_roi_dashboard\nextjs_space
node test-product-enhancements.js
```

**Expected Output:** All 10 tables should show ✅

---

## 🆘 TROUBLESHOOTING

### Error: "relation already exists"
**Solution:** Tables were already created. Safe to ignore or drop and recreate.

### Error: "permission denied"
**Solution:** Make sure you're using service_role_key, not anon key.

### Error: "syntax error"
**Solution:** Make sure you copied the ENTIRE SQL file, from line 1 to the end.

### Can't access Supabase Dashboard
**Solution:** 
1. Check your login credentials
2. Or use psql method
3. Or contact your Supabase admin

---

## 📞 NEED HELP?

**File Location:** 
```
C:\Users\edwar\Downloads\MVP\Demo_App_Development_Guide\ai_roi_dashboard\nextjs_space\prisma\migrations\product_design_enhancements.sql
```

**Lines of SQL:** 188 lines  
**Tables Created:** 10 new tables  
**Columns Added:** ~15 to existing tables  
**Sample Data:** 3 campaign templates  

---

## ⏭️ AFTER MIGRATION

Once migration is complete:

1. ✅ Run verification script
2. ✅ Restart dev server (`npm run dev`)
3. ✅ Test new components
4. ✅ Integrate into pages
5. ✅ Celebrate! 🎉

---

**Status:** ⏳ PENDING MIGRATION  
**Priority:** 🔴 CRITICAL - Must run before testing new features  
**Difficulty:** ⚡ EASY - Just copy/paste  
**Time:** ⏱️ 5 minutes  
