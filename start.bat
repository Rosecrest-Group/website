@echo off
cd /d "%~dp0"

echo Stopping any existing Rosecrest dev servers...
powershell -NoProfile -Command ^
  "$ports = 4000, 3000; foreach ($port in $ports) { Get-NetTCPConnection -LocalPort $port -State Listen -ErrorAction SilentlyContinue | ForEach-Object { $p = Get-Process -Id $_.OwningProcess -ErrorAction SilentlyContinue; if ($p) { Write-Host ('  Stopping {0} on port {1} (PID {2})' -f $p.ProcessName, $port, $p.Id); Stop-Process -Id $p.Id -Force -ErrorAction SilentlyContinue } } }"

if exist ".next\dev\lock" (
  echo Removing stale Next.js dev lock...
  del /f ".next\dev\lock"
)

timeout /t 1 /nobreak >nul

echo Starting API (port 4000) and Next.js (port 3000)...
start "Rosecrest API" /D "%~dp0api" cmd /k npm run dev
start "Rosecrest Next.js" /D "%~dp0" cmd /k npm run dev

echo.
echo Both servers are starting in separate windows.
echo   API:      http://localhost:4000
echo   Frontend: http://localhost:3000
timeout /t 5
