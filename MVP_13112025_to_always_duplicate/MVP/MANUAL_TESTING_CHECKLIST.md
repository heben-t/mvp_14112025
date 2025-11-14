# 🧪 Manual Testing Checklist

Use this checklist when manually testing the application after code fixes.

---

## 🚀 Pre-Testing Setup

### Environment Setup
- [ ] Install dependencies: `npm install`
- [ ] Set up environment variables in `.env.local`
- [ ] Run database migrations: `npm run prisma migrate dev`
- [ ] Seed test data: `npm run prisma db seed`
- [ ] Start dev server: `npm run dev`
- [ ] Open browser to `http://localhost:3000`

### Test Accounts
Create these test accounts:
- [ ] **Investor Account:** `investor@test.com` / `TestPass123!`
- [ ] **Startup Account:** `startup@test.com` / `TestPass123!`
- [ ] **Admin Account:** `admin@test.com` / `TestPass123!`

---

## 📱 Page Accessibility Tests

### Dashboard Routes

#### ✅ Investment Success Page
**URL:** `/dashboard/investments/success?amount=10000&campaign=Test Startup`

- [ ] Page loads without errors
- [ ] Success icon displays (green checkmark)
- [ ] Amount displays correctly: $10,000
- [ ] Campaign name displays: Test Startup
- [ ] "What Happens Next?" section visible
- [ ] 4 numbered steps display
- [ ] 3 cards display (Check Email, Track Progress, Stay Updated)
- [ ] "View Portfolio" button works → redirects to `/dashboard/investor/portfolio`
- [ ] "Explore More Campaigns" button works → redirects to `/campaigns`
- [ ] Terms and Risk Disclosure links work
- [ ] Mobile responsive (test on < 768px)

**Console Errors:** _______________

---

#### ✅ Investor Investments Page
**URL:** `/dashboard/investor/investments`

**Prerequisites:** Must be logged in as investor

- [ ] Page loads without errors
- [ ] Auth guard works (redirects if not logged in)
- [ ] Loading spinner shows initially
- [ ] Stats cards display (Total, Active, Pending, Total Invested)
- [ ] Investment list loads
- [ ] Each investment card shows:
  - [ ] Campaign title
  - [ ] Status badge (correct color)
  - [ ] Amount formatted with commas
  - [ ] Date formatted correctly
  - [ ] "View Campaign" button works
- [ ] Status-specific messages display:
  - [ ] Yellow box for PENDING
  - [ ] Green box for ACCEPTED
  - [ ] Red box for REJECTED
- [ ] Empty state shows if no investments
- [ ] "Discover Startups" button works (check route)
- [ ] Error handling displays if API fails

**Test Error State:**
- [ ] Disconnect internet, reload page
- [ ] Error message displays
- [ ] Retry button works

**Console Errors:** _______________

---

#### ✅ Investor Portfolio Page
**URL:** `/dashboard/investor/portfolio`

**Prerequisites:** Must be logged in as investor with accepted investments

- [ ] Page loads without errors
- [ ] Auth guard redirects if not logged in
- [ ] Redirects to onboarding if no investor profile
- [ ] Page title and icon display
- [ ] Portfolio metrics cards show:
  - [ ] Total Invested
  - [ ] Active Investments
  - [ ] Total Value
  - [ ] ROI
- [ ] Investment cards grid displays (3 columns on desktop)
- [ ] Each card shows company logo or placeholder
- [ ] Empty state displays if no investments
- [ ] Portfolio insights card displays if investments exist
- [ ] Insights show correct industry count
- [ ] Average investment calculated correctly
- [ ] Skeleton loading shows during data fetch

**Console Errors:** _______________

---

#### ✅ Recommendations Page
**URL:** `/dashboard/investor/recommendations`

**Prerequisites:** Must be logged in as investor

- [ ] Page loads without errors
- [ ] Header with AI sparkle icon displays
- [ ] Recommendations load from API
- [ ] Each recommendation shows:
  - [ ] Company logo or placeholder
  - [ ] Score badge with color (green ≥80, blue ≥60, yellow <60)
  - [ ] Company name and campaign title
  - [ ] Industry and stage badges
  - [ ] Description (2 lines max)
  - [ ] "Why this matches you" section
  - [ ] Funding progress bar
  - [ ] Min investment and equity %
