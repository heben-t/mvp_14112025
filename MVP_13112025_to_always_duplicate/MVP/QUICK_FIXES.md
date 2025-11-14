# Quick Fixes for Critical Issues

## 🔥 Priority 0 Fixes (IMMEDIATE)

### 1. Fix Prisma Import in Subscription Page

**File:** `app\(dashboard)\dashboard\subscription\page.tsx`

**Current (Line 4):**
```typescript
import { prisma } from '@/lib/prisma';
```

**Fix:**
```typescript
import { prisma } from '@/lib/db';
```

---

### 2. Optimize Watchlist Query (N+1 Problem)

**File:** `app\(dashboard)\dashboard\investor\watchlist\page.tsx`

**Current (Lines 11-37):**
```typescript
async function getWatchlist(investorProfileId: string) {
  const watchlist = await prisma.watchlists.findMany({
    where: { investorProfileId: investorProfileId },
    orderBy: { createdAt: 'desc' },
  });

  const watchlistWithCampaigns = await Promise.all(
    watchlist.map(async (item) => {
      const campaign = await prisma.campaigns.findUnique({
        where: { id: item.campaignId },
        include: {
          startup_profiles: {
            select: {
              companyName: true,
              industry: true,
              logo: true,
              stage: true,
            },
          },
        },
      });
      return { ...item, campaign };
    })
  );

  return watchlistWithCampaigns.filter(item => item.campaign !== null);
}
```

**Fix (Single Query):**
```typescript
async function getWatchlist(investorProfileId: string) {
  const watchlist = await prisma.watchlists.findMany({
    where: { investorProfileId },
    include: {
      campaigns: {
        include: {
          startup_profiles: {
            select: {
              companyName: true,
              industry: true,
              logo: true,
              stage: true,
            },
          },
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  return watchlist.filter(item => item.campaigns !== null);
}
```

**Update Schema (if needed):**
```prisma
model watchlists {
  id                String   @id @default(uuid())
  investorProfileId String
  campaignId        String
  createdAt         DateTime @default(now())
  
  investor_profiles investor_profiles @relation(fields: [investorProfileId], references: [id])
  campaigns         campaigns         @relation(fields: [campaignId], references: [id])
  
  @@unique([investorProfileId, campaignId])
}
```

---

### 3. Fix Database Field Names in Discover Page

**File:** `app\(marketing)\discover\page.tsx`

**Current (Lines 25-28):**
```typescript
let query = supabase
  .from('campaigns')
  .select('*, startup_profiles(company_name, industry, stage, logo)', { count: 'exact' })
  .eq('status', 'ACTIVE');
```

**Fix (Check Prisma Schema First):**
```typescript
// If using Prisma-generated Supabase client:
let query = supabase
  .from('campaigns')
  .select(`
    *,
    startup_profiles!inner (
      companyName,
      industry,
      stage,
      logo
    ),
    investments (
      id
    )
  `, { count: 'exact' })
  .eq('status', 'ACTIVE');

// Update line 154 to:
investorCount: campaign.investments?.length || 0,
```

---

## ⚡ Priority 1 Fixes (CRITICAL)

### 4. Add Error Boundary to Investor Investments

**File:** `app\(dashboard)\dashboard\investor\investments\page.tsx`

**Add after imports:**
```typescript
function ErrorState({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <Card>
      <CardContent className="py-12 text-center">
        <AlertCircle className="h-12 w-12 mx-auto mb-4 text-destructive" />
        <p className="text-lg font-medium mb-2">{message}</p>
        <Button onClick={onRetry} variant="outline">
          Try Again
        </Button>
      </CardContent>
    </Card>
  );
}
```

**Update component (add after line 71):**
```typescript
  const [error, setError] = useState<string | null>(null);

  const fetchInvestments = async () => {
    try {
      setError(null);
      const response = await fetch('/api/investments/list');
      if (!response.ok) throw new Error('Failed to fetch investments');
      
      const data = await response.json();
      setInvestments(data.investments);
      setStats(data.stats);
    } catch (error) {
      console.error('Error fetching investments:', error);
      setError('Failed to load investments. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (error) {
    return <ErrorState message={error} onRetry={fetchInvestments} />;
  }
```

**Add import:**
```typescript
import { AlertCircle } from 'lucide-react';
```

---

### 5. Fix Discover Button Route

**File:** `app\(dashboard)\dashboard\investor\investments\page.tsx`

**Current (Line 120):**
```typescript
<Button onClick={() => router.push('/discover')}>
  Discover Startups
</Button>
```

**Fix:**
```typescript
<Button onClick={() => router.push('/discover')}>
  Browse Campaigns
</Button>
```

**OR if /discover doesn't exist:**
```typescript
<Button asChild>
  <Link href="/campaigns">
    Browse Campaigns
  </Link>
</Button>
```

---

### 6. Add Cancel Subscription Handler

**File:** `app\(dashboard)\dashboard\subscription\page.tsx`

**Current (Line 179):**
```typescript
<Button variant="destructive" className="flex-1">
  Cancel Subscription
</Button>
```

