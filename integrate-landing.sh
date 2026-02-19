#!/bin/bash
# Integrate Vite landing page build into Next.js public directory

echo "🔄 Integrating Vite landing page into Next.js..."

# Check if dist exists
if [ ! -d "dist" ]; then
  echo "❌ Error: dist/ directory not found. Run 'npm run build:landing' first."
  exit 1
fi

# Copy all files from dist/ to public/, but skip _redirects (we have our own)
echo "📦 Copying Vite build to public/..."
rsync -av --exclude='_redirects' dist/ public/ 2>/dev/null || {
  # Fallback to cp if rsync not available
  echo "⚠️  rsync not available, using cp..."
  cp -r dist/* public/ 2>/dev/null || true
  # Remove the copied _redirects if it was copied
  rm -f public/_redirects.bak 2>/dev/null
}

echo "✅ Vite landing page integrated into Next.js public directory"
echo "   Landing page will be served by Next.js at root /"