- [ ] "View Details" button navigates to campaign
- [ ] "Like" button shows success toast
- [ ] "Dislike" button removes from list
- [ ] Empty state shows if no recommendations
- [ ] "Update Profile" button works

**Test Interactions:**
- [ ] Click "Like" - toast shows "Added to your interests"
- [ ] Click "Dislike" - toast shows "Removed" and card disappears
- [ ] Click "View Details" - navigates to `/campaigns/{id}`

**Console Errors:** _______________

---

#### ✅ Watchlist Page
**URL:** `/dashboard/investor/watchlist`

**Prerequisites:** Must be logged in as investor

- [ ] Page loads without errors
- [ ] Auth guard works
- [ ] Header with bookmark icon displays
- [ ] Campaign count card shows correct number
- [ ] Watchlist folders component displays
- [ ] Campaign cards load (if any in watchlist)
- [ ] Empty state shows if no campaigns
- [ ] Each card displays campaign info correctly
- [ ] Can click card to view campaign details
- [ ] Tips card displays at bottom
- [ ] Tips are helpful and relevant

**Console Errors:** _______________

---

#### ✅ Subscription Management Page
**URL:** `/dashboard/subscription`

**Prerequisites:** Must be logged in

**Test Free Tier:**
- [ ] Page loads without errors
- [ ] "Current Plan" card shows "Free"
- [ ] Free features listed with checkmarks
- [ ] "Upgrade to Pro" button links to `/api/subscription/checkout?plan=pro`
- [ ] Billing card shows "No active subscription"
- [ ] "View All Plans" button links to `/pricing`

**Test Pro Tier (if subscribed):**
- [ ] "Current Plan" card shows "Pro"
- [ ] Pro features listed
- [ ] Billing status shows "active"
- [ ] Next billing date displays
- [ ] Amount shows "$29/month"
- [ ] "Manage Billing" button works
- [ ] "Cancel Subscription" button shows confirmation
- [ ] Cancel action works (verify functionality)

**Console Errors:** _______________

---

#### ✅ Investment Success (Payment) Page
**URL:** `/investment/success?session_id=test_session_123`

**Prerequisites:** Need valid Stripe session ID

- [ ] Page loads with Suspense fallback
- [ ] Loading spinner shows initially
- [ ] Success icon displays (green checkmark)
- [ ] "Investment Successful!" title shows
- [ ] Investment details card displays:
  - [ ] Amount
  - [ ] Campaign name
  - [ ] Status badge (Pending Approval)
  - [ ] Transaction ID
- [ ] "What happens next?" section shows 4 steps
- [ ] "View Portfolio" button navigates correctly
- [ ] "Discover More" button works

**Test Without session_id:**
- [ ] Page loads but doesn't call verify API
- [ ] Shows generic success message

**Console Errors:** _______________

---

#### ✅ Investor Onboarding Page
**URL:** `/onboarding/investor`

**Prerequisites:** Must be logged in without investor profile

- [ ] Page loads without errors
- [ ] Form displays with all fields
- [ ] Professional Title input works
- [ ] Investment Focus dropdown populated
- [ ] Ticket Size dropdown populated
- [ ] File upload for accreditation works
- [ ] "What counts as accreditation?" info box displays
- [ ] "Skip for Now" button navigates to `/dashboard`
- [ ] "Complete Setup" button disabled when submitting
- [ ] Form validation works:
  - [ ] Can submit with minimal fields
  - [ ] File upload validates size (max 20MB)
  - [ ] File upload validates type (PDF/images)
- [ ] Success toast on completion
- [ ] Redirects to `/dashboard` after submission
- [ ] Loading spinner shows during submission

**Test File Upload:**
- [ ] Upload valid PDF → succeeds
- [ ] Upload image → succeeds
- [ ] Upload .exe → rejected
- [ ] Upload 25MB file → rejected

**Console Errors:** _______________

---

#### ✅ Startup Onboarding Page
**URL:** `/onboarding/startup`

**Prerequisites:** Must be logged in without startup profile

