@echo off
setlocal EnableDelayedExpansion
cd /d "%~dp0"

set "QUICK=0"
if /i "%~1"=="--quick" set "QUICK=1"
if /i "%~1"=="-q" set "QUICK=1"

echo.
echo === Rosecrest API pre-deploy check ===
echo.

where node >nul 2>&1
if errorlevel 1 (
  echo ERROR: Node.js is not installed or not on PATH.
  exit /b 1
)

for /f "delims=" %%v in ('node -p "process.version"') do set "NODE_VERSION=%%v"
echo Node: !NODE_VERSION!

powershell -NoProfile -Command "if ([int]($v = (node -p 'process.versions.node').Split('.')[0]) -lt 20) { Write-Host 'WARNING: Node 20+ is recommended (CI/Railway use 20; some deps require it).'; exit 0 }"
if errorlevel 1 (
  echo ERROR: Node.js version check failed.
  exit /b 1
)

if not exist "api\package.json" (
  echo ERROR: api\package.json not found. Run this script from the repo root.
  exit /b 1
)

cd api

REM Stub env vars for prisma generate during npm ci (matches .github/workflows/ci.yml)
set "DATABASE_URL=postgresql://postgres:postgres@localhost:5432/test"
set "SUPABASE_URL=https://example.supabase.co"
set "SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.test"
set "SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.test"
set "SUPABASE_JWT_SECRET=test-jwt-secret-at-least-32-characters-long"

if "!QUICK!"=="0" (
  echo.
  echo [1/4] npm ci
  call npm ci
  if errorlevel 1 goto failed
) else (
  echo.
  echo [1/4] Skipping npm ci ^(--quick^). Using existing node_modules.
  if not exist "node_modules" (
    echo ERROR: node_modules missing. Run without --quick first.
    goto failed
  )
)

echo.
echo [2/4] prisma generate
call npx prisma generate
if errorlevel 1 goto failed

echo.
echo [3/4] npm test
call npm test
if errorlevel 1 goto failed

echo.
echo [4/4] npm run build (tsc - same step Railway runs)
call npm run build
if errorlevel 1 goto failed

echo.
echo ========================================
echo   All API checks passed. Safe to deploy.
echo ========================================
echo.
exit /b 0

:failed
echo.
echo ========================================
echo   CHECK FAILED - fix errors before deploy
echo ========================================
echo.
exit /b 1
