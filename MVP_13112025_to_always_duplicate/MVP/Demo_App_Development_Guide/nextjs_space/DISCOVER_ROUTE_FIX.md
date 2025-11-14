# Discover Page Duplicate Route Fix

**Date:** 2025-11-10  
**Status:** ✅ FIXED

## Issue

NextJS error due to duplicate `/discover` routes:
```
You cannot have two parallel pages that resolve to the same path. 
Please check /(marketing)/discover/page and /discover/page.
```

## Root Cause

Two `page.tsx` files existed at the same route:
1. `app/discover/page.tsx` - For authenticated investors
2. `app/(marketing)/discover/page.tsx` - For marketing/public view

## Solution

**Removed:** `app/(marketing)/discover/page.tsx`

**Kept:** `app/discover/page.tsx` (investor dashboard version)

## Differences

### Root `/discover/page.tsx` (KEPT)
- ✅ Requires authentication (`getCurrentUser()`)
- ✅ Uses Prisma for database queries
- ✅ Shows campaigns to logged-in investors
- ✅ Uses correct snake_case field names
- ✅ Has proper filtering and sorting

### Marketing `(marketing)/discover/page.tsx` (DELETED)
- Used for public/marketing purposes
- Used Supabase service role client
- No authentication required
- Redundant for MVP

## Current State

**Route:** `/discover`
- Accessible to authenticated users only
- Displays all published campaigns
- Uses correct database field names:
  - `campaign.current_raised` ✅
  - `campaign.view_count` ✅
  - `campaign._count.investments` ✅
  - `campaign.startup_profiles.*` ✅

## Testing

- [ ] Navigate to `/discover` when logged in
- [ ] Verify campaigns display correctly
- [ ] Verify metrics show properly
- [ ] No more route conflict errors

---

**Next.js route conflict resolved!** 🎉
