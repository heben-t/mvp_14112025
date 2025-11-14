#!/bin/bash
# Script to create GitHub repo 'mvp' with main and test branches

echo "🚀 Creating GitHub repository 'mvp'..."
echo ""

# Step 1: Create private repository
echo "Step 1: Creating private repository..."
gh repo create mvp --private --description "HEBED AI MVP - Startup/Investor Marketplace Platform"

# Step 2: Navigate to project directory
cd "C:/Users/edwar/Downloads/MVP/Demo_App_Development_Guide/ai_roi_dashboard/nextjs_space"

# Step 3: Initialize git if not already initialized
if [ ! -d .git ]; then
    echo "Step 2: Initializing git repository..."
    git init
fi

# Step 4: Set main as default branch
echo "Step 3: Setting up main branch..."
git branch -M main

# Step 5: Add remote origin
echo "Step 4: Adding remote origin..."
# Replace YOUR_USERNAME with your actual GitHub username
GITHUB_USERNAME=$(gh api user -q .login)
git remote add origin "https://github.com/$GITHUB_USERNAME/mvp.git"

# Step 6: Create .gitignore if it doesn't exist
if [ ! -f .gitignore ]; then
    echo "Step 5: Creating .gitignore..."
    cat > .gitignore << 'EOF'
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

# Uploads (if you have local uploads)
uploads/
Uploads/
EOF
fi

# Step 7: Stage all files
echo "Step 6: Staging files..."
git add .

# Step 8: Create initial commit
echo "Step 7: Creating initial commit..."
git commit -m "Initial commit: HEBED AI MVP with Supabase Auth

Features:
- Google OAuth authentication
- Email/password authentication
- Role-based routing (Startup/Investor)
- Onboarding flows
- Dashboard pages
- API routes with Supabase Auth
- Database setup scripts
- Comprehensive documentation"

# Step 9: Push to main branch
echo "Step 8: Pushing to main branch..."
git push -u origin main

# Step 10: Create test branch
echo "Step 9: Creating test branch..."
git checkout -b test
git push -u origin test

# Step 11: Switch back to main
git checkout main

echo ""
echo "✅ Repository setup complete!"
echo ""
echo "Repository: https://github.com/$GITHUB_USERNAME/mvp"
echo "Branches created:"
echo "  - main (default)"
echo "  - test"
echo ""
echo "Next steps:"
echo "  1. Add collaborators if needed"
echo "  2. Configure branch protection rules"
echo "  3. Set up GitHub Actions workflows"
echo ""
