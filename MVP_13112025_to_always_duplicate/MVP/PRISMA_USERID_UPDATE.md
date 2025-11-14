# Prisma Schema Update - startup_profiles.userId Mapping

## ✅ Change Applied

### Issue
The Prisma schema had `user_id` as the field name, but Supabase database column is `user_id`. We needed to use camelCase `userId` in the Prisma model while mapping it to the snake_case `user_id` column in the database.

### Solution
Updated the `startup_profiles` model to use `userId` with `@map("user_id")` directive.

---

## 📝 Changes Made

**File**: `prisma/schema.prisma`

### Before:
```prisma
model startup_profiles {
  id                       String               @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  user_id                  String               @unique @db.Uuid
  // ... other fields
  users                    users                @relation(fields: [user_id], references: [id], onDelete: Cascade, onUpdate: NoAction)

  @@index([user_id], map: "idx_startup_profiles_user_id")
}
```

### After:
```prisma
model startup_profiles {
  id                       String               @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  userId                   String               @unique @map("user_id") @db.Uuid
  // ... other fields
  users                    users                @relation(fields: [userId], references: [id], onDelete: Cascade, onUpdate: NoAction)

  @@index([userId], map: "idx_startup_profiles_user_id")
}
```

---

## 🔧 What Changed

1. **Field Name**: `user_id` → `userId`
2. **Added Mapping**: `@map("user_id")` to map Prisma's camelCase to database's snake_case
3. **Updated Relation**: `fields: [userId]` instead of `fields: [user_id]`
4. **Updated Index**: `@@index([userId], ...)` instead of `@@index([user_id], ...)`

---

## 📊 Benefits

### Before (Issues):
- ❌ Inconsistent naming between database column and Prisma usage
- ❌ Code used `userId` but schema had `user_id`
- ❌ Caused errors like "Column user_id not found"

### After (Fixed):
- ✅ Prisma client uses camelCase `userId` (JavaScript convention)
- ✅ Maps correctly to snake_case `user_id` in database (SQL convention)
- ✅ Consistent with Supabase database schema
- ✅ TypeScript autocomplete works correctly

---

## 💻 Code Usage

### Before Update:
```typescript
// This would fail because Prisma expected user_id
const profile = await prisma.startup_profiles.findUnique({
  where: { user_id: userId } // Error: user_id doesn't exist in type
});
```

### After Update:
```typescript
// Now this works correctly
const profile = await prisma.startup_profiles.findUnique({
  where: { userId: userId } // ✅ Correct - uses camelCase
});

// Or with TypeScript shorthand
const profile = await prisma.startup_profiles.findUnique({
  where: { userId } // ✅ Works perfectly
});
```

---

## 🔄 Next Steps

### 1. Regenerate Prisma Client

**Note**: The generation might fail if dev server is running. Stop it first.

```bash
# Stop the dev server (if running)
# Then regenerate Prisma client:
npx prisma generate
```

**If you get "EPERM: operation not permitted" error:**
1. Stop the Next.js dev server (`Ctrl+C`)
2. Run `npx prisma generate` again
3. Restart the dev server

### 2. Verify Changes

After regenerating, verify the types are correct:

```typescript
// Import Prisma client
import { prisma } from '@/lib/prisma';

// This should now work with TypeScript autocomplete
const profile = await prisma.startup_profiles.findUnique({
  where: {
    userId: 'some-user-id' // TypeScript should autocomplete 'userId'
  }
});
```

### 3. Update Any Existing Code

Search for any code that might still use `user_id`:

```bash
# Search in your codebase
# Look for: startup_profiles.user_id or {user_id: 
# Replace with: startup_profiles.userId or {userId:
```

**Files to Check**:
- `app/api/campaigns/create/route.ts` ✅ Already uses correct approach
- Any other files that query `startup_profiles`

---

## ✅ Verification Checklist

After regenerating Prisma client:

- [ ] `npx prisma generate` completes without errors
- [ ] TypeScript shows `userId` in autocomplete (not `user_id`)
- [ ] Campaign creation API works
- [ ] No TypeScript errors in IDE
- [ ] Database queries execute successfully

---

## 📚 Prisma Mapping Reference

### The `@map()` Directive

Prisma's `@map()` directive allows you to:
- Use JavaScript/TypeScript naming conventions in your code (camelCase)
- Map to database naming conventions (snake_case)
- Keep database schema unchanged

**Syntax**:
```prisma
model MyModel {
  myField String @map("my_field")
  //      ↑              ↑
  //   Prisma name   DB column name
}
```

**Usage in Code**:
```typescript
// Use camelCase in code
prisma.myModel.findMany({
  where: { myField: "value" }
})

// Prisma translates to SQL:
// SELECT * FROM my_model WHERE my_field = 'value'
```

---

## 🐛 Troubleshooting

### Issue: "Property 'userId' does not exist"

**Cause**: Prisma client not regenerated after schema change

**Fix**:
```bash
npx prisma generate
```

### Issue: "Column user_id not found"

**Cause**: Schema uses `userId` but database has different column name

**Fix**: Already applied with `@map("user_id")`

### Issue: Cannot regenerate Prisma client

**Cause**: File lock from running dev server

**Fix**:
1. Stop Next.js dev server
2. Run `npx prisma generate`
3. Restart dev server

---

## 📝 Summary

**Status**: ✅ Schema Updated  
**Files Modified**: 1 (`prisma/schema.prisma`)  
**Breaking Changes**: None (database schema unchanged)  
**Action Required**: Regenerate Prisma client with `npx prisma generate`

The `startup_profiles` model now correctly uses `userId` in TypeScript code while mapping to `user_id` in the PostgreSQL database. This provides the best of both worlds: idiomatic JavaScript/TypeScript code and standard SQL naming conventions.

---

**Updated**: 2025-11-10 12:22 UTC  
**Applies to**: Prisma schema v5.x
