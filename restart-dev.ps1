# Script untuk restart dev server dengan clean cache

Write-Host "🧹 Cleaning cache..." -ForegroundColor Yellow
Remove-Item -Path ".next" -Recurse -Force -ErrorAction SilentlyContinue

Write-Host "📦 Installing dependencies..." -ForegroundColor Yellow
npm install

Write-Host "🔨 Building..." -ForegroundColor Yellow
npm run build

Write-Host "✅ Done! Now run: npm run dev" -ForegroundColor Green
Write-Host ""
Write-Host "📝 Instructions:" -ForegroundColor Cyan
Write-Host "1. Run: npm run dev"
Write-Host "2. Open browser in INCOGNITO mode"
Write-Host "3. Go to: http://localhost:3000"
Write-Host "4. Hard refresh: Ctrl + Shift + R"
Write-Host ""
Write-Host "If text still not visible:" -ForegroundColor Yellow
Write-Host "- Clear ALL browser cache"
Write-Host "- Close and reopen browser"
Write-Host "- Try different browser"
