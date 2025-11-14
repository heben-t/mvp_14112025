# Quick Start Guide - ROI Dynamic Data

## What Was Done

Connected Supabase `startup_metrics` table to display real `Consolidated_AI_Impact` and `AI_Impact_Startup_i` values across all pages with automatic 30-second updates.

## Quick Test

### 1. Start Dev Server
```bash
cd "C:\Users\edwar\Downloads\MVP\Demo_App_Development_Guide\ai_roi_dashboard\nextjs_space"
npm run dev
```

### 2. Test API
```bash
node test-metrics-api.js YOUR_STARTUP_PROFILE_ID
```

### 3. Visit Pages
- `http://localhost:3000/dashboard` - Check Avg. ROI card
- `http://localhost:3000/roi/YOUR_CAMPAIGN_ID` - Check overall ROI score
- `http://localhost:3000/campaigns/YOUR_CAMPAIGN_ID` - Check ROI badge
- `http://localhost:3000/discover` - Check all campaign ROI values

## Files Changed

✅ Created:
1. `app/api/metrics/[startupProfileId]/route.ts` - API endpoint
2. `hooks/use-metrics.ts` - React hook for polling
3. `components/roi-display.tsx` - Display component
4. `test-metrics-api.js` - Test script

✅ Modified:
1. `components/dashboard/investor-dashboard.tsx` - Dynamic avg ROI
2. `app/roi/[campaignId]/page.tsx` - Database metrics
3. `app/campaigns/[id]/page.tsx` - Dynamic ROI calc
4. `app/discover/page.tsx` - Real metrics display

## What Each Metric Does

### Consolidated_AI_Impact
- **Used for**: Overall ROI score (main percentage)
- **Displayed on**: 
  - Investor Dashboard (average of portfolio)
  - ROI Analysis Page (primary score)
  - Campaign Detail Page (ROI badge)
  - Discover Page (campaign cards)

### AI_Impact_Startup_i
- **Used for**: Technology ROI component score
- **Displayed on**:
  - ROI Analysis Page (Tech section)
  - Fallback when Consolidated_AI_Impact is null

## Key Features

✅ Real-time updates every 30 seconds
✅ No page refresh needed
✅ Automatic fallback to calculated values
✅ Type-safe TypeScript
✅ Loading states for better UX
✅ Error handling

## Database Query Example

```sql
-- Check current metrics
SELECT 
  sp.companyName,
  sm.Consolidated_AI_Impact,
  sm.AI_Impact_Startup_i,
  sm.created_at
FROM startup_metrics sm
JOIN startup_profiles sp ON sp.id = sm.startup_profile_id
ORDER BY sm.created_at DESC;
```

## Troubleshooting

**API returns null values?**
- Check if startup has metrics in database
- Verify `startup_profile_id` is correct
- Check database connection

**Values not updating?**
- Check browser console for errors
- Verify polling is working (30-second interval)
- Try refreshing the page manually

**TypeScript errors?**
- Run `npx prisma generate` to update client
- Restart dev server

## Next Steps

1. Test with real data from database
2. Verify calculations are accurate
3. Test on staging environment
4. Deploy to production

## Support

See full documentation in:
- `ROI_IMPLEMENTATION_COMPLETE.md`
- `ROI_DYNAMIC_DATA_IMPLEMENTATION.md`
