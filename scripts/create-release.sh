#!/bin/bash

# Script to create a GitHub release for Mac ARM64
# Usage: ./scripts/create-release.sh [version] [notes]

set -e

VERSION=${1:-"0.1.0"}
NOTES=${2:-"Release v${VERSION} for Mac ARM64"}

# Check if GitHub CLI is installed
if command -v gh &> /dev/null; then
    echo "Using GitHub CLI to create release..."
    
    # Check if we're in a git repo
    if ! git rev-parse --git-dir > /dev/null 2>&1; then
        echo "Error: Not in a git repository"
        exit 1
    fi
    
    # Get the remote URL to check if it's a GitHub repo
    REMOTE_URL=$(git remote get-url origin 2>/dev/null || echo "")
    
    if [[ -z "$REMOTE_URL" ]]; then
        echo "Error: No remote 'origin' found"
        exit 1
    fi
    
    # Check if release already exists
    if gh release view "v${VERSION}" &> /dev/null; then
        echo "Release v${VERSION} already exists. Adding assets..."
        gh release upload "v${VERSION}" release/Local\ Difference\ Checker-${VERSION}-arm64.dmg --clobber
        gh release upload "v${VERSION}" release/Local\ Difference\ Checker-${VERSION}-arm64-mac.zip --clobber
        echo "✅ Assets uploaded to existing release"
    else
        echo "Creating new release v${VERSION}..."
        gh release create "v${VERSION}" \
            --title "v${VERSION} - Mac ARM64" \
            --notes "${NOTES}" \
            release/Local\ Difference\ Checker-${VERSION}-arm64.dmg \
            release/Local\ Difference\ Checker-${VERSION}-arm64-mac.zip
        echo "✅ Release created successfully!"
    fi
    
    echo ""
    echo "Release URL:"
    gh release view "v${VERSION}" --web
    
else
    echo "GitHub CLI (gh) is not installed."
    echo ""
    echo "To install GitHub CLI:"
    echo "  brew install gh"
    echo ""
    echo "Then authenticate:"
    echo "  gh auth login"
    echo ""
    echo "Or create the release manually:"
    echo "  1. Go to your GitHub repository"
    echo "  2. Click 'Releases' → 'Create a new release'"
    echo "  3. Tag: v${VERSION}"
    echo "  4. Title: v${VERSION} - Mac ARM64"
    echo "  5. Upload these files from the release/ folder:"
    echo "     - Local Difference Checker-${VERSION}-arm64.dmg"
    echo "     - Local Difference Checker-${VERSION}-arm64-mac.zip"
    echo "  6. Click 'Publish release'"
    echo ""
    echo "Files ready in release/ directory:"
    ls -lh release/*arm64* 2>/dev/null || echo "No arm64 files found"
fi

