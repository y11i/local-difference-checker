# Quick Start: Creating Download Links

## Step 1: Build Your Distributables

**On macOS:**
```bash
npm run dist:mac
```

**On Windows:**
```bash
npm run dist:win
```

**On Linux:**
```bash
npm run dist:linux
```

This creates installers in the `release/` folder.

## Step 2: Create Download Links (GitHub Releases - Recommended)

### Option A: Manual Upload

1. Go to your GitHub repository
2. Click **"Releases"** → **"Create a new release"**
3. Tag: `v0.1.0` (match your package.json version)
4. Title: `v0.1.0 - Initial Release`
5. Drag and drop files from `release/` folder:
   - `Local Difference Checker-0.1.0.dmg` (macOS)
   - `Local Difference Checker Setup 0.1.0.exe` (Windows)
6. Click **"Publish release"**

### Option B: Using GitHub CLI

```bash
# Install GitHub CLI if needed: brew install gh
gh release create v0.1.0 release/*.dmg release/*.exe --title "v0.1.0" --notes "Initial release"
```

## Step 3: Get Download Links

After publishing, GitHub automatically creates download links:

**macOS:**
```
https://github.com/YOUR_USERNAME/local-difference-checker/releases/download/v0.1.0/Local-Difference-Checker-0.1.0.dmg
```

**Windows:**
```
https://github.com/YOUR_USERNAME/local-difference-checker/releases/download/v0.1.0/Local-Difference-Checker-Setup-0.1.0.exe
```

Replace `YOUR_USERNAME` with your GitHub username.

## Step 4: Add Links to Your README

Update your README.md with:

```markdown
## Download

- [Download for macOS](https://github.com/YOUR_USERNAME/local-difference-checker/releases/download/v0.1.0/Local-Difference-Checker-0.1.0.dmg)
- [Download for Windows](https://github.com/YOUR_USERNAME/local-difference-checker/releases/download/v0.1.0/Local-Difference-Checker-Setup-0.1.0.exe)
```

## Alternative: Simple File Hosting

If you don't use GitHub:

1. Upload files to:
   - Dropbox (create public link)
   - Google Drive (share with "Anyone with the link")
   - Your own web server
   - AWS S3 / Cloudflare R2

2. Share the direct download links

## Notes

- **Icons**: The build works without icons, but you can add them to `build/` folder:
  - `build/icon.icns` (macOS)
  - `build/icon.ico` (Windows)
  - `build/icon.png` (Linux)

- **Version**: Update `package.json` version before building new releases

- **Testing**: Always test installers on clean systems before distributing

For more details, see [DISTRIBUTION.md](./DISTRIBUTION.md).

