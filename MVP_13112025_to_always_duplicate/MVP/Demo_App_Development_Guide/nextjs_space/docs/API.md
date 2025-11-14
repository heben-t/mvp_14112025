# HEBED AI - API Documentation

## Base URL
```
Production: https://your-domain.com/api
Development: http://localhost:3000/api
```

## Authentication
All authenticated endpoints require a valid session cookie from NextAuth.

---

## Onboarding APIs

### POST /api/onboarding/startup
Create or update startup profile.

**Request Body:**
```json
{
  "companyName": "string",
  "industry": "string",
  "stage": "string",
  "description": "string",
  "website": "string (optional)",
  "foundedYear": "number",
  "teamSize": "number",
  "location": "string",
  "logo": "string (optional)"
}
```

**Response:**
```json
{
  "success": true,
  "profile": { ... }
}
```

### POST /api/onboarding/investor
Create or update investor profile.

**Request Body:**
```json
{
  "investmentFocus": "string",
  "accreditationStatus": "accredited | non-accredited",
  "accreditationDocument": "string (optional)",
  "linkedinProfile": "string (optional)",
  "bio": "string",
  "preferences": {
    "minROIThreshold": "number",
    "preferredStages": "string",
    "sectorFilters": "string",
    "geographicPreferences": "string (optional)"
  }
}
```

---

## Campaign APIs

### GET /api/campaigns/discover
Discover published campaigns with filters.

**Query Parameters:**
- `page` (number, default: 1)
- `limit` (number, default: 12, max: 100)
- `industry` (string, optional)
- `stage` (string, optional)
- `minAmount` (number, optional)
- `maxAmount` (number, optional)
- `search` (string, optional)

**Response:**
```json
{
  "campaigns": [...],
  "total": "number",
  "page": "number",
  "limit": "number",
  "hasMore": "boolean"
}
```

### GET /api/campaigns/[id]
Get campaign details by ID.

**Response:**
```json
{
  "id": "string",
  "title": "string",
  "description": "string",
  "industry": "string",
  "stage": "string",
  "fundraisingGoal": "number",
  "currentAmount": "number",
  "minInvestment": "number",
  "maxInvestment": "number",
  "equityOffered": "number",
  "deadline": "string",
  "vslUrl": "string",
  "pitchDeck": "string",
  "useOfFunds": "string",
  "risks": "string",
  "teamInfo": "string",
  "status": "string",
  "startupProfile": { ... }
}
```

### POST /api/campaigns/create
Create a new campaign (requires startup profile).

**Request Body:**
```json
{
  "title": "string",
  "description": "string",
  "industry": "string",
  "stage": "string",
  "fundraisingGoal": "number",
  "minInvestment": "number",
  "maxInvestment": "number",
  "equityOffered": "number",
  "deadline": "string",
  "vslUrl": "string (optional)",
  "pitchDeck": "string (optional)",
  "useOfFunds": "string",
  "risks": "string",
  "teamInfo": "string"
}
```

### GET /api/campaigns/[id]/risk
Get AI-powered risk analysis for a campaign.

**Response:**
```json
{
  "riskScore": "number (0-100)",
  "riskLevel": "low | medium | high",
  "factors": ["string"]
}
```

---

## Investment APIs

### POST /api/investments/create
Create a new investment (requires investor profile and subscription).

**Request Body:**
```json
{
  "campaignId": "string",
  "amount": "number"
}
```

**Response:**
```json
{
  "success": true,
  "checkoutUrl": "string"
}
```

### GET /api/investments/list
Get investor's investments with stats.

**Response:**
```json
{
  "investments": [...],
  "stats": {
    "total": "number",
    "pending": "number",
    "accepted": "number",
    "rejected": "number",
    "totalInvested": "number"
  }
}
```

### GET /api/startup/investments
Get startup's received investments.

**Response:**
```json
{
  "investments": [...],
  "stats": {
    "total": "number",
    "pending": "number",
    "accepted": "number",
    "rejected": "number",
    "totalRaised": "number"
  }
}
```

### POST /api/investments/action
Accept or reject an investment (startup only).

**Request Body:**
```json
{
  "investmentId": "string",
  "action": "accept | reject"
}
```

### GET /api/investments/verify
Verify investment payment after Stripe checkout.

**Query Parameters:**
- `session_id` (string, required)

---

## Subscription APIs

### POST /api/subscription/checkout
Create Stripe checkout session for subscription.

**Request Body:**
```json
{
  "planId": "investor_basic | investor_pro | startup"
}
```

**Response:**
```json
{
  "url": "string"
}
```

### GET /api/subscription/verify
Verify subscription after Stripe checkout.

**Query Parameters:**
- `session_id` (string, required)

---

## Recommendation APIs

### GET /api/recommendations
Get AI-powered investment recommendations (investor only).

**Query Parameters:**
- `limit` (number, default: 10)

**Response:**
```json
{
  "recommendations": [
    {
      "campaignId": "string",
      "score": "number (0-100)",
      "reasoning": "string",
      "campaign": { ... }
    }
  ]
}
```

---

## Metrics APIs

### GET /api/metrics/investor
Get investor dashboard metrics.

**Response:**
```json
{
  "summary": {
    "totalInvested": "number",
    "activeInvestments": "number",
    "pendingInvestments": "number",
    "totalInvestments": "number"
  },
  "industryBreakdown": [...],
  "stageBreakdown": [...],
  "investmentTrend": [...]
}
```

### GET /api/metrics/startup
Get startup dashboard metrics.

**Response:**
```json
{
  "summary": {
    "totalRaised": "number",
    "activeCampaigns": "number",
    "totalInvestors": "number",
    "pendingReviews": "number"
  },
  "campaignPerformance": [...],
  "fundingTrend": [...],
  "investorGrowth": [...]
}
```

---

## Webhooks

### POST /api/webhooks/stripe
Stripe webhook handler for payment and subscription events.

**Events Handled:**
- `checkout.session.completed`
- `customer.subscription.updated`
- `customer.subscription.deleted`
- `invoice.payment_failed`

---

## Error Responses

All endpoints may return these error responses:

**400 Bad Request:**
```json
{
  "error": "Validation failed",
  "details": [...]
}
```

**401 Unauthorized:**
```json
{
  "error": "Unauthorized"
}
```

**403 Forbidden:**
```json
{
  "error": "Insufficient permissions"
}
```

**404 Not Found:**
```json
{
  "error": "Resource not found"
}
```

**429 Too Many Requests:**
```json
{
  "error": "Too many requests",
  "message": "Please try again later"
}
```

**500 Internal Server Error:**
```json
{
  "error": "Internal server error"
}
```

---

## Rate Limits

- Standard endpoints: 10 requests per 10 seconds
- Strict endpoints (payments, subscriptions): 5 requests per 60 seconds

Rate limit headers:
- `X-RateLimit-Limit`: Maximum requests allowed
- `X-RateLimit-Remaining`: Remaining requests
- `X-RateLimit-Reset`: Unix timestamp when limit resets

---

## Caching

Campaign discovery and recommendations are cached for 5 minutes.
To bypass cache, contact support for cache invalidation.
