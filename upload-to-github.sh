#!/bin/bash
# GitHub Upload Script for Bash

# Set text colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}AtleTech GitHub Upload Tool${NC}"
echo -e "${BLUE}============================${NC}"
echo

# Check if Git is installed
if ! command -v git &> /dev/null; then
    echo "Git is not installed."
    echo "Please install Git from https://git-scm.com/downloads"
    exit 1
fi

# Check if repository is already initialized
if [ ! -d ".git" ]; then
    echo -e "${GREEN}Initializing Git repository...${NC}"
    git init
else
    echo -e "${YELLOW}Git repository already initialized.${NC}"
fi

# Add all files to Git
echo
echo -e "${GREEN}Adding files to Git...${NC}"
git add .

# Create initial commit
echo
echo -e "${GREEN}Creating initial commit...${NC}"
echo -n "Enter commit message (default: Initial commit): "
read commit_message
if [ -z "$commit_message" ]; then
    commit_message="Initial commit"
fi
git commit -m "$commit_message"

# Add GitHub remote
echo
echo -n "Enter your GitHub repository URL (e.g., https://github.com/username/repo.git): "
read repo_url
echo -e "${GREEN}Adding GitHub remote...${NC}"
git remote add origin $repo_url

# Push to GitHub
echo
echo -e "${GREEN}Pushing to GitHub...${NC}"
git push -u origin main

echo
echo -e "${GREEN}Done! Your code has been uploaded to GitHub.${NC}"
echo -e "${GREEN}Repository URL: $repo_url${NC}"
echo
