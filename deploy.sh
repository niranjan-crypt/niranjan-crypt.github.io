#!/usr/bin/env bash
# ==============================================================================
# 🚀 1-COMMAND DEPLOYMENT TO GITHUB PAGES
# Run this once in your terminal. You do NOT need to keep any command running!
# ==============================================================================

set -e

echo "==========================================================="
echo "  Deploying Niranjan Krishnakumar's Portfolio to GitHub    "
echo "==========================================================="

# Initialize git if not already initialized
if [ ! -d ".git" ]; then
  git init
fi

git add .
git commit -m "Deploy clean, modern portfolio and resume" || echo "No changes to commit"
git branch -M main

echo ""
echo "Select your target GitHub repository:"
echo "1) Root User Domain: https://github.com/niranjan-crypt/niranjan-crypt.github.io (Live at: https://niranjan-crypt.github.io)"
echo "2) Project Repository: https://github.com/niranjan-crypt/portfolio (Live at: https://niranjan-crypt.github.io/portfolio)"
echo ""
read -p "Enter choice [1 or 2] (default is 1): " choice

if [ "$choice" = "2" ]; then
  REPO_URL="https://github.com/niranjan-crypt/portfolio.git"
  LIVE_URL="https://niranjan-crypt.github.io/portfolio"
else
  REPO_URL="https://github.com/niranjan-crypt/niranjan-crypt.github.io.git"
  LIVE_URL="https://niranjan-crypt.github.io"
fi

# Set remote origin
git remote remove origin 2>/dev/null || true
git remote add origin "$REPO_URL"

echo ""
echo "Pushing code to GitHub ($REPO_URL)..."
git push -u origin main --force

echo ""
echo "==========================================================="
echo "✅ DEPLOYMENT COMPLETE!"
echo "Your portfolio is now live on the internet 24/7 at:"
echo "👉 $LIVE_URL"
echo ""
echo "Note: If this is a new repository, enable GitHub Pages once in:"
echo "GitHub Repo -> Settings -> Pages -> Source: 'Deploy from a branch' -> 'main' -> Save."
echo "You do NOT need to keep any terminal running!"
echo "==========================================================="
