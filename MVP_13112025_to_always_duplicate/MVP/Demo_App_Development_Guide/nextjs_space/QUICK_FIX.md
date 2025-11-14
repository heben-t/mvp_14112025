# 🚨 QUICK FIX - Auth Database Error

## Problem
```
Database error saving new user
```

## Solution (3 Steps)

### 1️⃣ Prisma Schema ✅ DONE
- `password` is now optional
- File already updated: `prisma/schema.prisma`

### 2️⃣ Run SQL in Supabase ⚠️ DO THIS NOW
1. Open https://supabase.com/dashboard
2. Go to SQL Editor
3. Copy `FIX_SUPABASE_AUTH.sql` 
4. Paste and click **RUN**
5. Wait for success message

### 3️⃣ Test It
```bash
npm run dev
# Visit: http://localhost:3000/auth/signup
# Try: Email signup AND Google OAuth
# Check: No error in URL
```

## Files to Use
- **FIX_SUPABASE_AUTH.sql** ← Run this in Supabase
- **SUPABASE_AUTH_FIX_GUIDE.md** ← Read for details

## Why This Happens
- OAuth users (Google) don't have passwords
- Database required password field
- Trigger will auto-create users from Supabase Auth

## After Fix
✅ Email signup works  
✅ Google OAuth works  
✅ Users auto-created in database  
✅ No more errors  
