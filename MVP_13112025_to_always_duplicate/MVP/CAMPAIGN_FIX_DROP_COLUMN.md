# Campaign Creation Fix - Drop Duplicate Column

## 🚨 THE PROBLEM

Error: `Argument startup_profiles is missing`

**Root Cause**: You accidentally created a column called `startup_profiles` in the campaigns table, but this name is already used for the Prisma relation.

---

## ✅ THE FIX (30 seconds)

### Run this SQL in Supabase SQL Editor:

```sql
ALTER TABLE campaigns 
DROP COLUMN IF EXISTS startup_profiles;
```

**That's it!** This single command fixes the issue.

---

## 📋 After Running the SQL

1. Stop dev server (`Ctrl+C`)
2. Run: `npx prisma generate`
3. Restart: `npm run dev`
4. Test campaign creation ✅

---

## 🔍 What's Happening

**Before (Broken)**:
```
campaigns table:
  - startup_profile_id (uuid) ← Correct foreign key
  - startup_profiles (uuid)   ← ❌ Duplicate column YOU CREATED
```

Prisma gets confused because `startup_profiles` should be a relation name, not a column.

**After (Fixed)**:
```
campaigns table:
  - startup_profile_id (uuid) ← Only this exists
  
Prisma schema:
  - startup_profiles relation → Points to startup_profile_id
```

---

## ✅ Verification

After dropping the column, this SQL should show NO `startup_profiles` column:

```sql
SELECT column_name 
FROM information_schema.columns 
WHERE table_name = 'campaigns' 
  AND column_name = 'startup_profiles';
```

**Expected result**: 0 rows

---

**Fix Now**: Go to Supabase → SQL Editor → Run the DROP COLUMN command above! 🚀
