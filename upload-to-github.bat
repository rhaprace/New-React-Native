@echo off
echo AtleTech GitHub Upload Tool
echo ===========================
echo.

REM Check if Git is installed
where git >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo Git is not installed or not in your PATH.
    echo Please install Git from https://git-scm.com/downloads
    pause
    exit /b
)

REM Check if repository is already initialized
if not exist .git (
    echo Initializing Git repository...
    git init
) else (
    echo Git repository already initialized.
)

REM Add all files to Git
echo.
echo Adding files to Git...
git add .

REM Create initial commit
echo.
echo Creating initial commit...
set /p commit_message=Enter commit message (default: Initial commit): 
if "%commit_message%"=="" set commit_message=Initial commit
git commit -m "%commit_message%"

REM Add GitHub remote
echo.
set /p repo_url=Enter your GitHub repository URL (e.g., https://github.com/username/repo.git): 
echo Adding GitHub remote...
git remote add origin %repo_url%

REM Push to GitHub
echo.
echo Pushing to GitHub...
git push -u origin main

echo.
echo Done! Your code has been uploaded to GitHub.
echo Repository URL: %repo_url%
echo.
pause
