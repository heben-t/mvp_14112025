# HEBED AI - Startup Investment Platform

A comprehensive Next.js platform connecting startups with investors through AI-powered matching, secure payments, and data-driven insights.

## 🚀 Features

### For Investors
- **AI-Powered Recommendations**: Get personalized startup matches based on your preferences
- **Campaign Discovery**: Browse and filter investment opportunities
- **Portfolio Management**: Track investments and performance metrics
- **Risk Analysis**: AI-driven risk assessment for each campaign
- **Subscription Tiers**: Basic ($49/mo) and Pro ($149/mo) plans

### For Startups
- **Campaign Creation**: Create compelling fundraising campaigns with VSL and pitch decks
- **Investment Management**: Review and accept/reject investment offers
- **Analytics Dashboard**: Track funding progress and investor engagement
- **Investor Matching**: Get discovered by relevant investors
- **Subscription**: $299/mo for unlimited campaigns and features

### Platform Features
- **Secure Payments**: Stripe-powered payment processing with escrow
- **Email Notifications**: Automated updates for investments and subscriptions
- **Rate Limiting**: Protection against abuse with Upstash Redis
- **Error Tracking**: Comprehensive monitoring with Sentry
- **Caching**: Optimized performance with Redis caching
- **Input Validation**: Comprehensive security and data validation

## 🛠 Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: NextAuth.js
- **Payments**: Stripe
- **Storage**: Supabase Storage
- **Email**: Resend
- **AI**: OpenAI GPT-4
- **Caching**: Upstash Redis
- **Error Tracking**: Sentry
- **UI**: Tailwind CSS + shadcn/ui
- **Deployment**: Vercel

## 📋 Prerequisites

- Node.js 18+ and npm
- PostgreSQL database
- Stripe account
- Supabase account
- OpenAI API key
- Resend account
- Upstash Redis (optional)
- Sentry account (optional)

## 🚀 Quick Start

### 1. Clone and Install

```bash
git clone <repository-url>
cd nextjs_space
npm install
```

### 2. Environment Setup

Create `.env.local` file:

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/hebed_ai"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key"

# Supabase
NEXT_PUBLIC_SUPABASE_URL="https://your-project.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-key"
SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"

# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_..."
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."

# OpenAI
OPENAI_API_KEY="sk-..."

# Resend
RESEND_API_KEY="re_..."
RESEND_FROM_EMAIL="noreply@yourdomain.com"

# Sentry (optional)
NEXT_PUBLIC_SENTRY_DSN="https://...@sentry.io/..."

# Upstash Redis (optional)
UPSTASH_REDIS_REST_URL="https://..."
UPSTASH_REDIS_REST_TOKEN="..."
```

See [docs/SETUP.md](docs/SETUP.md) for detailed setup instructions.

### 3. Database Setup

```bash
npx prisma migrate dev
npx prisma generate
```

### 4. Run Development Server

```bash
npm run dev
```

Visit http://localhost:3000

## 📚 Documentation

- **[API Documentation](docs/API.md)**: Complete API reference
- **[User Guide](docs/USER_GUIDE.md)**: Platform usage guide
- **[Setup Guide](docs/SETUP.md)**: Detailed environment setup

## 🏗 Project Structure

```
nextjs_space/
├── app/                          # Next.js app router
│   ├── (auth)/                   # Authentication pages
│   ├── (dashboard)/              # Dashboard pages
│   ├── (marketing)/              # Marketing pages
│   └── api/                      # API routes
├── components/                   # React components
│   ├── ui/                       # shadcn/ui components
│   └── ...                       # Feature components
├── lib/                          # Utilities and services
│   ├── ai-matching.ts            # AI recommendation engine
│   ├── cache.ts                  # Redis caching
│   ├── db.ts                     # Prisma client
│   ├── email.ts                  # Email service
│   ├── error-tracking.ts         # Sentry integration
│   ├── rate-limit.ts             # Rate limiting
│   ├── security.ts               # Security utilities
│   ├── stripe.ts                 # Stripe integration
│   ├── supabase.ts               # Supabase client
│   └── validation.ts             # Input validation
├── prisma/                       # Database schema
├── docs/                         # Documentation
└── public/                       # Static assets
```

## 🔑 Key Features Implementation

### Authentication & Authorization
- NextAuth.js with role-based access control
- Separate flows for investors and startups
- Session management and protected routes

### Payment Processing
- Stripe Checkout for subscriptions and investments
- Webhook handling for payment events
- Automatic refunds for rejected investments
- Escrow system for investment funds

### AI Matching
- OpenAI-powered investor recommendations
- Campaign risk analysis
- Preference-based matching algorithm

### Performance
- Redis caching for frequently accessed data
- Optimized database queries with Prisma
- Image optimization with Next.js Image

### Security
- Input validation with Zod schemas
- Rate limiting on all endpoints
- SQL injection prevention
- XSS protection
- CSRF protection

### Monitoring
- Sentry error tracking
- Performance monitoring
- User feedback collection

## 🧪 Testing

```bash
# Run tests
npm test

# Run linter
npm run lint

# Type check
npm run type-check
```

## 🚢 Deployment

### Vercel (Recommended)

1. Push to GitHub
2. Import project in Vercel
3. Add environment variables
4. Deploy

### Docker

```bash
docker build -t hebed-ai .
docker run -p 3000:3000 hebed-ai
```

### Manual

```bash
npm run build
npm start
```

## 📊 Database Schema

Key models:
- **User**: Authentication and profile
- **InvestorProfile**: Investor-specific data
- **StartupProfile**: Startup-specific data
- **Campaign**: Fundraising campaigns
- **Investment**: Investment transactions
- **Subscription**: User subscriptions

See `prisma/schema.prisma` for complete schema.

## 🔐 Security

- All API endpoints protected with authentication
- Rate limiting on sensitive endpoints
- Input validation on all user inputs
- Secure file uploads with type/size validation
- Environment variables for sensitive data
- HTTPS required in production

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📝 License

This project is proprietary and confidential.

## 🆘 Support

- **Email**: support@hebed.ai
- **Documentation**: See `/docs` folder
- **Issues**: Create GitHub issue

## 🗺 Roadmap

- [ ] Mobile app (React Native)
- [ ] Advanced analytics dashboard
- [ ] Secondary market for investments
- [ ] International expansion
- [ ] Multi-currency support
- [ ] Video KYC verification
- [ ] Social features and networking
- [ ] API for third-party integrations

## 📈 Performance

- **Caching**: 5-minute cache for campaign discovery
- **Rate Limits**: 10 req/10s standard, 5 req/60s strict
- **Database**: Optimized queries with indexes
- **CDN**: Static assets served via Vercel Edge Network

## 🔧 Environment Variables

Required:
- `DATABASE_URL`
- `NEXTAUTH_URL`
- `NEXTAUTH_SECRET`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `OPENAI_API_KEY`
- `RESEND_API_KEY`
- `RESEND_FROM_EMAIL`

Optional:
- `NEXT_PUBLIC_SENTRY_DSN`
- `UPSTASH_REDIS_REST_URL`
- `UPSTASH_REDIS_REST_TOKEN`

See [docs/SETUP.md](docs/SETUP.md) for details.

---

**Built with ❤️ for the startup ecosystem**
