#!/bin/bash
# GitHub Upload Script for Bash
# This script helps initialize a Git repository and push it to GitHub

# Set text colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Step 1: Initialize Git repository (if not already initialized)
if [ ! -d ".git" ]; then
    echo -e "${GREEN}Initializing Git repository...${NC}"
    git init
else
    echo -e "${YELLOW}Git repository already initialized.${NC}"
fi

# Step 2: Add all files to Git
echo -e "${GREEN}Adding files to Git...${NC}"
git add .

# Step 3: Create initial commit
echo -e "${GREEN}Creating initial commit...${NC}"
git commit -m "Initial commit of AtleTech app"

# Step 4: Prompt for GitHub repository URL
echo -e "Enter your GitHub repository URL (e.g., https://github.com/username/repo.git):"
read repo_url

# Step 5: Add GitHub remote
echo -e "${GREEN}Adding GitHub remote...${NC}"
git remote add origin $repo_url

# Step 6: Push to GitHub
echo -e "${GREEN}Pushing to GitHub...${NC}"
git push -u origin main

echo -e "${GREEN}Done! Your code has been uploaded to GitHub.${NC}"
echo -e "${GREEN}Repository URL: $repo_url${NC}"
