# Distribution Guide

This guide explains how to build and distribute the Local Difference Checker application for Mac and Windows.

## Prerequisites

1. **Install electron-builder** (already in devDependencies):
   ```bash
   npm install
   ```

2. **Application Icons**
   - You'll need to create application icons for each platform:
     - `build/icon.icns` - macOS icon (512x512 or larger)
     - `build/icon.ico` - Windows icon (256x256 or larger, multi-resolution)
     - `build/icon.png` - Linux icon (512x512 or larger)
   
   You can use online tools like:
   - [CloudConvert](https://cloudconvert.com/) to convert PNG to ICNS/ICO
   - [IconGenerator](https://www.icongenerator.net/) for creating icons
   - Or use tools like `iconutil` on macOS

   **Note**: The build will work without icons, but it's recommended to add them for a professional look.

## Building Distributables

### Build for Current Platform

Build for the platform you're currently on:
```bash
npm run dist
```

### Build for Specific Platforms

**macOS:**
```bash
npm run dist:mac
```
This creates:
- `.dmg` file (disk image) - Recommended for distribution
- `.zip` file (for direct download)

**Windows:**
```bash
npm run dist:win
```
This creates:
- `.exe` installer (NSIS installer)
- `.zip` file (portable version)

**Linux:**
```bash
npm run dist:linux
```
This creates:
- `.AppImage` file
- `.deb` package (Debian/Ubuntu)

### Build for All Platforms

To build for all platforms at once (requires cross-platform setup):
```bash
npm run dist:all
```

**Note**: Building for Windows on macOS/Linux (and vice versa) requires Wine to be installed. It's recommended to build on the target platform or use CI/CD.

## Output Location

All distributables are created in the `release/` directory:
```
release/
├── Local Difference Checker-0.1.0.dmg          # macOS
├── Local Difference Checker-0.1.0.exe          # Windows installer
├── Local Difference Checker-0.1.0.AppImage     # Linux
└── ...
```

## Creating Download Links

### Option 1: GitHub Releases (Recommended)

1. **Create a GitHub Release:**
   - Go to your repository on GitHub
   - Click "Releases" → "Create a new release"
   - Tag version: `v0.1.0` (match your package.json version)
   - Release title: `v0.1.0 - Initial Release`
   - Add release notes describing features and changes

2. **Upload Build Artifacts:**
   - Drag and drop your built files from `release/` folder:
     - `Local Difference Checker-0.1.0.dmg` (macOS)
     - `Local Difference Checker Setup 0.1.0.exe` (Windows)
     - Or `.zip` files for each platform
   - GitHub will create direct download links automatically

3. **Download Links Format:**
   ```
   https://github.com/yourusername/local-difference-checker/releases/download/v0.1.0/Local-Difference-Checker-0.1.0.dmg
   https://github.com/yourusername/local-difference-checker/releases/download/v0.1.0/Local-Difference-Checker-Setup-0.1.0.exe
   ```

### Option 2: Simple File Hosting

1. **Upload to file hosting service:**
   - Upload files to services like:
     - [Dropbox](https://www.dropbox.com/) (create public links)
     - [Google Drive](https://drive.google.com/) (share with "Anyone with the link")
     - [AWS S3](https://aws.amazon.com/s3/) (with public bucket)
     - [Cloudflare R2](https://www.cloudflare.com/products/r2/)
     - Your own web server

2. **Create download page:**
   - Create a simple HTML page with download buttons
   - Link to the hosted files

### Option 3: Automated CI/CD (Advanced)

Set up GitHub Actions to automatically build and release:

1. **Create `.github/workflows/release.yml`:**
   ```yaml
   name: Build and Release
   
   on:
     release:
       types: [created]
   
   jobs:
     build:
       runs-on: ${{ matrix.os }}
       strategy:
         matrix:
           os: [macos-latest, windows-latest, ubuntu-latest]
       
       steps:
         - uses: actions/checkout@v3
         - uses: actions/setup-node@v3
           with:
             node-version: '18'
         - run: npm ci
         - run: npm run build
         - run: npm run dist
         - uses: softprops/action-gh-release@v1
           with:
             files: release/*
           env:
             GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
   ```

2. **Automatic releases:**
   - When you create a GitHub release, it automatically builds for all platforms
   - Artifacts are attached to the release

## Code Signing (Optional but Recommended)

### macOS Code Signing

For distribution outside the Mac App Store, you need:
1. Apple Developer account ($99/year)
2. Code signing certificate

Add to `electron-builder.yml`:
```yaml
mac:
  identity: "Developer ID Application: Your Name (TEAM_ID)"
  hardenedRuntime: true
  gatekeeperAssess: true
  entitlements: build/entitlements.mac.plist
  entitlementsInherit: build/entitlements.mac.plist
```

### Windows Code Signing

For Windows, you need:
1. Code signing certificate (from certificate authority)
2. Add to `electron-builder.yml`:
```yaml
win:
  certificateFile: path/to/certificate.pfx
  certificatePassword: ${env.CERTIFICATE_PASSWORD}
```

**Note**: Code signing is optional for personal projects but required for:
- macOS: Avoiding "unidentified developer" warnings
- Windows: Avoiding SmartScreen warnings

## Notarization (macOS - Optional)

For macOS, you can notarize your app to avoid Gatekeeper warnings:

1. Add to `electron-builder.yml`:
```yaml
mac:
  notarize:
    teamId: "YOUR_TEAM_ID"
```

2. Set environment variables:
```bash
export APPLE_ID="your@email.com"
export APPLE_APP_SPECIFIC_PASSWORD="your-app-specific-password"
```

## Version Management

Update the version in `package.json` before building:
```json
{
  "version": "0.1.1"
}
```

Then build:
```bash
npm run dist
```

## Testing Distributables

Before distributing:

1. **Test on clean systems:**
   - Install on a fresh VM or different machine
   - Verify all features work
   - Check file associations (if any)

2. **Test installers:**
   - Verify installation works correctly
   - Check uninstallation works
   - Test shortcuts and file associations

## Distribution Checklist

- [ ] Update version in `package.json`
- [ ] Create/update application icons
- [ ] Build distributables (`npm run dist`)
- [ ] Test installers on target platforms
- [ ] Create GitHub release (or upload to hosting)
- [ ] Update README with download links
- [ ] Test download links
- [ ] Announce release (if public)

## Troubleshooting

### Build Fails
- Ensure all dependencies are installed: `npm install`
- Check that `dist/` folder exists after `npm run build`
- Verify electron-builder is installed: `npm list electron-builder`

### Windows Build on macOS/Linux
- Install Wine: `brew install wine` (macOS) or `sudo apt-get install wine` (Linux)
- Or use GitHub Actions for cross-platform builds

### Icon Issues
- Ensure icons are in correct format and size
- Use online converters if needed
- Icons are optional - build will work without them

### Large File Sizes
- Electron apps are typically 100-200MB
- This is normal due to Chromium and Node.js bundling
- Consider using `electron-builder` compression options

## Next Steps

1. Create your application icons
2. Build your first distributable: `npm run dist`
3. Test the installer
4. Create a GitHub release and upload files
5. Share download links with users!

