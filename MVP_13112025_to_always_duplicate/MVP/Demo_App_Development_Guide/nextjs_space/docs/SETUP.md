# Environment Setup Guide

## Required Environment Variables

Create a `.env.local` file in the root directory with the following variables:

### Database
```env
DATABASE_URL="postgresql://user:password@localhost:5432/hebed_ai"
```

### NextAuth
```env
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-here"
```
Generate secret: `openssl rand -base64 32`

### Supabase
```env
NEXT_PUBLIC_SUPABASE_URL="https://your-project.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-key"
SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"
```

### Stripe
```env
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_..."
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
```

### OpenAI
```env
OPENAI_API_KEY="sk-..."
```

### Resend (Email)
```env
RESEND_API_KEY="re_..."
RESEND_FROM_EMAIL="noreply@yourdomain.com"
```

### Sentry (Error Tracking)
```env
NEXT_PUBLIC_SENTRY_DSN="https://...@sentry.io/..."
```

### Upstash Redis (Rate Limiting & Caching)
```env
UPSTASH_REDIS_REST_URL="https://..."
UPSTASH_REDIS_REST_TOKEN="..."
```

---

## Setup Instructions

### 1. Database Setup (PostgreSQL)

**Option A: Local PostgreSQL**
```bash
# Install PostgreSQL
brew install postgresql  # macOS
sudo apt-get install postgresql  # Ubuntu

# Start PostgreSQL
brew services start postgresql  # macOS
sudo service postgresql start  # Ubuntu

# Create database
createdb hebed_ai

# Update DATABASE_URL in .env.local
DATABASE_URL="postgresql://localhost:5432/hebed_ai"
```

**Option B: Supabase Database**
1. Create project at https://supabase.com
2. Go to Settings > Database
3. Copy connection string
4. Update DATABASE_URL in .env.local

**Run Migrations:**
```bash
npx prisma migrate dev
npx prisma generate
```

### 2. Supabase Storage Setup

1. Create project at https://supabase.com
2. Go to Storage > Create bucket
3. Create buckets:
   - `logos` (public)
   - `pitch-decks` (private)
   - `accreditation-docs` (private)
4. Set bucket policies:
   - Public: Allow read access
   - Private: Authenticated users only
5. Copy project URL and keys to .env.local

### 3. Stripe Setup

1. Create account at https://stripe.com
2. Get API keys from Dashboard > Developers > API keys
3. Create products:
   - Investor Basic: $49/month
   - Investor Pro: $149/month
   - Startup: $299/month
4. Set up webhook:
   - URL: `https://yourdomain.com/api/webhooks/stripe`
   - Events: `checkout.session.completed`, `customer.subscription.*`, `invoice.payment_failed`
5. Copy webhook secret to .env.local

**Local Testing:**
```bash
# Install Stripe CLI
brew install stripe/stripe-cli/stripe

# Login
stripe login

# Forward webhooks
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

### 4. OpenAI Setup

1. Create account at https://platform.openai.com
2. Go to API keys
3. Create new secret key
4. Copy to .env.local
5. Add credits to account

### 5. Resend Setup

1. Create account at https://resend.com
2. Verify your domain
3. Get API key from Dashboard
4. Copy to .env.local
5. Update RESEND_FROM_EMAIL with verified domain

### 6. Sentry Setup

1. Create account at https://sentry.io
2. Create new project (Next.js)
3. Copy DSN
4. Add to .env.local

**Optional: Source Maps**
```bash
# Add to package.json scripts
"sentry:sourcemaps": "sentry-cli sourcemaps upload --org your-org --project your-project .next"
```

### 7. Upstash Redis Setup

1. Create account at https://upstash.com
2. Create Redis database
3. Copy REST URL and token
4. Add to .env.local

**Optional: Local Redis**
```bash
# Install Redis
brew install redis  # macOS
sudo apt-get install redis  # Ubuntu

# Start Redis
redis-server

# Skip Upstash variables for local development
```

---

## Development Setup

### Install Dependencies
```bash
npm install
```

### Run Development Server
```bash
npm run dev
```

### Build for Production
```bash
npm run build
npm start
```

### Database Commands
```bash
# Create migration
npx prisma migrate dev --name migration_name

# Reset database
npx prisma migrate reset

# Open Prisma Studio
npx prisma studio

# Generate Prisma Client
npx prisma generate
```

---

## Testing

### Run Tests
```bash
npm test
```

### Run Linter
```bash
npm run lint
```

### Type Check
```bash
npm run type-check
```

---

## Deployment

### Vercel (Recommended)

1. Push code to GitHub
2. Import project in Vercel
3. Add environment variables
4. Deploy

**Environment Variables:**
- Add all .env.local variables to Vercel
- Update NEXTAUTH_URL to production URL
- Update Stripe webhook URL

### Docker

```dockerfile
# Dockerfile included in project
docker build -t hebed-ai .
docker run -p 3000:3000 hebed-ai
```

### Manual Deployment

```bash
# Build
npm run build

# Start
npm start
```

---

## Troubleshooting

### Database Connection Issues
```bash
# Check connection
npx prisma db pull

# Reset and migrate
npx prisma migrate reset
npx prisma migrate dev
```

### Stripe Webhook Issues
- Verify webhook secret matches
- Check webhook endpoint is accessible
- Use Stripe CLI for local testing

### Supabase Storage Issues
- Verify bucket policies
- Check CORS settings
- Ensure service role key is correct

### OpenAI Rate Limits
- Check account credits
- Implement request queuing
- Use caching for repeated requests

### Redis Connection Issues
- Verify Upstash credentials
- Check network connectivity
- Use local Redis for development

---

## Security Checklist

- [ ] All environment variables set
- [ ] Database credentials secure
- [ ] Stripe webhook secret configured
- [ ] NEXTAUTH_SECRET is random and secure
- [ ] Supabase RLS policies enabled
- [ ] Rate limiting configured
- [ ] Sentry error tracking active
- [ ] CORS properly configured
- [ ] Input validation on all endpoints
- [ ] SQL injection prevention
- [ ] XSS protection enabled

---

## Performance Optimization

### Caching Strategy
- Campaign discovery: 5 minutes
- Recommendations: 5 minutes
- Metrics: 2 minutes

### Database Optimization
```bash
# Add indexes
npx prisma migrate dev --name add_indexes
```

### Image Optimization
- Use Next.js Image component
- Compress images before upload
- Use WebP format when possible

---

## Monitoring

### Sentry
- Error tracking
- Performance monitoring
- User feedback

### Vercel Analytics
- Page views
- Performance metrics
- User behavior

### Stripe Dashboard
- Payment tracking
- Subscription metrics
- Revenue analytics

---

## Support

For setup issues:
- Check documentation
- Review error logs
- Contact support@hebed.ai
