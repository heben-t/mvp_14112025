# MVP Implementation Plan - content_mvp2.txt

## Execution Status: IN PROGRESS

---

## Changes Required

### 1. Startup Onboarding (`/onboarding/startup`)
**File:** `app/auth/onboarding/startup/page.tsx` or `app/(dashboard)/onboarding/startup/page.tsx`

**Changes:**
- [ ] Single-step form (not multi-step)
- [ ] Fields:
  - Company Name (text, 2-80 chars)
  - Industry (dropdown with 7 options)
  - Stage (Pre-Seed or Seed with descriptions)
  - Company Description (textarea, 30-400 chars)
  - Geographic Presence (UAE dropdown)
  - Data Migration Method (Plugin vs Manual)
- [ ] Dynamic success messages based on method selection
- [ ] Plugin success: Show API requirements list
- [ ] Manual success: Show CSV template download link
- [ ] Post-submit CTA: "Explore public campaigns" → `/coming-soon`

### 2. Investor Onboarding (`/onboarding/investor`)
**File:** `app/auth/onboarding/investor/page.tsx` or `app/(dashboard)/onboarding/investor/page.tsx`

**Changes:**
- [ ] Convert to 3-step wizard
- [ ] **Step 1: Investor Profile**
  - Investor Type (dropdown, 4 options)
  - Investment Type (checkboxes, multi-select)
  - Investment Range/Ticket Size (dropdown, 4 options)
- [ ] **Step 2: Investment Preferences**
  - Investment Stage (checkboxes: Pre-Seed, Seed)
  - AI Sector Focus (checkboxes, multi-select + "Other" with text input)
  - Geographic Focus (checkboxes, UAE pre-checked)
  - ROI Priorities (checkboxes, 4 options)
- [ ] **Step 3: Visibility & Notices**
  - Profile Visibility (radio, 2 options)
  - Accreditation checkbox (optional)
  - Investment Structure & Risk Notice (info text)
- [ ] Submit shows confirmation + CTA to `/coming-soon`

### 3. Profile Page (`/dashboard/profile/page.tsx`)
**File:** `app/dashboard/profile/page.tsx`

**Changes:**
- [ ] Remove KYC widget/content for startups
- [ ] Remove Accreditation widget for investors
- [ ] Keep accreditation in onboarding Step 3 only

### 4. Portfolio Button (Global)
**Changes:**
- [ ] Find all "Portfolio" buttons/links
- [ ] Redirect to `/coming-soon`

### 5. Discover Page (`/discover`)
**File:** `app/(marketing)/discover/page.tsx`

**Changes:**
- [ ] Remove "funding goal" field entirely
- [ ] Update hero text: "discover investment oppourtunities" → "Explore verified AI matching opportunities"
- [ ] Display logic for widgets: Show `n/A` for 0 values EXCEPT first widget (Active Campaign)

### 6. Investor Dashboard
**File:** `app/dashboard/investor/...` or relevant investor dashboard components

**Changes:**
- [ ] Add social widgets to startup project detail panels:
  - Comments (count + latest 1-2)
  - Followers (count + avatar group of last 5)
- [ ] Placement: Right rail (desktop) / Collapsible section (mobile)
- [ ] Empty states: "No comments yet" / "No followers yet"

---

## File Mapping

| Requirement | File Path | Status |
|-------------|-----------|--------|
| Startup Onboarding | `app/auth/onboarding/startup/page.tsx` | TODO |
| Investor Onboarding | `app/auth/onboarding/investor/page.tsx` | TODO |
| Profile Page | `app/dashboard/profile/page.tsx` | TODO |
| Discover Page | `app/(marketing)/discover/page.tsx` | TODO |
| Portfolio Links | Multiple files | TODO |
| Investor Dashboard | TBD | TODO |

---

## Data Models Required

```typescript
// Startup onboarding
type StartupOnboarding = {
  companyName: string;
  industry: 'AI SaaS' | 'Fintech / Data Intelligence' | 'PropTech / Real Estate AI' | 'HealthTech' | 'EdTech' | 'AI Infrastructure / Tools' | 'Other AI Applications';
  stage: 'Pre-Seed' | 'Seed';
  description: string;
  geo: 'Based in the UAE' | 'Expanding into the UAE';
  dataMigrationMethod: 'plugin' | 'manual';
};

// Investor onboarding
type InvestorOnboarding = {
  investorType: 'Individual Investor'|'Angel Investor'|'VC Partner'|'Family Office';
  investmentTypes: Array<'Equity'|'Convertible Note / SAFE'|'Crowdfunding participation (via pooled round)'|'Strategic / Advisory'>;
  ticketRange: '≤$50k'|'$50k–$250k'|'$250k–$1M'|'$1M+';
  stages: Array<'Pre-Seed'|'Seed'>;
  sectors: string[];
  geoFocus: Array<'UAE'|'Expanding into the UAE'>;
  roiPriorities: Array<'Financial'|'Operational'|'Innovation'|'Social/Sustainability'>;
  visibility: 'visible'|'after_interest';
  accredited?: boolean;
};
```

---

## Implementation Order

1. ✅ Read and understand requirements
2. ⏳ Check existing files
3. ⏳ Create/update startup onboarding
4. ⏳ Create/update investor onboarding  
5. ⏳ Update profile page
6. ⏳ Update discover page
7. ⏳ Fix portfolio links
8. ⏳ Add social widgets to investor dashboard
9. ⏳ Create `/coming-soon` page if doesn't exist
10. ⏳ Test all flows

---

## Next Steps

Starting implementation...

