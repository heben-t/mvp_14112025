# Column Name Reference - Prisma vs PostgreSQL

## 🔍 The Issue

Your Prisma schema uses **camelCase** in code but **snake_case** in the database.

**Example:**
```typescript
// Prisma schema.prisma
model startup_profiles {
  userId String @map("user_id")  // Code: userId, DB: user_id
}
```

**RLS Policies must use DATABASE column names (snake_case)**, not Prisma field names!

---

## 📋 Correct Column Mappings

### Table: `public.users`
| Prisma Field | Database Column | Type |
|--------------|-----------------|------|
| id | id | TEXT |
| email | email | TEXT |
| emailVerified | "emailVerified" | TIMESTAMP |
| createdAt | "createdAt" | TIMESTAMP |
| updatedAt | "updatedAt" | TIMESTAMP |

**RLS Example:**
```sql
-- ✅ CORRECT
WHERE auth.uid()::text = users.id

-- ❌ WRONG (no such column)
WHERE auth.uid()::text = users.user_id
```

---

### Table: `public.startup_profiles`
| Prisma Field | Database Column | Type |
|--------------|-----------------|------|
| id | id | TEXT |
| userId | user_id | TEXT |
| startupProfileId | startup_profile_id | TEXT |
| companyName | company_name | TEXT |
| createdAt | created_at | TIMESTAMP |
| updatedAt | updated_at | TIMESTAMP |

**RLS Example:**
```sql
-- ✅ CORRECT
WHERE auth.uid()::text = startup_profiles.user_id

-- ❌ WRONG
WHERE auth.uid()::text = startup_profiles.userId  -- Column doesn't exist!
```

---

### Table: `public.investor_profiles`
| Prisma Field | Database Column | Type |
|--------------|-----------------|------|
| id | id | TEXT |
| userId | user_id | TEXT |
| professionalTitle | professional_title | TEXT |
| investmentFocus | investment_focus | TEXT |
| ticketSize | ticket_size | TEXT |
| accreditationStatus | accreditation_status | ENUM |
| stripeCustomerId | stripe_customer_id | TEXT |
| createdAt | created_at | TIMESTAMP |

**RLS Example:**
```sql
-- ✅ CORRECT
WHERE auth.uid()::text = investor_profiles.user_id

-- ❌ WRONG
WHERE auth.uid()::text = investor_profiles.userId
```

---

### Table: `public.campaigns`
| Prisma Field | Database Column | Type |
|--------------|-----------------|------|
| id | id | TEXT |
| startupProfileId | startup_profile_id | TEXT |
| vslUrl | vsl_url | TEXT |
| pitchDeck | pitch_deck | TEXT |
| fundraisingGoal | fundraising_goal | FLOAT |
| currentRaised | current_raised | FLOAT |
| createdAt | created_at | TIMESTAMP |

**RLS Example:**
```sql
-- ✅ CORRECT
SELECT 1 FROM public.startup_profiles
WHERE id = campaigns.startup_profile_id
AND user_id = auth.uid()::text

-- ❌ WRONG
WHERE id = campaigns.startupProfileId  -- Column doesn't exist!
```

---

### Table: `public.investments`
| Prisma Field | Database Column | Type |
|--------------|-----------------|------|
| id | id | TEXT |
| campaignId | campaign_id | TEXT |
| investorProfileId | investor_profile_id | TEXT |
| stripePaymentIntentId | stripe_payment_intent_id | TEXT |
| escrowReleased | escrow_released | BOOLEAN |
| createdAt | created_at | TIMESTAMP |

**RLS Example:**
```sql
-- ✅ CORRECT
WHERE id = investments.investor_profile_id
AND user_id = auth.uid()::text

-- ❌ WRONG
WHERE id = investments.investorProfileId
```

---

### Table: `public.watchlist` (singular)
| Prisma Field | Database Column | Type |
|--------------|-----------------|------|
| id | id | UUID |
| investor_profile_id | investor_profile_id | UUID |
| campaign_id | campaign_id | TEXT |
| alert_on_metric_change | alert_on_metric_change | BOOLEAN |
| created_at | created_at | TIMESTAMP |

**Note:** This table uses snake_case directly (no camelCase in Prisma)

**RLS Example:**
```sql
-- ✅ CORRECT (note: investor_profile_id is UUID, needs cast)
WHERE watchlist.investor_profile_id::text IN (
  SELECT id FROM investor_profiles
  WHERE user_id = auth.uid()::text
)
```

---

### Table: `public.watchlists` (plural) - if it exists
| Prisma Field | Database Column | Type |
|--------------|-----------------|------|
| id | id | TEXT |
| investorProfileId | investorProfileId | TEXT |
| campaignId | campaignId | TEXT |
| alertOnMetricChange | alertOnMetricChange | BOOLEAN |
| createdAt | createdAt | TIMESTAMP |

**Note:** This table might NOT have `@map` directives, so camelCase in DB too!

---

## 🔧 Quick Fix Rules

### 1. Always Use Database Column Names in SQL
```sql
-- ❌ WRONG - Using Prisma field names
WHERE userId = auth.uid()::text

-- ✅ CORRECT - Using database column names
WHERE user_id = auth.uid()::text
```

### 2. Always Cast UUID to TEXT
```sql
-- ❌ WRONG - Type mismatch
WHERE auth.uid() = user_id

-- ✅ CORRECT - Cast UUID to TEXT
WHERE auth.uid()::text = user_id
```

### 3. Check Column Names in Database
```sql
-- Run this to see actual column names
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_schema = 'public'
AND table_name = 'startup_profiles'
ORDER BY ordinal_position;
```

---

## 🐛 Common Errors

### Error 1: Column "userId" does not exist
```
ERROR: column "userId" does not exist
HINT: Perhaps you meant to reference the column "startup_profiles.user_id"
```

**Fix:** Change `userId` to `user_id`

### Error 2: Operator does not exist: text = uuid
```
ERROR: operator does not exist: text = uuid (SQLSTATE 42883)
```

**Fix:** Add `::text` cast to UUID: `auth.uid()::text`

### Error 3: Column "startupProfileId" does not exist
```
ERROR: column "startupProfileId" does not exist
HINT: Perhaps you meant to reference the column "campaigns.startup_profile_id"
```

**Fix:** Change `startupProfileId` to `startup_profile_id`

---

## ✅ Verification Query

Run this to check all your table columns:

```sql
SELECT 
  table_name,
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
AND table_name IN ('users', 'startup_profiles', 'investor_profiles', 'campaigns', 'investments', 'watchlist', 'watchlists')
ORDER BY table_name, ordinal_position;
```

---

## 📝 Summary

| When Writing... | Use Column Name |
|----------------|-----------------|
| **Prisma queries** (TypeScript) | camelCase (e.g., `userId`) |
| **Raw SQL** | snake_case (e.g., `user_id`) |
| **RLS Policies** | snake_case (e.g., `user_id`) |
| **Database migrations** | snake_case (e.g., `user_id`) |
| **Supabase SQL Editor** | snake_case (e.g., `user_id`) |

**Key Rule:** 
> Prisma's `@map` directive only affects the **Prisma Client** (TypeScript code).  
> The **actual database** still uses snake_case column names!

---

**Updated:** 2025-11-08  
**File:** COMPLETE_UUID_FIX_CORRECTED.sql now uses correct column names ✅
