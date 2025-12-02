# Quick Release Guide - Mac ARM64

This guide will help you create a GitHub release for your Mac ARM64 build.

## Option 1: Using GitHub CLI (Recommended - Fastest)

### Step 1: Install GitHub CLI (if not already installed)
```bash
brew install gh
```

### Step 2: Authenticate
```bash
gh auth login
```
Follow the prompts to authenticate with GitHub.

### Step 3: Create the Release
```bash
npm run release
```

Or manually:
```bash
./scripts/create-release.sh
```

This will:
- Create a new release tagged `v0.1.0` (or specify version: `./scripts/create-release.sh 0.1.0`)
- Upload the Mac ARM64 `.dmg` and `.zip` files
- Open the release page in your browser

## Option 2: Manual Release (No CLI needed)

### Step 1: Go to GitHub
1. Navigate to your repository on GitHub
2. Click on **"Releases"** (on the right sidebar, or go to `https://github.com/YOUR_USERNAME/local-difference-checker/releases`)
3. Click **"Create a new release"** or **"Draft a new release"**

### Step 2: Fill in Release Details
- **Tag version**: `v0.1.0` (must match your package.json version, with 'v' prefix)
- **Release title**: `v0.1.0 - Mac ARM64`
- **Description**: Add release notes (optional):
  ```
  ## Mac ARM64 Release
  
  First release for Apple Silicon Macs.
  
  ### Installation
  1. Download the `.dmg` file
  2. Open the downloaded file
  3. Drag the app to Applications folder
  4. Open from Applications (you may need to right-click and select "Open" the first time)
  ```

### Step 3: Upload Files
Drag and drop these files from your `release/` folder:
- `Local Difference Checker-0.1.0-arm64.dmg` (recommended - easier to install)
- `Local Difference Checker-0.1.0-arm64-mac.zip` (optional - for direct extraction)

### Step 4: Publish
Click **"Publish release"**

## After Publishing

Your release will be available at:
```
https://github.com/YOUR_USERNAME/local-difference-checker/releases/tag/v0.1.0
```

Download links will be:
```
https://github.com/YOUR_USERNAME/local-difference-checker/releases/download/v0.1.0/Local-Difference-Checker-0.1.0-arm64.dmg
https://github.com/YOUR_USERNAME/local-difference-checker/releases/download/v0.1.0/Local-Difference-Checker-0.1.0-arm64-mac.zip
```

## Troubleshooting

### "Release already exists"
If the release tag already exists, the script will add the files to the existing release. Or delete the old release on GitHub and create a new one.

### "Not in a git repository"
Make sure you're in the project directory and it's a git repository. If not, initialize it:
```bash
git init
git remote add origin YOUR_GITHUB_REPO_URL
```

### "No remote 'origin' found"
Add your GitHub repository as the remote:
```bash
git remote add origin https://github.com/YOUR_USERNAME/local-difference-checker.git
```

### Files not found
Make sure you've built the distributables first:
```bash
npm run dist:mac
```

This will create the files in the `release/` directory.

## Notes

- The `.dmg` file is recommended for distribution (users can drag-and-drop to install)
- The `.zip` file is useful for users who prefer to extract manually
- For personal use, you don't need code signing, but macOS may show a warning the first time users open it
- Users can bypass the warning by right-clicking the app and selecting "Open"

