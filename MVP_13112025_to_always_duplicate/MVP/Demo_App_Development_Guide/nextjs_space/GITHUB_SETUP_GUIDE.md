# 📦 GitHub Repository Setup - MVP

## Quick Start

### Option 1: Run PowerShell Script (Windows - Recommended)

```powershell
# Make sure GitHub CLI is installed and authenticated
gh --version  # Check if installed

# If not installed:
winget install --id GitHub.cli

# Authenticate with GitHub
gh auth login

# Run the setup script
.\create-github-repo.ps1
```

### Option 2: Run Bash Script (Git Bash/WSL)

```bash
# Make sure GitHub CLI is installed
gh --version

# Authenticate with GitHub
gh auth login

# Run the setup script
bash create-github-repo.sh
```

### Option 3: Manual Setup

#### Step 1: Create Repository on GitHub

```bash
gh repo create mvp --private --description "HEBED AI MVP - Startup/Investor Marketplace Platform"
```

Or manually:
1. Go to https://github.com/new
2. Repository name: `mvp`
3. Description: `HEBED AI MVP - Startup/Investor Marketplace Platform`
4. Visibility: **Private**
5. Click "Create repository"

#### Step 2: Initialize Git Locally

```bash
# Navigate to your project
cd "C:\Users\edwar\Downloads\MVP\Demo_App_Development_Guide\ai_roi_dashboard\nextjs_space"

# Initialize git (if not already)
git init

# Set main as default branch
git branch -M main
```

#### Step 3: Add Remote

```bash
# Replace YOUR_USERNAME with your GitHub username
git remote add origin https://github.com/YOUR_USERNAME/mvp.git
```

#### Step 4: Create .gitignore

Create a `.gitignore` file with:
```gitignore
# Dependencies
node_modules/
.pnp
.pnp.js

# Next.js
.next/
out/
build/
dist/

# Environment variables
.env
.env.local
.env.development.local
.env.test.local
.env.production.local

# Logs
*.log
npm-debug.log*

# IDE
.vscode/
.idea/

# OS
.DS_Store
Thumbs.db

# Database
prisma/*.db
prisma/*.db-journal

# TypeScript
*.tsbuildinfo

# Uploads
uploads/
Uploads/
```

#### Step 5: Initial Commit

```bash
# Stage all files
git add .

# Create initial commit
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
```

#### Step 6: Push to GitHub

```bash
# Push to main branch
git push -u origin main
```

#### Step 7: Create Test Branch

```bash
# Create and switch to test branch
git checkout -b test

# Push test branch
git push -u origin test

# Switch back to main
git checkout main
```

## Verify Setup

After setup, verify:

```bash
# Check branches
git branch -a

# Should show:
# * main
#   test
#   remotes/origin/main
#   remotes/origin/test

# Check remote
git remote -v

# Should show:
# origin  https://github.com/YOUR_USERNAME/mvp.git (fetch)
# origin  https://github.com/YOUR_USERNAME/mvp.git (push)
```

## Branch Structure

### Main Branch
- **Purpose:** Production-ready code
- **Protection:** Should be protected (require PR reviews)
- **Deployment:** Auto-deploy to production

### Test Branch  
- **Purpose:** Testing and QA
- **Protection:** Optional (can allow direct pushes for testing)
- **Deployment:** Auto-deploy to staging/test environment

## Recommended GitHub Settings

### Branch Protection Rules (Main)

```bash
# Navigate to: Settings → Branches → Add rule

Branch name pattern: main

✅ Require a pull request before merging
✅ Require approvals: 1
✅ Dismiss stale pull request approvals when new commits are pushed
✅ Require status checks to pass before merging
✅ Require branches to be up to date before merging
✅ Include administrators
```

### Branch Protection Rules (Test)

```bash
# Navigate to: Settings → Branches → Add rule

Branch name pattern: test

✅ Require a pull request before merging (optional)
⬜ Other rules can be relaxed for testing
```

## Workflow

### Development Workflow

```bash
# 1. Create feature branch from test
git checkout test
git checkout -b feature/new-feature

# 2. Make changes and commit
git add .
git commit -m "feat: add new feature"

# 3. Push feature branch
git push -u origin feature/new-feature

# 4. Create PR to test branch
# (On GitHub: feature/new-feature → test)

# 5. After testing, create PR from test to main
# (On GitHub: test → main)
```

### Hotfix Workflow

```bash
# 1. Create hotfix branch from main
git checkout main
git checkout -b hotfix/critical-bug

# 2. Fix and commit
git add .
git commit -m "fix: critical bug"

# 3. Push and create PR to main
git push -u origin hotfix/critical-bug
```

## GitHub Actions (Optional)

Create `.github/workflows/ci.yml`:

```yaml
name: CI/CD

on:
  push:
    branches: [main, test]
  pull_request:
    branches: [main, test]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run lint
      - run: npm run build
```

## Troubleshooting

### Issue: GitHub CLI not installed

```powershell
# Windows
winget install --id GitHub.cli

# Or download from: https://cli.github.com/
```

### Issue: Not authenticated

```bash
gh auth login
# Follow the prompts
```

### Issue: Permission denied

```bash
# Check your authentication
gh auth status

# Re-authenticate if needed
gh auth logout
gh auth login
```

### Issue: Remote already exists

```bash
# Remove old remote
git remote remove origin

# Add new remote
git remote add origin https://github.com/YOUR_USERNAME/mvp.git
```

## Success Checklist

- [ ] Repository created on GitHub
- [ ] Repository is private
- [ ] Local git initialized
- [ ] Remote origin added
- [ ] .gitignore created
- [ ] Initial commit made
- [ ] Main branch pushed
- [ ] Test branch created and pushed
- [ ] Branch protection configured (optional)
- [ ] Collaborators added (if needed)

## Next Steps

1. **Add collaborators:** Settings → Collaborators
2. **Set up branch protection:** Settings → Branches
3. **Configure GitHub Actions:** Create `.github/workflows/`
4. **Add secrets:** Settings → Secrets → Actions
5. **Set up deployment:** Connect to Vercel/Railway

---

**Repository:** https://github.com/YOUR_USERNAME/mvp  
**Branches:** main, test  
**Visibility:** Private
