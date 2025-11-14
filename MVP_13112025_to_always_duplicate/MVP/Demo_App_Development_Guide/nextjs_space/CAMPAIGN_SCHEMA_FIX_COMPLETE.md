# Campaign Pages Schema Alignment - Complete Fix

**Date:** 2025-11-10  
**Status:** ✅ FIXED (MVP Phase - No Investment Features)

## Summary

Fixed all Prisma/Supabase field name mismatches across campaign pages to align with snake_case database schema. For MVP phase, investment-related fields are set to placeholder values as investment functionality is not yet available.

---

## 🔧 Issues Fixed

### 1. **API Route** (`app/api/campaigns/route.ts`)
- ❌ `session?.user?.id` → ✅ `user?.id`
- ❌ `startupProfileId` → ✅ `startup_profile_id`
- ❌ `createdAt` → ✅ `created_at`
- ❌ `fundraisingGoal` → ✅ `max_investment`
- ❌ `currentRaised` → ✅ `current_raised`

### 2. **Startup Campaign Detail** (`app/dashboard/startup/campaigns/[id]/page.tsx`)
- ❌ `startupProfileId` → ✅ `startup_profile_id`
- ❌ `createdAt` → ✅ `created_at`
- ❌ `currentRaised` → ✅ `current_raised`
- ❌ `fundraisingGoal` → ✅ `max_investment`
- ❌ `viewCount` → ✅ `view_count`

### 3. **Startup Campaigns List** (`app/dashboard/startup/campaigns/page.tsx`)
- ❌ `session?.user?.id` → ✅ `user?.id`
- ❌ `createdAt` → ✅ `created_at`
- ❌ `currentRaised` → ✅ `current_raised`
- ❌ `fundraisingGoal` → ✅ `max_investment`
- ❌ `viewCount` → ✅ `view_count`
- ❌ `investorProfileId` → ✅ `investor_profile_id`

### 4. **Public Campaign Detail** (`app/campaigns/[id]/page.tsx`)
- ❌ `viewCount` → ✅ `view_count`
- ❌ Non-existent fields → ✅ Mapped with MVP placeholders
- ✅ Added proper field mapping for components expecting camelCase

---

## 📊 Database Schema (MVP Phase)

### Campaign Fields Available

```sql
-- Core campaign fields (MVP)
id                   UUID
startup_profile_id   UUID
title                VARCHAR(255)
description          TEXT
vsl_url              VARCHAR
pitch_deck           VARCHAR
current_raised       DECIMAL(15, 2)  -- For display only
max_investment       DECIMAL(15, 2)  -- Fundraising goal
status               VARCHAR(50)     -- draft, published, closed
published_at         TIMESTAMPTZ
closes_at            TIMESTAMPTZ
view_count           INT
interested_investors INT
created_at           TIMESTAMPTZ
updated_at           TIMESTAMPTZ
campaign_objective   VARCHAR
```

### MVP Phase - NOT AVAILABLE

These fields will be added in future phases when investment functionality is implemented:
- ❌ `min_investment` - Not needed for MVP
- ❌ `equity_offered` - Not needed for MVP
- ❌ `valuation` - Not needed for MVP

**Current placeholder values:**
- `minInvestment`: 0
- `equityOffered`: 0
- `valuation`: 0

---

## 🎯 Public Access Configuration

### Routes for End Users

1. **Campaign Discovery** (Investors)
   - Path: `/discover`
   - Shows all published campaigns
   - Uses correct snake_case fields
   - **MVP: View-only, no investment actions**

2. **Campaign Detail Page** (Public)
   - Path: `/campaigns/[id]`
   - Accessible to all authenticated users
   - View count automatically incremented
   - Shows company info, funding terms, VSL player
   - **MVP: Investment button visible but not functional**

3. **Startup Dashboard** (Startup owners only)
   - Path: `/dashboard/startup/campaigns/[id]`
   - Shows analytics, manage campaign
   - Restricted to campaign owner

---

## 🔍 Field Mapping Reference (MVP)

