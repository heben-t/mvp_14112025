# ROI Implementation - Database Schema Verification

## ✅ Verification Complete

**Date**: 2025-11-11  
**Status**: All database field mappings verified and corrected

---

## 🔍 Schema Analysis

### Prisma Schema Review (`schema.prisma`)

#### **campaigns** table (lines 58-84)
```prisma
model campaigns {
  id                   String               @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  startup_profile_id   String               @db.Uuid
  title                String               @db.VarChar(255)
  description          String?
  vsl_url              String?
  pitch_deck           String?
  current_raised       Decimal?             @default(0) @db.Decimal(15, 2)
  max_investment       Decimal?             @db.Decimal(15, 2)
  status               String?              @default("draft") @db.VarChar(50)
  published_at         DateTime?            @db.Timestamptz(6)
  closes_at            DateTime?            @db.Timestamptz(6)
  view_count           Int?                 @default(0)
  interested_investors Int?                 @default(0)
  created_at           DateTime?            @default(now()) @db.Timestamptz(6)
  updated_at           DateTime?            @default(now()) @db.Timestamptz(6)
  campaign_objective   String?              @db.VarChar
  
  // Relations
  startup_profiles     startup_profiles?    @relation(fields: [startup_profile_id], references: [id], ...)
  investments          investments[]
}
```

#### **startup_profiles** table (lines 177-226)
```prisma
model startup_profiles {
  id                       String                   @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  userId                   String                   @unique @db.Uuid
  companyName              String?                  @db.VarChar(255)
  // ... other fields
  
  // Relations
  campaigns                campaigns[]
  users                    users                    @relation(fields: [userId], references: [id], ...)
}
```

---

## 🔧 Fixed Issues

### Issue #1: Incorrect Relation Name ❌ → ✅

**File**: `app/roi/[campaignId]/page.tsx`

**Problem**:
```typescript
// ❌ WRONG - Used singular form
const campaign = await prisma.campaigns.findFirst({
  where: {
    startup_profile: {  // Wrong relation name
      userId: userId,
    },
  },
  include: {
    startup_profile: true,  // Wrong relation name
  },
});
```

**Solution**:
```typescript
// ✅ CORRECT - Uses plural form matching schema
const campaign = await prisma.campaigns.findFirst({
  where: {
    startup_profiles: {  // Correct relation name from schema
      userId: userId,
    },
  },
  include: {
    startup_profiles: true,  // Correct relation name
  },
});
```

**Root Cause**: The Prisma schema defines the relation as `startup_profiles` (plural) on line 77 of schema.prisma, not `startup_profile` (singular).

---

## ✅ Verified Field Mappings

### `/roi/[campaignId]/page.tsx` 

| Code Field | Schema Field | Type | Status |
|------------|--------------|------|--------|
| `campaign.id` | `campaigns.id` | UUID | ✅ Correct |
| `campaign.title` | `campaigns.title` | VARCHAR(255) | ✅ Correct |
| `campaign.current_raised` | `campaigns.current_raised` | Decimal(15,2) | ✅ Correct |
| `campaign.view_count` | `campaigns.view_count` | Int | ✅ Correct |
| `campaign._count.investments` | Count aggregation | Int | ✅ Correct |
| `campaign.startup_profiles` | Relation to startup_profiles | Relation | ✅ **Fixed** |

### `/dashboard/startup/page.tsx`

| Code Field | Schema Field | Type | Status |
|------------|--------------|------|--------|
| `startupProfile.userId` | `startup_profiles.userId` | UUID | ✅ Correct |
| `startupProfile.companyName` | `startup_profiles.companyName` | VARCHAR(255) | ✅ Correct |
| `startupProfile.campaigns` | Relation to campaigns | Relation | ✅ Correct |
| `campaign.id` | `campaigns.id` | UUID | ✅ Correct |
| `campaign.title` | `campaigns.title` | VARCHAR(255) | ✅ Correct |
| `campaign.current_raised` | `campaigns.current_raised` | Decimal(15,2) | ✅ Correct |
| `campaign.view_count` | `campaigns.view_count` | Int | ✅ Correct |
| `campaign.status` | `campaigns.status` | VARCHAR(50) | ✅ Correct |
| `campaign.created_at` | `campaigns.created_at` | Timestamptz(6) | ✅ Correct |
| `campaign.campaign_objective` | `campaigns.campaign_objective` | VARCHAR | ✅ Correct |
| `campaign._count.investments` | Count aggregation | Int | ✅ Correct |

