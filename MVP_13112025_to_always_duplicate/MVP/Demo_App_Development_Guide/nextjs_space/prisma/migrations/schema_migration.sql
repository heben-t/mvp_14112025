-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('STARTUP', 'INVESTOR', 'ADMIN');

-- CreateEnum
CREATE TYPE "VerificationStatus" AS ENUM ('PENDING', 'VERIFIED', 'REJECTED');

-- CreateEnum
CREATE TYPE "InvestmentStatus" AS ENUM ('PENDING', 'ACCEPTED', 'REJECTED', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "SubscriptionTier" AS ENUM ('STARTUP_BASIC', 'INVESTOR_BASIC');

-- CreateEnum
CREATE TYPE "DataVerificationLevel" AS ENUM ('VERIFIED', 'PARTIALLY_VERIFIED', 'SELF_REPORTED');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" "UserRole" NOT NULL,
    "name" TEXT,
    "emailVerified" TIMESTAMP(3),
    "image" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "accounts" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" TEXT,
    "session_state" TEXT,

    CONSTRAINT "accounts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sessions" (
    "id" TEXT NOT NULL,
    "sessionToken" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "verification_tokens" (
    "identifier" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL
);

-- CreateTable
CREATE TABLE "startup_profiles" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "companyName" TEXT NOT NULL,
    "logo" TEXT,
    "industry" TEXT NOT NULL,
    "stage" TEXT NOT NULL,
    "description" TEXT,
    "website" TEXT,
    "kycStatus" "VerificationStatus" NOT NULL DEFAULT 'PENDING',
    "businessLicense" TEXT,
    "founderIdDocument" TEXT,
    "profileCompletionScore" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "startup_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "investor_profiles" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "professionalTitle" TEXT,
    "investmentFocus" TEXT,
    "ticketSize" TEXT,
    "accreditationStatus" "VerificationStatus" NOT NULL DEFAULT 'PENDING',
    "accreditationDocument" TEXT,
    "stripeCustomerId" TEXT,
    "stripeAccountId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "investor_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "investor_preferences" (
    "id" TEXT NOT NULL,
    "investorProfileId" TEXT NOT NULL,
    "minROIThreshold" DOUBLE PRECISION,
    "preferredStages" TEXT,
    "sectorFilters" TEXT,
    "geographicPreferences" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "investor_preferences_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "subscriptions" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "tier" "SubscriptionTier" NOT NULL,
    "stripeSubscriptionId" TEXT,
    "stripeCustomerId" TEXT,
    "stripePriceId" TEXT,
    "stripeCurrentPeriodEnd" TIMESTAMP(3),
    "currentPeriodEnd" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'active',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "subscriptions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "campaigns" (
    "id" TEXT NOT NULL,
    "startupProfileId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "vslUrl" TEXT,
    "pitchDeck" TEXT,
    "fundraisingGoal" DOUBLE PRECISION NOT NULL,
    "currentRaised" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "equityOffered" DOUBLE PRECISION NOT NULL,
    "valuation" DOUBLE PRECISION NOT NULL,
    "minInvestment" DOUBLE PRECISION NOT NULL DEFAULT 1000,
    "maxInvestment" DOUBLE PRECISION,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "publishedAt" TIMESTAMP(3),
    "viewCount" INTEGER NOT NULL DEFAULT 0,
    "interestedInvestors" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "campaigns_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "investments" (
    "id" TEXT NOT NULL,
    "campaignId" TEXT NOT NULL,
    "investorProfileId" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "status" "InvestmentStatus" NOT NULL DEFAULT 'PENDING',
    "stripePaymentIntentId" TEXT,
    "escrowReleased" BOOLEAN NOT NULL DEFAULT false,
    "acceptedAt" TIMESTAMP(3),
    "rejectedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "investments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "watchlists" (
    "id" TEXT NOT NULL,
    "investorProfileId" TEXT NOT NULL,
    "campaignId" TEXT NOT NULL,
    "alertOnMetricChange" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "watchlists_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "startup_metrics" (
    "id" TEXT NOT NULL,
    "startupProfileId" TEXT,
    "name" TEXT NOT NULL,
    "verificationLevel" "DataVerificationLevel" NOT NULL DEFAULT 'SELF_REPORTED',
    "lastSyncedAt" TIMESTAMP(3),
    "dataSource" TEXT,
    "currentROI" DOUBLE PRECISION NOT NULL,
    "roiTrend" DOUBLE PRECISION NOT NULL,
    "costSavings" DOUBLE PRECISION NOT NULL,
    "laborCostReduction" DOUBLE PRECISION NOT NULL,
    "errorReduction" DOUBLE PRECISION NOT NULL,
    "processOptimization" DOUBLE PRECISION NOT NULL,
    "hoursSaved" DOUBLE PRECISION NOT NULL,
    "employeesFreed" DOUBLE PRECISION NOT NULL,
    "adoptionRate" DOUBLE PRECISION NOT NULL,
    "activeUsers" INTEGER NOT NULL,
    "totalUsers" INTEGER NOT NULL,
    "aiInteractions" INTEGER NOT NULL,
    "fallbackRate" DOUBLE PRECISION NOT NULL,
    "processingSpeed" DOUBLE PRECISION NOT NULL,
    "accuracy" DOUBLE PRECISION NOT NULL,
    "costPerOperation" DOUBLE PRECISION NOT NULL,
    "uptime" DOUBLE PRECISION NOT NULL,
    "valuationImpact" DOUBLE PRECISION NOT NULL,
    "forecastedROI" DOUBLE PRECISION NOT NULL,
    "forecastedSavings" DOUBLE PRECISION NOT NULL,
    "forecastedHires" INTEGER NOT NULL,
    "mrr" DOUBLE PRECISION,
    "arr" DOUBLE PRECISION,
    "cac" DOUBLE PRECISION,
    "ltv" DOUBLE PRECISION,
    "churnRate" DOUBLE PRECISION,
    "burnRate" DOUBLE PRECISION,
    "runway" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "startup_metrics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "portfolio_companies" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "roi" DOUBLE PRECISION NOT NULL,
    "adoptionRate" DOUBLE PRECISION NOT NULL,
    "efficiency" INTEGER NOT NULL,
    "trend" TEXT NOT NULL,
    "trendValue" INTEGER NOT NULL,
    "category" TEXT NOT NULL,
    "investment" DOUBLE PRECISION NOT NULL,
    "currentValue" DOUBLE PRECISION NOT NULL,
    "multiple" DOUBLE PRECISION NOT NULL,
    "status" TEXT NOT NULL,
    "aiImplementation" TEXT NOT NULL,
    "riskLevel" TEXT NOT NULL,
    "burnRate" DOUBLE PRECISION NOT NULL,
    "aiSavings" DOUBLE PRECISION NOT NULL,
    "technicalScore" INTEGER NOT NULL,
    "successProbability" DOUBLE PRECISION NOT NULL,
    "seriesStage" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "portfolio_companies_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "time_series_data" (
    "id" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "metricName" TEXT NOT NULL,
    "value" DOUBLE PRECISION NOT NULL,
    "week" INTEGER NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "time_series_data_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "operations" (
    "id" TEXT NOT NULL,
    "startupId" TEXT,
    "name" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "timeBefore" DOUBLE PRECISION NOT NULL,
    "timeAfter" DOUBLE PRECISION NOT NULL,
    "costBefore" DOUBLE PRECISION NOT NULL,
    "costAfter" DOUBLE PRECISION NOT NULL,
    "csatBefore" DOUBLE PRECISION NOT NULL,
    "csatAfter" DOUBLE PRECISION NOT NULL,
    "volumeBefore" INTEGER NOT NULL,
    "volumeAfter" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "operations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "alerts" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "severity" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "actionRequired" BOOLEAN NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "resolved" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "alerts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "benchmarks" (
    "id" TEXT NOT NULL,
    "companyId" TEXT,
    "category" TEXT NOT NULL,
    "portfolioValue" DOUBLE PRECISION NOT NULL,
    "gccAverage" DOUBLE PRECISION NOT NULL,
    "globalTop10" DOUBLE PRECISION NOT NULL,
    "metricType" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "benchmarks_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "accounts_provider_providerAccountId_key" ON "accounts"("provider", "providerAccountId");

-- CreateIndex
CREATE UNIQUE INDEX "sessions_sessionToken_key" ON "sessions"("sessionToken");

-- CreateIndex
CREATE UNIQUE INDEX "verification_tokens_token_key" ON "verification_tokens"("token");

-- CreateIndex
CREATE UNIQUE INDEX "verification_tokens_identifier_token_key" ON "verification_tokens"("identifier", "token");

-- CreateIndex
CREATE UNIQUE INDEX "startup_profiles_userId_key" ON "startup_profiles"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "investor_profiles_userId_key" ON "investor_profiles"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "investor_preferences_investorProfileId_key" ON "investor_preferences"("investorProfileId");

-- CreateIndex
CREATE UNIQUE INDEX "subscriptions_userId_key" ON "subscriptions"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "watchlists_investorProfileId_campaignId_key" ON "watchlists"("investorProfileId", "campaignId");

-- AddForeignKey
ALTER TABLE "accounts" ADD CONSTRAINT "accounts_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "startup_profiles" ADD CONSTRAINT "startup_profiles_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "investor_profiles" ADD CONSTRAINT "investor_profiles_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "investor_preferences" ADD CONSTRAINT "investor_preferences_investorProfileId_fkey" FOREIGN KEY ("investorProfileId") REFERENCES "investor_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "campaigns" ADD CONSTRAINT "campaigns_startupProfileId_fkey" FOREIGN KEY ("startupProfileId") REFERENCES "startup_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "investments" ADD CONSTRAINT "investments_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "campaigns"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "investments" ADD CONSTRAINT "investments_investorProfileId_fkey" FOREIGN KEY ("investorProfileId") REFERENCES "investor_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "watchlists" ADD CONSTRAINT "watchlists_investorProfileId_fkey" FOREIGN KEY ("investorProfileId") REFERENCES "investor_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "startup_metrics" ADD CONSTRAINT "startup_metrics_startupProfileId_fkey" FOREIGN KEY ("startupProfileId") REFERENCES "startup_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "alerts" ADD CONSTRAINT "alerts_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "portfolio_companies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "benchmarks" ADD CONSTRAINT "benchmarks_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "portfolio_companies"("id") ON DELETE SET NULL ON UPDATE CASCADE;
