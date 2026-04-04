# InventIQ One-Click Deployment Script
# Run this script to push all fixes to GitHub.

Write-Host "--- Starting Deployment Push ---" -ForegroundColor Cyan

# 1. Add all changes
git add .

# 2. Commit
$commitMsg = "fix: deployment routing and backend endpoint"
git commit -m $commitMsg

# 3. Push to GitHub
Write-Host "Pushing to GitHub... (You may be prompted for credentials)" -ForegroundColor Yellow
git push origin main

Write-Host "--- Push Complete! ---" -ForegroundColor Green
Write-Host ""
Write-Host "FINAL STEP: Go to Vercel Dashboard and REDEPLOY 'invent-iq-frontend-alpha'." -ForegroundColor Magenta
Write-Host "IMPORTANT: Uncheck 'Use existing Build Cache' during redeploy." -ForegroundColor Red
