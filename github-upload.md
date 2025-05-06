# GitHub Upload Instructions

## Step 1: Create a new repository on GitHub
1. Go to https://github.com/new
2. Enter a repository name
3. Optionally add a description
4. Choose whether the repository should be public or private
5. Do NOT initialize the repository with a README, .gitignore, or license
6. Click "Create repository"

## Step 2: Upload your code to GitHub

### For Windows users:
Run the following command in your terminal:
```
.\upload-to-github.bat
```
or
```
powershell -ExecutionPolicy Bypass -File .\scripts\github-upload.ps1
```

### For macOS/Linux users:
Run the following command in your terminal:
```
chmod +x ./upload-to-github.sh && ./upload-to-github.sh
```
or
```
chmod +x ./scripts/github-upload.sh && ./scripts/github-upload.sh
```

## Step 3: Follow the prompts
1. When prompted, enter the URL of the GitHub repository you created in Step 1
   (e.g., https://github.com/username/repo.git)
2. The script will push your code to GitHub

## Step 4: Verify
After the script completes, visit your GitHub repository URL to verify that your code has been uploaded successfully.