| Database (snake_case) | Component (camelCase) | Type | MVP Status |
|----------------------|----------------------|------|------------|
| `startup_profile_id` | `startupProfileId` | UUID | ✅ Active |
| `current_raised` | `currentRaised` | Decimal | ✅ Display only |
| `max_investment` | `fundraisingGoal` | Decimal | ✅ Active |
| `vsl_url` | `vslUrl` | String | ✅ Active |
| `pitch_deck` | `pitchDeck` | String | ✅ Active |
| `view_count` | `viewCount` | Int | ✅ Active |
| `interested_investors` | `interestedInvestors` | Int | ✅ Active |
| `created_at` | `createdAt` | DateTime | ✅ Active |
| `published_at` | `publishedAt` | DateTime | ✅ Active |
| `investor_profile_id` | `investorProfileId` | UUID | ✅ Active |
| N/A | `minInvestment` | Number | ❌ Placeholder (0) |
| N/A | `equityOffered` | Number | ❌ Placeholder (0) |
| N/A | `valuation` | Number | ❌ Placeholder (0) |

---

## 🚀 Next Steps (No Database Migration Needed)

### 1. Regenerate Prisma Client
```bash
cd Demo_App_Development_Guide/ai_roi_dashboard/nextjs_space
npx prisma generate
```

### 2. Test Campaign Flow (MVP)
- [ ] Startup creates campaign
- [ ] Campaign gets published (status = 'published')
- [ ] Users can view campaign at `/campaigns/[id]`
- [ ] View count increments correctly
- [ ] All metrics display correctly
- [ ] VSL plays if uploaded

---

## ✅ Verification Checklist

### Startup Dashboard
- [ ] `/dashboard/startup/campaigns` loads without errors
- [ ] Campaign list shows correct data
- [ ] Metrics calculate properly
- [ ] `/dashboard/startup/campaigns/[id]` displays campaign details
- [ ] Edit button works

### Public Pages
- [ ] `/discover` shows published campaigns
- [ ] `/campaigns/[id]` loads for published campaigns
- [ ] VSL player displays (if vsl_url exists)
- [ ] View count increments
- [ ] Company info displays correctly

### API Endpoints
- [ ] `GET /api/campaigns` returns campaigns
- [ ] Response uses snake_case from database
- [ ] Transformed data matches frontend expectations

---

## 📝 Notes

1. **MVP Scope**: This is a view-only platform for campaigns. No actual investment transactions.
2. **Data Transformation Pattern**: Database queries return snake_case, then we transform to camelCase before passing to client components
3. **Component Props**: Components still expect camelCase props for backward compatibility
4. **Type Safety**: All conversions include `Number()` wrapper for Decimal types
5. **Null Safety**: All fields have fallback values (e.g., `|| 0`, `|| ''`)
6. **Investment Fields**: Set to 0 as placeholders for future implementation

---

## 🐛 Common Errors Fixed

### Error 1: `ReferenceError: session is not defined`
**Fix:** Changed `session?.user?.id` to `user?.id`

### Error 2: `Unknown argument 'startupProfileId'`
**Fix:** Changed to `startup_profile_id` in Prisma queries

### Error 3: `Cannot read property 'toLocaleString' of undefined`
**Fix:** Added `Number()` wrapper and fallback values

---

## 📚 Related Files

- ✅ `app/api/campaigns/route.ts`
- ✅ `app/dashboard/startup/campaigns/page.tsx`
- ✅ `app/dashboard/startup/campaigns/[id]/page.tsx`
- ✅ `app/campaigns/[id]/page.tsx`
- ✅ `app/discover/page.tsx` (already correct)
- ✅ `prisma/schema.prisma`

---

## 🔮 Future Implementation (Post-MVP)

When investment functionality is added:
1. Add new columns to campaigns table:
   - `min_investment DECIMAL(15, 2)`
   - `equity_offered DECIMAL(5, 2)`
   - `valuation DECIMAL(15, 2)`

2. Update Prisma schema with these fields

3. Remove placeholder values (0) and use actual database values

4. Implement investment flow, payment gateway, escrow

---

**All campaign pages now properly aligned with Prisma schema and Supabase database for MVP phase!** 🎉

**Note:** Investment features are disabled. This is a showcase/discovery platform only.
