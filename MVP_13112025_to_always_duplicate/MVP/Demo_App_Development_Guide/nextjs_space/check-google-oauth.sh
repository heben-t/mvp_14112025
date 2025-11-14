#!/bin/bash

# Google OAuth Setup Verification Script
# Run this to check if your Google OAuth is configured correctly

echo "🔍 Checking Google OAuth Configuration..."
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check 1: Environment Variables
echo "1️⃣  Checking Environment Variables..."
if grep -q "SUPABASE_AUTH_EXTERNAL_GOOGLE_CLIENT_ID" .env.local 2>/dev/null; then
    echo -e "   ${GREEN}✓${NC} Google Client ID found in .env.local"
else
    echo -e "   ${YELLOW}⚠${NC}  Google Client ID NOT found in .env.local (not critical)"
fi

if grep -q "NEXT_PUBLIC_SUPABASE_URL" .env.local 2>/dev/null; then
    echo -e "   ${GREEN}✓${NC} Supabase URL found"
else
    echo -e "   ${RED}✗${NC} Supabase URL missing!"
fi
echo ""

# Check 2: Supabase Configuration
echo "2️⃣  Supabase Dashboard Configuration Needed:"
echo "   ${YELLOW}→${NC} Go to: https://app.supabase.com/project/gnzcvhyxiatcjofywkdq/auth/providers"
echo "   ${YELLOW}→${NC} Enable: Google provider"
echo "   ${YELLOW}→${NC} Add Client ID: 827886733055-tbn7nm5k2j6ktiou29rki9j6rk911ata.apps.googleusercontent.com"
echo "   ${YELLOW}→${NC} Add Client Secret: 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"
echo "   ${YELLOW}→${NC} Click: Save"
echo ""

# Check 3: Google Console Configuration
echo "3️⃣  Google Cloud Console Configuration Needed:"
echo "   ${YELLOW}→${NC} Go to: https://console.cloud.google.com/apis/credentials"
echo "   ${YELLOW}→${NC} Find OAuth 2.0 Client ID: 827886733055-tbn7nm5k2j6ktiou29rki9j6rk911ata"
echo "   ${YELLOW}→${NC} Add to Authorized redirect URIs:"
echo "      • https://gnzcvhyxiatcjofywkdq.supabase.co/auth/v1/callback"
echo "      • http://localhost:3000/auth/callback"
echo "   ${YELLOW}→${NC} Click: Save"
echo ""

# Check 4: Callback Route
echo "4️⃣  Checking Callback Route..."
if [ -f "app/auth/callback/route.ts" ]; then
    echo -e "   ${GREEN}✓${NC} Callback route exists"
    if grep -q "exchangeCodeForSession" app/auth/callback/route.ts; then
        echo -e "   ${GREEN}✓${NC} Code exchange implemented"
    else
        echo -e "   ${RED}✗${NC} Code exchange missing!"
    fi
else
    echo -e "   ${RED}✗${NC} Callback route not found!"
fi
echo ""

# Summary
echo "═══════════════════════════════════════════════════════════"
echo "📋 NEXT STEPS:"
echo "═══════════════════════════════════════════════════════════"
echo ""
echo "1. ${YELLOW}Configure Supabase Dashboard${NC}"
echo "   • https://app.supabase.com/project/gnzcvhyxiatcjofywkdq/auth/providers"
echo "   • Enable Google and add credentials"
echo ""
echo "2. ${YELLOW}Configure Google Cloud Console${NC}"
echo "   • https://console.cloud.google.com/apis/credentials"
echo "   • Add Supabase callback URL"
echo ""
echo "3. ${YELLOW}Test Google OAuth${NC}"
echo "   • Clear browser cache"
echo "   • Go to /auth/signup"
echo "   • Click 'Continue with Google'"
echo ""
echo "4. ${YELLOW}Check for errors${NC}"
echo "   • Browser console (F12)"
echo "   • Network tab"
echo "   • Supabase logs"
echo ""
echo "═══════════════════════════════════════════════════════════"
