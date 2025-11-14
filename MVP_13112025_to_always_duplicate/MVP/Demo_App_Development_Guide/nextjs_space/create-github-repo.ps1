# PowerShell script to create GitHub repo 'mvp' with main and test branches

Write-Host "🚀 Creating GitHub repository 'mvp'..." -ForegroundColor Cyan
Write-Host ""

# Step 1: Create private repository
Write-Host "Step 1: Creating private repository..." -ForegroundColor Yellow
gh repo create mvp --private --description "HEBED AI MVP - Startup/Investor Marketplace Platform"

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to create repository. Make sure GitHub CLI is installed and authenticated." -ForegroundColor Red
    Write-Host "Install: winget install --id GitHub.cli" -ForegroundColor Yellow
    Write-Host "Authenticate: gh auth login" -ForegroundColor Yellow
    exit 1
}

# Step 2: Navigate to project directory
$projectPath = "C:\Users\edwar\Downloads\MVP\Demo_App_Development_Guide\ai_roi_dashboard\nextjs_space"
Set-Location $projectPath

# Step 3: Initialize git if not already initialized
if (-not (Test-Path .git)) {
    Write-Host "Step 2: Initializing git repository..." -ForegroundColor Yellow
    git init
}

# Step 4: Set main as default branch
Write-Host "Step 3: Setting up main branch..." -ForegroundColor Yellow
git branch -M main

# Step 5: Get GitHub username
Write-Host "Step 4: Getting GitHub username..." -ForegroundColor Yellow
$githubUsername = gh api user -q .login

# Step 6: Add remote origin (remove if exists)
Write-Host "Step 5: Adding remote origin..." -ForegroundColor Yellow
git remote remove origin 2>$null
git remote add origin "https://github.com/$githubUsername/mvp.git"

# Step 7: Create .gitignore if it doesn't exist
if (-not (Test-Path .gitignore)) {
    Write-Host "Step 6: Creating .gitignore..." -ForegroundColor Yellow
    @"
# Dependencies
node_modules/
.pnp
.pnp.js

# Testing
coverage/

# Next.js
.next/
out/
build/
dist/

# Production
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Environment variables
.env
.env.local
.env.development.local
.env.test.local
.env.production.local

# IDE
.vscode/
.idea/
*.swp
*.swo
*~

# OS
.DS_Store
Thumbs.db

# Prisma
prisma/*.db
prisma/*.db-journal

# TypeScript
*.tsbuildinfo

# Debug
debug.log

# Temporary files
tmp/
temp/
*.tmp

# Uploads
uploads/
Uploads/

# Scripts (optional - keep setup scripts)
# *.sh
# *.ps1
"@ | Out-File -FilePath .gitignore -Encoding utf8
}

# Step 8: Stage all files
Write-Host "Step 7: Staging files..." -ForegroundColor Yellow
git add .

# Step 9: Create initial commit
Write-Host "Step 8: Creating initial commit..." -ForegroundColor Yellow
git commit -m @"
Initial commit: HEBED AI MVP with Supabase Auth

Features:
- Google OAuth authentication
- Email/password authentication  
- Role-based routing (Startup/Investor)
- Onboarding flows
- Dashboard pages
- API routes with Supabase Auth
- Database setup scripts
- Comprehensive documentation
"@

# Step 10: Push to main branch
Write-Host "Step 9: Pushing to main branch..." -ForegroundColor Yellow
git push -u origin main

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to push to main. Check your authentication." -ForegroundColor Red
    exit 1
}

# Step 11: Create test branch
Write-Host "Step 10: Creating test branch..." -ForegroundColor Yellow
git checkout -b test
git push -u origin test

# Step 12: Switch back to main
git checkout main

Write-Host ""
Write-Host "✅ Repository setup complete!" -ForegroundColor Green
Write-Host ""
Write-Host "Repository: https://github.com/$githubUsername/mvp" -ForegroundColor Cyan
Write-Host "Branches created:" -ForegroundColor Yellow
Write-Host "  - main (default)" -ForegroundColor White
Write-Host "  - test" -ForegroundColor White
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "  1. Add collaborators if needed" -ForegroundColor White
Write-Host "  2. Configure branch protection rules" -ForegroundColor White
Write-Host "  3. Set up GitHub Actions workflows" -ForegroundColor White
Write-Host ""
