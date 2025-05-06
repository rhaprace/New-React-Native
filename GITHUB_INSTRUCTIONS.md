# GitHub Upload Instructions

This document provides step-by-step instructions for uploading your AtleTech project to GitHub.

## Prerequisites

1. Create a GitHub account if you don't have one already: [GitHub Sign Up](https://github.com/signup)
2. Create a new repository on GitHub:
   - Go to [GitHub New Repository](https://github.com/new)
   - Enter a repository name (e.g., "atletech")
   - Choose public or private visibility
   - Do NOT initialize with README, .gitignore, or license
   - Click "Create repository"
3. Install Git if you haven't already: [Git Downloads](https://git-scm.com/downloads)

## Option 1: Using the Provided Scripts

### For Windows Users

1. Double-click the `upload-to-github.bat` file in your project directory
2. Follow the prompts in the command window
3. When asked for the repository URL, enter the URL of the repository you created (e.g., `https://github.com/yourusername/atletech.git`)

### For macOS/Linux Users

1. Open Terminal
2. Navigate to your project directory
3. Make the script executable: `chmod +x upload-to-github.sh`
4. Run the script: `./upload-to-github.sh`
5. Follow the prompts in the terminal
6. When asked for the repository URL, enter the URL of the repository you created

## Option 2: Manual Git Commands

If you prefer to use Git commands directly, follow these steps:

1. Open a terminal or command prompt
2. Navigate to your project directory
3. Initialize a Git repository:
   ```
   git init
   ```
4. Add all files to Git:
   ```
   git add .
   ```
5. Commit the changes:
   ```
   git commit -m "Initial commit"
   ```
6. Add the GitHub repository as a remote:
   ```
   git remote add origin https://github.com/yourusername/atletech.git
   ```
   (Replace with your actual repository URL)
7. Push to GitHub:
   ```
   git push -u origin main
   ```

## Troubleshooting

### Authentication Issues

If you encounter authentication issues, you may need to:

1. Set up a Personal Access Token (PAT):
   - Go to [GitHub Settings > Developer settings > Personal access tokens](https://github.com/settings/tokens)
   - Click "Generate new token"
   - Select the necessary scopes (at minimum, select "repo")
   - Use this token as your password when prompted

2. Or set up SSH authentication:
   - [GitHub's SSH key setup guide](https://docs.github.com/en/authentication/connecting-to-github-with-ssh)

### Branch Name Issues

If you get an error about the branch name, try:

```
git push -u origin master
```

Or create a main branch first:

```
git branch -M main
git push -u origin main
```

## After Uploading

Once your code is on GitHub:

1. Verify that all files were uploaded correctly by checking your repository on GitHub
2. Set up GitHub Pages if you want to showcase your project (Settings > Pages)
3. Consider adding collaborators if you're working with others (Settings > Collaborators)
4. Set up GitHub Actions for CI/CD if needed (Actions tab)

## Keeping Your Repository Updated

After making changes to your code:

1. Add the changed files:
   ```
   git add .
   ```
2. Commit the changes:
   ```
   git commit -m "Description of changes"
   ```
3. Push to GitHub:
   ```
   git push
   ```