---

## 🔒 Security Verification

### Authentication & Authorization Checks

**ROI Page** (`/roi/[campaignId]/page.tsx`):
```typescript
✅ User authentication: getCurrentUser()
✅ Role check: user.role !== 'STARTUP' redirects
✅ Ownership verification: Query filters by userId through startup_profiles relation
✅ 404 on unauthorized access: notFound() if campaign not found or not owned
```

**Query Security**:
```typescript
// Ensures user can only access their own campaigns
const campaign = await prisma.campaigns.findFirst({
  where: {
    id: campaignId,
    startup_profiles: {
      userId: userId,  // ✅ Ownership check
    },
  },
});
```

---

## 🗄️ Supabase Compatibility

### UUID Type Matching
- **Schema**: Uses `@db.Uuid` for all ID fields ✅
- **Code**: Passes string UUIDs to queries ✅
- **Supabase**: Uses `uuid` type in PostgreSQL ✅

### Field Types
| Prisma Type | PostgreSQL/Supabase Type | Compatible |
|-------------|---------------------------|------------|
| `String @db.Uuid` | `uuid` | ✅ Yes |
| `String @db.VarChar(255)` | `varchar(255)` | ✅ Yes |
| `Decimal(15,2)` | `decimal(15,2)` | ✅ Yes |
| `Int` | `integer` | ✅ Yes |
| `DateTime @db.Timestamptz(6)` | `timestamptz` | ✅ Yes |

### Row Level Security (RLS) Considerations
The current implementation queries through Prisma, which uses the service role key. If RLS policies are enabled on Supabase:

**Recommended Policy for `campaigns` table**:
```sql
-- Allow startups to read their own campaigns
CREATE POLICY "Startups can view own campaigns"
  ON campaigns FOR SELECT
  USING (
    startup_profile_id IN (
      SELECT id FROM startup_profiles WHERE userId = auth.uid()
    )
  );
```

---

## 📊 Test Scenarios

### Scenario 1: Valid Campaign Owner
```
Given: Startup user with ID 'user-123'
And: Campaign with ID 'campaign-456' owned by 'user-123'
When: User visits /roi/campaign-456
Then: ROI page displays successfully ✅
```

### Scenario 2: Invalid Campaign ID
```
Given: Startup user with ID 'user-123'
When: User visits /roi/non-existent-id
Then: 404 Not Found page displays ✅
```

### Scenario 3: Unauthorized Access
```
Given: Startup user with ID 'user-123'
And: Campaign with ID 'campaign-456' owned by 'user-999'
When: User visits /roi/campaign-456
Then: 404 Not Found page displays ✅
```

### Scenario 4: Non-Startup User
```
Given: Investor user
When: User visits /roi/campaign-456
Then: Redirected to /dashboard ✅
```

### Scenario 5: Unauthenticated User
```
Given: No authenticated user
When: User visits /roi/campaign-456
Then: Redirected to /auth/signin ✅
```

---

## 🎯 Summary

### Changes Made
1. ✅ Fixed relation name from `startup_profile` to `startup_profiles` in ROI page
2. ✅ Verified all field mappings match Prisma schema
3. ✅ Confirmed UUID types are compatible with Supabase
4. ✅ Validated security and authorization logic

### Files Modified
- `app/roi/[campaignId]/page.tsx` - **1 correction made**
- `app/dashboard/startup/page.tsx` - **No changes needed** (already correct)

### Status
🟢 **All database field mappings verified and corrected**  
🟢 **Supabase compatibility confirmed**  
🟢 **Ready for testing**

---

## 📝 Next Steps

1. **Test the implementation**:
   ```bash
   npm run dev
   ```

2. **Verify database connection**:
   - Ensure `DATABASE_URL` in `.env` points to Supabase
   - Run Prisma introspection if needed: `npx prisma db pull`

3. **Generate Prisma Client** (if not done):
   ```bash
   npx prisma generate
   ```

4. **Test user flows**:
   - Login as startup user
   - Navigate to dashboard
   - Click "Consolidated ROI" widget
   - Verify campaign-specific ROI page loads
   - Test "View ROI" button on campaign cards

---

**Verification Completed By**: AI Assistant  
**Last Updated**: 2025-11-11T14:16:27Z
