# HEBED AI - MVP Update Requirements Summary

**Date:** 2025-11-08  
**Source:** content_mvp2.txt  
**Status:** ⚠️ LARGE SCOPE - Needs Confirmation

---

## 🎯 Executive Summary

The content_mvp2.txt file contains extensive requirements for updating:
- **2 major onboarding flows** (complete rebuild)
- **4 dashboard pages** (widget removals & additions)
- **Database schema changes**
- **New component development**

**Estimated Implementation Time:** 20-25 hours

---

## 📊 Changes Breakdown

### 🔴 HIGH COMPLEXITY (12-14 hours)

1. **Investor Onboarding** - Full 3-step wizard rebuild
2. **Startup Onboarding** - Form rebuild with dynamic success states

### 🟡 MEDIUM COMPLEXITY (6-8 hours)

3. **Investor Dashboard** - Add social widgets (Comments, Followers)
4. **Discover Page** - Logic updates for widget display

### 🟢 LOW COMPLEXITY (2-3 hours)

5. **Profile Page** - Remove KYC/Accreditation widgets
6. **Portfolio Links** - Redirect all to `/coming-soon`
7. **Coming Soon Page** - Create simple placeholder

---

## ⚠️ CRITICAL DECISION NEEDED

This is NOT a quick fix - it's a **major feature update** that requires:

✅ Already complete:
- Database triggers fixed
- Google OAuth working
- RLS policies updated

🔄 Still needed:
- Complete rewrite of 2 onboarding flows
- New multi-step form components
- Database schema updates
- Extensive testing

---

## 🤔 RECOMMENDATION

**I suggest we:**

### Option 1: Incremental Implementation ⭐ RECOMMENDED
Start with highest priority items first:
1. Remove KYC/Accreditation widgets (30 min)
2. Update Discover page text (30 min)  
3. Fix Portfolio links (30 min)
4. Create Coming Soon page (1 hour)
5. Then tackle complex forms (15-20 hours)

**Total Day 1:** 2-3 hours (quick wins)  
**Day 2+:** Complex onboarding flows

### Option 2: Full Implementation
I implement everything now (20-25 hours of work)

### Option 3: Specification Only
I provide detailed specs, your dev team implements

---

## 📝 Files That Need Changes

| File | Change Type | Complexity | Time |
|------|-------------|------------|------|
| `/app/auth/onboarding/startup/page.tsx` | Rebuild | High | 4-6h |
| `/app/auth/onboarding/investor/page.tsx` | Rebuild | High | 6-8h |
| `/app/dashboard/profile/page.tsx` | Remove widgets | Low | 1-2h |
| `/app/(marketing)/discover/page.tsx` | Update text & logic | Medium | 2-3h |
| Investor Dashboard (TBD) | Add widgets | Medium | 4-5h |
| Portfolio links (Multiple) | Redirect | Low | 1h |
| `/app/coming-soon/page.tsx` | Create new | Low | 1h |

**Total:** 19-26 hours

---

## ❓ WHAT WOULD YOU LIKE ME TO DO?

**Please choose ONE:**

### A) Quick Wins First (Recommended) ✅
- I'll do the easy updates now (2-3 hours)
- Profile page cleanup
- Discover page updates
- Portfolio redirects
- Coming Soon page
- **Then** we tackle the complex onboarding forms

### B) Full Implementation Now
- I'll implement everything (20-25 hours)
- You'll need to review and test extensively
- May take 2-3 sessions

### C) Just Create Specs
- I'll write detailed implementation guides
- Your dev team does the coding
- I'll be available for questions

---

**Waiting for your decision before proceeding...**

All the database and auth issues are already fixed. This is purely feature development work.

