$ErrorActionPreference = "Stop"

Write-Host "== ACT Differential Calibration 0.6.0 ==" -ForegroundColor Cyan
Write-Host "Node:" (node -v)
Write-Host "npm :" (npm -v)

npm install
npx playwright install chromium

npm test
npm run check
npm run preflight

if ($LASTEXITCODE -ne 0) {
  Write-Host ""
  Write-Host "PREFLIGHT NIJE PROSAO. Ne pokrecem eksperimente." -ForegroundColor Red
  Write-Host "Pogledaj output\00-preflight.json." -ForegroundColor Yellow
  exit $LASTEXITCODE
}

npm run exp:controlled
npm run exp:4

Write-Host ""
Write-Host "Ako su rezultati interpretabilni, mozes zatim pokrenuti: npm run exp:all" -ForegroundColor Green