- [ ] Page loads without errors
- [ ] Company Name input required (red asterisk)
- [ ] Logo upload works with image preview
- [ ] Industry dropdown populated
- [ ] Stage dropdown populated
- [ ] Website input validates URL format
- [ ] Description textarea works
- [ ] KYC documents section displays
- [ ] Business License upload works
- [ ] Founder ID upload works
- [ ] CSV metrics upload component displays
- [ ] "Skip for Now" button works
- [ ] "Complete Setup" validates required fields
- [ ] Form submission works
- [ ] Redirects to `/dashboard` after success

**Test Validation:**
- [ ] Submit without company name → error
- [ ] Submit without industry → error
- [ ] Submit without stage → error
- [ ] Submit with invalid URL → error
- [ ] Submit with all required → success

**Console Errors:** _______________

---

#### ✅ Subscription Success Page
**URL:** `/subscription/success?session_id=test_session_123`

**Prerequisites:** Valid Stripe session ID from subscription checkout

- [ ] Page loads with Suspense
- [ ] Loading spinner shows initially
- [ ] Success icon displays
- [ ] "Welcome Aboard!" title shows
- [ ] Subscription details card displays:
  - [ ] Plan name (capitalized)
  - [ ] Status badge (Active)
  - [ ] Next billing date
- [ ] "What's next?" section shows 4 bullets
- [ ] "Start Exploring" button navigates to `/discover`
- [ ] "Go to Dashboard" button navigates to `/dashboard`

**Console Errors:** _______________

---

### Legal Pages

#### ✅ Privacy Policy Page
**URL:** `/privacy`

- [ ] Page loads without errors
- [ ] Shield icon displays in header
- [ ] Last updated date shows
- [ ] All 11 sections display:
  1. [ ] Information We Collect
  2. [ ] How We Use Your Information
  3. [ ] Information Sharing
  4. [ ] Data Security
  5. [ ] Cookies and Tracking
  6. [ ] Your Rights
  7. [ ] Data Retention
  8. [ ] Children's Privacy
  9. [ ] International Data Transfers
  10. [ ] Changes to This Policy
  11. [ ] Contact Us
- [ ] Prose styling works (readable paragraphs)
- [ ] Lists display with bullets
- [ ] Dark mode styling works
- [ ] Scrolling smooth
- [ ] Accessible on mobile

**Console Errors:** _______________

---

#### ✅ Terms of Service Page
**URL:** `/terms`

- [ ] Page loads without errors
- [ ] FileText icon displays
- [ ] Last updated date shows
- [ ] All 11 sections display
- [ ] Content is comprehensive
- [ ] Links work (if any)
- [ ] Dark mode works
- [ ] Mobile responsive

**Console Errors:** _______________

---

#### ✅ Risk Disclosure Page
**URL:** `/risk-disclosure`

- [ ] Page loads without errors
- [ ] Alert triangle icon displays (orange)
- [ ] Last updated date shows
- [ ] Orange warning banner at top
- [ ] "Important Warning" message clear
- [ ] All 12 sections display
- [ ] Content emphasizes risks appropriately
- [ ] Dark mode works
- [ ] Mobile responsive

**Console Errors:** _______________

---

### Marketing Pages

#### ✅ Discover Page
**URL:** `/discover`

**Test Basic Display:**
- [ ] Page loads without errors
- [ ] Gradient background displays
- [ ] "Discover Investment Opportunities" title
- [ ] 3 stat cards display:
  - [ ] Active Campaigns count
  - [ ] Total Raised amount
  - [ ] Active campaigns (duplicate?)
- [ ] Campaign filters component displays
- [ ] Campaign grid loads (2 cols tablet, 3 cols desktop)
- [ ] Campaign cards display correctly

**Test Filters:**
- [ ] Industry filter works
- [ ] Stage filter works
- [ ] Min/Max goal filters work
- [ ] Search box filters campaigns
- [ ] Filters persist in URL

**Test Pagination:**
- [ ] Pagination displays if >12 campaigns
- [ ] Current page highlighted
- [ ] Click page number loads new results
- [ ] URL updates with page param

**Test Empty State:**
- [ ] Apply filters that return no results
- [ ] "No campaigns found" message displays

**Console Errors:** _______________

---

#### ✅ Pricing Page
**URL:** `/pricing`

