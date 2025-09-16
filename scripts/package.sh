#!/bin/bash

set -e

echo "🔨 Building extension..."
pnpm run build

echo "📦 Creating package for Chrome Web Store..."
cd dist
zip -r ../elden-ring-github-extension.zip *
cd ..

echo "✅ Package created: elden-ring-github-extension.zip"
echo "📊 Package size:"
ls -lh elden-ring-github-extension.zip

echo ""
echo "🚀 Ready for Chrome Web Store submission!"