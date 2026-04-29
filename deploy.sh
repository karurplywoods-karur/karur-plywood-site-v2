#!/bin/bash
# ═══════════════════════════════════════════════════════
# Karur Plywood — One-click GitHub push script
# 
# INSTRUCTIONS:
# 1. Extract the zip file anywhere on your computer
# 2. Open Terminal (Windows: Git Bash or PowerShell)
# 3. cd into the extracted folder (where this file is)
# 4. Run:  bash deploy.sh
# ═══════════════════════════════════════════════════════

# ── EDIT THESE TWO LINES ──────────────────────────────
GITHUB_USERNAME="karurplywoods-karur"
REPO_NAME="karur-plywood-site-v2"
# ─────────────────────────────────────────────────────

set -e  # stop on any error

echo ""
echo "═══════════════════════════════════════════"
echo "  Karur Plywood — GitHub Deploy Script"
echo "═══════════════════════════════════════════"
echo ""

# Check git installed
if ! command -v git &> /dev/null; then
  echo "❌ Git is not installed."
  echo "   Download from: https://git-scm.com/downloads"
  exit 1
fi

REPO_URL="https://github.com/${GITHUB_USERNAME}/${REPO_NAME}.git"
WORK_DIR="$(pwd)"

echo "📁 Working directory: $WORK_DIR"
echo "🔗 Repository: $REPO_URL"
echo ""

# If already a git repo, just pull and push
if [ -d ".git" ]; then
  echo "✅ Git repo found. Pushing all changes..."
  git add -A
  git commit -m "Deploy: Full site update $(date '+%Y-%m-%d %H:%M')" || echo "(nothing new to commit)"
  git push origin main
  echo ""
  echo "✅ Done! Check Vercel for deployment status."
  exit 0
fi

# Fresh setup
echo "🔧 Setting up git repository..."
git init
git branch -M main

echo ""
echo "Adding all files..."
git add -A

echo ""
echo "Creating commit..."
git commit -m "Deploy: Karur Plywood full site $(date '+%Y-%m-%d %H:%M')"

echo ""
echo "Connecting to GitHub..."
git remote add origin "$REPO_URL" 2>/dev/null || git remote set-url origin "$REPO_URL"

echo ""
echo "Pushing to GitHub (you may need to enter your GitHub password or token)..."
git push -u origin main --force

echo ""
echo "═══════════════════════════════════════════"
echo "  ✅ SUCCESS! All files pushed to GitHub."
echo "  Vercel will auto-deploy in ~2 minutes."
echo "  Check: https://vercel.com/dashboard"
echo "═══════════════════════════════════════════"
echo ""
