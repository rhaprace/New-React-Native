# GitHub Upload Script for PowerShell
# This script helps initialize a Git repository and push it to GitHub

# Step 1: Initialize Git repository (if not already initialized)
if (-not (Test-Path -Path ".git")) {
    Write-Host "Initializing Git repository..." -ForegroundColor Green
    git init
} else {
    Write-Host "Git repository already initialized." -ForegroundColor Yellow
}

# Step 2: Add all files to Git
Write-Host "Adding files to Git..." -ForegroundColor Green
git add .

# Step 3: Create initial commit
Write-Host "Creating initial commit..." -ForegroundColor Green
git commit -m "Initial commit of AtleTech app"

# Step 4: Prompt for GitHub repository URL
$repoUrl = Read-Host -Prompt "Enter your GitHub repository URL (e.g., https://github.com/username/repo.git)"

# Step 5: Add GitHub remote
Write-Host "Adding GitHub remote..." -ForegroundColor Green
git remote add origin $repoUrl

# Step 6: Push to GitHub
Write-Host "Pushing to GitHub..." -ForegroundColor Green
git push -u origin master

Write-Host "Done! Your code has been uploaded to GitHub." -ForegroundColor Green
Write-Host "Repository URL: $repoUrl" -ForegroundColor Green
