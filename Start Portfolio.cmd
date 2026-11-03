@echo off
setlocal
cd /d "%~dp0"
where node >nul 2>nul
if errorlevel 1 (
  set "PORTFOLIO_NODE=%USERPROFILE%\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe"
) else (
  set "PORTFOLIO_NODE=node"
)
if not "%PORTFOLIO_NODE%"=="node" if not exist "%PORTFOLIO_NODE%" (
  echo Node.js was not found. Install Node.js 22.12 or newer, then try again.
  pause
  exit /b 1
)
"%PORTFOLIO_NODE%" "%~dp0scripts\preview.mjs"
if errorlevel 1 (
  pause
  exit /b 1
)
start "" "http://127.0.0.1:4173/"