**Fix:**
```typescript
'use client';  // ADD THIS at top of file if not present

// Add this function inside component:
const handleCancelSubscription = async () => {
  if (!confirm('Are you sure you want to cancel your subscription? You will lose access to Pro features at the end of your billing period.')) {
    return;
  }

  try {
    const response = await fetch('/api/subscription/cancel', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });

    if (!response.ok) {
      throw new Error('Failed to cancel subscription');
    }

    toast.success('Subscription cancelled successfully');
    window.location.reload(); // Refresh to show updated state
  } catch (error) {
    console.error('Error cancelling subscription:', error);
    toast.error('Failed to cancel subscription. Please try again.');
  }
};

// Update button:
<Button 
  variant="destructive" 
  className="flex-1"
  onClick={handleCancelSubscription}
>
  Cancel Subscription
</Button>
```

**Note:** Need to convert this to a client component. Restructure as:

**New file structure:**
1. Keep `page.tsx` as server component for data fetching
2. Create `subscription-management.tsx` client component for UI with handlers
3. Pass data from server to client component

---

### 7. Add Form Validation to Onboarding Pages

**File:** `app\(dashboard)\onboarding\startup\page.tsx`

**Current (Lines 72-78):**
```typescript
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  if (!formData.companyName || !formData.industry || !formData.stage) {
    toast.error('Please fill in all required fields');
    return;
  }
```

**Fix:**
```typescript
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  // Enhanced validation
  const errors: string[] = [];
  
  if (!formData.companyName?.trim()) {
    errors.push('Company name is required');
  }
  
  if (!formData.industry) {
    errors.push('Industry is required');
  }
  
  if (!formData.stage) {
    errors.push('Current stage is required');
  }
  
  if (formData.website && !formData.website.match(/^https?:\/\/.+/)) {
    errors.push('Website must be a valid URL starting with http:// or https://');
  }
  
  if (errors.length > 0) {
    toast.error(errors.join('\n'), { duration: 5000 });
    return;
  }

  setIsSubmitting(true);
  // ... rest of code
```

---

### 8. Remove Dead Code

**File:** `app\(dashboard)\onboarding\startup\page.tsx`

**Line 5 - Remove:**
```typescript
import { useSession } from 'next-auth/react';  // DELETE THIS LINE
```

**Line 40 - Remove:**
```typescript
const { data: session } = useSession();  // DELETE THIS LINE
```

---

## 🔧 Priority 2 Fixes (HIGH)

### 9. Fix Pagination Links in Discover

**File:** `app\(marketing)\discover\page.tsx`

**Current (Lines 162-175):**
```typescript
<a
  key={pageNum}
  href={`/discover?${new URLSearchParams({
    ...searchParams,
    page: pageNum.toString(),
  })}`}
  className={`px-4 py-2 rounded-lg ${
    pageNum === page
      ? 'bg-primary text-primary-foreground'
      : 'bg-muted hover:bg-muted/80'
  }`}
>
  {pageNum}
</a>
```

**Fix:**
```typescript
import Link from 'next/link';

// Replace with:
<Link
  key={pageNum}
  href={`/discover?${new URLSearchParams({
    ...searchParams,
    page: pageNum.toString(),
  })}`}
  className={`px-4 py-2 rounded-lg ${
    pageNum === page
      ? 'bg-primary text-primary-foreground'
      : 'bg-muted hover:bg-muted/80'
  }`}
>
  {pageNum}
</Link>
```

---

### 10. Add Missing API Response Handling

**File:** `app\(dashboard)\dashboard\investor\recommendations\page.tsx`

**Current (Lines 57-67):**
```typescript
const trackEngagement = async (campaignId: string, action: string) => {
  try {
    await fetch('/api/recommendations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ campaignId, action }),
    });
  } catch (error) {
    console.error('Error tracking engagement:', error);
  }
};
```

**Fix:**
```typescript
const trackEngagement = async (campaignId: string, action: string) => {
  try {
    const response = await fetch('/api/recommendations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ campaignId, action }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error tracking engagement:', error);
    // Don't toast error - tracking failures shouldn't disrupt UX
    // But log to monitoring service in production
    if (process.env.NODE_ENV === 'production') {
      // sendToMonitoring(error);
    }
  }
};
```

---

## 📋 Checklist for Developer

### Immediate Actions (Do First)
- [ ] Fix Prisma import in subscription page
- [ ] Optimize watchlist query
- [ ] Fix database field names in discover
- [ ] Test all changes in development

### Short Term (Next Sprint)
- [ ] Add error boundaries to all client components
- [ ] Implement comprehensive form validation
- [ ] Verify all API endpoints exist
- [ ] Add missing components (CampaignCard, CampaignFilters, etc.)
- [ ] Standardize route names across application

### Testing Required After Fixes
- [ ] Test subscription page loads without errors
- [ ] Test watchlist loads faster (compare query times)
- [ ] Test discover page displays campaigns correctly
- [ ] Test all buttons navigate to correct pages
- [ ] Test form validations prevent invalid submissions

---

## 🚀 Quick Test Commands

```bash
# Check for Prisma import issues
grep -r "from '@/lib/prisma'" app/

# Check for unused imports
npx eslint app/ --ext .ts,.tsx --rule 'no-unused-vars: error'

# Test database queries
npm run prisma studio

# Start dev server and test
npm run dev

# Run type checking
npm run type-check

# Run linting
npm run lint
```

---

## 📞 Support

If you encounter issues while implementing these fixes:
1. Check the full PAGE_TEST_REPORT.md for context
2. Verify database schema matches expectations
3. Test in isolation (one fix at a time)
4. Rollback if issues occur

---

**Last Updated:** November 5, 2025  
**Version:** 1.0  
**Author:** QA Agent