**Test Plans Display:**
- [ ] Page loads without errors
- [ ] 3 pricing cards display (Free, Pro, Enterprise)
- [ ] "Most Popular" badge on Pro plan
- [ ] Correct icons display (Sparkles, Zap, Crown)
- [ ] Prices display correctly
- [ ] Features list with checkmarks
- [ ] CTA buttons for each plan:
  - [ ] Free: "Get Started" → `/auth/register`
  - [ ] Pro: "Start Pro Trial" → `/api/subscription/checkout?plan=pro`
  - [ ] Enterprise: "Contact Sales" → `/contact`

**Test Startup Pricing:**
- [ ] "Startup Pricing" section displays
- [ ] "5%" prominently shown
- [ ] Features listed with checkmarks
- [ ] "Create Campaign" button → `/auth/register?type=startup`

**Test FAQ:**
- [ ] 4 FAQ cards display
- [ ] Questions relevant and clear
- [ ] Answers informative

**Test Responsive:**
- [ ] Mobile: cards stack vertically
- [ ] Tablet: 2-3 columns
- [ ] Desktop: 3 columns

**Console Errors:** _______________

---

### Auth Pages (Need to Locate)

#### ⚠️ Sign In Page
**URL:** `/auth/signin`

- [ ] TODO: Locate and test this page

---

#### ⚠️ Sign Up Page
**URL:** `/auth/signup`

- [ ] TODO: Locate and test this page

---

### Campaign Pages

#### ⚠️ Campaign Detail Page
**URL:** `/campaigns/[id]`

- [ ] TODO: Locate and test this critical page

---

## 🔘 Button Click Tests

### Navigation Buttons

Test each button navigates to correct destination:

**From Investment Success:**
- [ ] "View Portfolio" → `/dashboard/investor/portfolio` ✅
- [ ] "Explore More Campaigns" → `/campaigns` ✅

**From Investments Page:**
- [ ] "View Campaign" → `/campaigns/{id}` ✅
- [ ] "Discover Startups" → `/discover` or `/campaigns` ⚠️

**From Portfolio:**
- [ ] Investment cards → `/campaigns/{id}` ✅

**From Recommendations:**
- [ ] "View Details" → `/campaigns/{id}` ✅
- [ ] "Update Profile" → `/dashboard/investor/profile` ⚠️

**From Onboarding:**
- [ ] "Skip for Now" → `/dashboard` ✅
- [ ] "Complete Setup" → `/dashboard` (after submit) ✅

**From Success Pages:**
- [ ] Various "Go to Dashboard" → `/dashboard` ✅
- [ ] Various "Explore/Discover" → `/discover` ✅

---

## 🧩 Component Tests

### Verify Components Exist

- [ ] `<CampaignCard />` - Check if defined
- [ ] `<CampaignFilters />` - Check if defined
- [ ] `<WatchlistFolders />` - Check if defined
- [ ] `<PortfolioMetrics />` - Check if defined
- [ ] `<InvestmentCard />` - Check if defined
- [ ] `<FileUpload />` - Check if defined
- [ ] `<EnhancedCSVUpload />` - Check if defined

### Test Component Functionality

**FileUpload Component:**
- [ ] Click to upload works
- [ ] Drag and drop works
- [ ] File type validation works
- [ ] File size validation works
- [ ] Preview displays (for images)
- [ ] Remove button works
- [ ] Error messages display

**CampaignCard Component:**
- [ ] Logo displays or placeholder
- [ ] Campaign title displays
- [ ] Description truncated appropriately
- [ ] Progress bar accurate
- [ ] Stats display (raised, goal, investors)
- [ ] Click card navigates to detail
- [ ] Hover effects work

---

## 🔌 API Integration Tests

### Test API Endpoints Exist

- [ ] `GET /api/investments/list` - Returns 200
- [ ] `GET /api/investments/verify?session_id=x` - Returns 200
- [ ] `GET /api/recommendations` - Returns 200
- [ ] `POST /api/recommendations` - Returns 200
- [ ] `POST /api/onboarding/investor` - Returns 200
- [ ] `POST /api/onboarding/startup` - Returns 200
- [ ] `GET /api/subscription/checkout?plan=pro` - Redirects to Stripe
- [ ] `GET /api/subscription/portal` - Works
- [ ] `POST /api/subscription/cancel` - Returns 200
- [ ] `GET /api/subscription/verify?session_id=x` - Returns 200

