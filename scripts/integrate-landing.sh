#!/bin/bash
# Integrate Vite landing page into Next.js public directory

set -e

echo "🔄 Integrating Vite landing page into Next.js..."

# Check if dist/ exists
if [ ! -d "dist" ]; then
  echo "❌ Error: dist/ directory not found. Run 'npm run build:landing' first."
  exit 1
fi

# Create public directory if it doesn't exist
mkdir -p public

# Preserve _redirects file if it exists
if [ -f "public/_redirects" ]; then
  cp public/_redirects /tmp/_redirects.backup
fi

# Copy all files from dist/ to public/
echo "📦 Copying dist/* to public/..."
cp -r dist/* public/

# Restore _redirects if it was backed up
if [ -f "/tmp/_redirects.backup" ]; then
  mv /tmp/_redirects.backup public/_redirects
fi

echo "✅ Landing page integrated successfully!"
echo "📁 Files copied from dist/ to public/"