### Test API Error Handling

For each endpoint:
- [ ] Returns proper error code (400, 401, 404, 500)
- [ ] Returns JSON error message
- [ ] Frontend displays user-friendly error
- [ ] Console logs error for debugging

---

## 📱 Responsive Design Tests

### Breakpoints to Test

**Mobile (375px - 767px):**
- [ ] Investment success page
- [ ] Portfolio page
- [ ] Recommendations page
- [ ] Watchlist page
- [ ] Onboarding forms
- [ ] Legal pages
- [ ] Discover page
- [ ] Pricing page

**Tablet (768px - 1023px):**
- [ ] All pages above

**Desktop (1024px+):**
- [ ] All pages above

### What to Check
- [ ] No horizontal scrolling
- [ ] Text readable (not too small)
- [ ] Buttons touch-friendly (min 44x44px)
- [ ] Images scale appropriately
- [ ] Grid layouts adjust correctly
- [ ] Navigation accessible

---

## 🌙 Dark Mode Tests

### Toggle Dark Mode

On each page:
- [ ] Dark mode toggle works
- [ ] Colors invert appropriately
- [ ] Text remains readable
- [ ] Contrast ratios sufficient
- [ ] No flash of unstyled content
- [ ] Images/logos look good
- [ ] Borders visible

---

## ⚡ Performance Tests

### Page Load Times

Use browser DevTools Network tab:
- [ ] Investment success < 1s
- [ ] Portfolio < 2s (with data)
- [ ] Recommendations < 2s
- [ ] Discover < 2s
- [ ] Legal pages < 1s (static)

### Database Queries

Check console for slow queries:
- [ ] Watchlist query < 500ms
- [ ] Portfolio query < 500ms
- [ ] Discover query < 1s

### Image Loading

- [ ] Images lazy load
- [ ] Placeholders show while loading
- [ ] No layout shift when images load

---

## 🔒 Security Tests

### Authentication

- [ ] Can't access `/dashboard/*` without login
- [ ] Can't access investor pages as startup
- [ ] Can't access startup pages as investor
- [ ] Sessions persist after refresh
- [ ] Logout works completely

### Input Validation

- [ ] Form inputs sanitize HTML
- [ ] File uploads reject malicious files
- [ ] SQL injection attempts blocked (Prisma handles)
- [ ] XSS attempts blocked (React handles)

---

## 🐛 Error Scenarios

### Network Errors

- [ ] API timeout → Shows error message
- [ ] 500 error → Shows user-friendly message
- [ ] 404 error → Shows "not found"
- [ ] Network offline → Shows offline message

### Invalid Data

- [ ] Invalid query params → Handled gracefully
- [ ] Missing required data → Shows empty state
- [ ] Corrupted data → Doesn't crash app

---

## ✅ Final Checklist

Before marking testing complete:

- [ ] All P0 issues fixed
- [ ] All P1 issues fixed
- [ ] All pages accessible
- [ ] All buttons navigate correctly
- [ ] All forms validate and submit
- [ ] All API endpoints working
- [ ] All components exist and render
- [ ] No console errors (except known issues)
- [ ] Responsive on all breakpoints
- [ ] Dark mode works everywhere
- [ ] Performance acceptable
- [ ] Security checks pass

---

## 📝 Bug Reporting Template

If you find a bug, report it like this:

```
**Bug ID:** BUG-XXX
**Page:** /dashboard/investor/portfolio
**Priority:** P1 (High)
**Reproducible:** Yes

**Steps to Reproduce:**
1. Log in as investor
2. Navigate to portfolio
3. Click on investment card
4. Observe error

**Expected Result:**
Should navigate to campaign detail page

**Actual Result:**
404 error - page not found

**Console Errors:**
TypeError: Cannot read property 'id' of undefined

**Screenshots:**
[Attach screenshot]

**Browser:** Chrome 118
**OS:** Windows 11
**Screen Size:** 1920x1080
```

---

**Testing Date:** _______________  
**Tester Name:** _______________  
**Build Version:** _______________  
**Status:** [ ] Pass [ ] Fail [ ] Partial
