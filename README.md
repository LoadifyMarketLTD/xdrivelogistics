# XDrive Logistics Website

A modern, single-page website for XDrive Logistics - UK dedicated transport services.

## Overview

This website provides a simple, elegant interface for customers to request quotes for transport services. Features include:

- **Quote Request Form**: Comprehensive form for transport quotes
- **Multiple Contact Methods**: Form submission, WhatsApp, and email
- **Responsive Design**: Works on all devices
- **Modern UI**: Glassmorphic design with smooth animations
- **Accessibility**: ARIA labels, keyboard navigation, screen reader support
- **Form Autosave**: Automatically saves form progress

## Tech Stack

- **HTML5**: Semantic markup
- **CSS3**: Modern styling with CSS Grid and Flexbox
- **Vanilla JavaScript**: No dependencies
- **Make.com**: Webhook integration for form submissions

## Features

### 🎨 Design
- Dark theme with glassmorphic effects
- Gradient overlays and blur effects
- Responsive layout for all screen sizes
- Smooth animations and transitions

### ♿ Accessibility
- ARIA labels and attributes
- Keyboard navigation support
- Screen reader compatible
- Required field indicators
- Error messages with proper roles

### 🚀 Performance
- Optimized background images
- Preloaded critical assets
- Minimal dependencies
- Lazy loading support
- Data saver mode support

### 📱 Mobile-First
- Responsive hamburger menu
- Touch-friendly controls
- Mobile-optimized forms
- Proper viewport settings

### 🔒 Security
- Input validation
- Sanitized form data
- Security recommendations documented
- HTTPS ready

## Getting Started

### Local Development

1. **Clone the repository**
   ```bash
   git clone https://github.com/LoadifyMarketLTD/xdrivelogistics.git
   cd xdrivelogistics
   ```

2. **Start a local server**
   ```bash
   # Using Python 3
   python3 -m http.server 8080
   
   # Using Node.js
   npx http-server -p 8080
   
   # Using PHP
   php -S localhost:8080
   ```

3. **Open in browser**
   ```
   http://localhost:8080
   ```

### Deployment

This is a static website and can be deployed to:

- **GitHub Pages**: Free hosting for static sites
- **Netlify**: Automatic deployments from Git
- **Vercel**: Zero-config deployment
- **Cloudflare Pages**: Fast global CDN
- **Traditional Hosting**: Any web hosting with HTML support

#### Example: Deploy to GitHub Pages

1. Go to repository Settings
2. Navigate to Pages
3. Select branch: `main`
4. Select folder: `/` (root)
5. Click Save

Your site will be live at: `https://loadifymarketltd.github.io/xdrivelogistics/`

## Configuration

### Update Contact Information

Edit `index.html` and update these constants:

```javascript
const WHATSAPP_PHONE_E164 = "447423272138"; // Your WhatsApp number
const EMAIL_TO = "xdrivelogisticsltd@gmail.com"; // Your email
```

### Update Webhook URL

⚠️ **IMPORTANT**: The webhook URL should be moved to a backend service. See [SECURITY.md](SECURITY.md) for details.

Temporary location in `index.html`:
```javascript
const MAKE_WEBHOOK_URL = "https://hook.eu1.make.com/YOUR_WEBHOOK_ID";
```

## Working with Large Files

This repository is configured with **Git LFS (Large File Storage)** to handle files larger than 100MB.

📖 **Documentation**:
- [GIT_LFS_GUIDE_RO.md](GIT_LFS_GUIDE_RO.md) - Detailed guide in Romanian / Ghid detaliat în română
- [GIT_LFS_QUICK_REFERENCE.md](GIT_LFS_QUICK_REFERENCE.md) - Quick reference card / Referință rapidă
- [LFS_TEST_EXAMPLE.md](LFS_TEST_EXAMPLE.md) - Testing examples / Exemple de testare

Common large file types (videos, high-res images, archives, etc.) are automatically tracked with LFS. To add your large files:

```bash
git lfs install
git add your-large-file.mp4
git commit -m "Add large file"
git push
```

## File Structure

```
xdrivelogistics/
├── index.html                    # Main website file
├── logo.png                     # Company logo
├── background.jpg               # Background image
├── background.webp              # Background image (WebP)
├── logo.webp                    # Logo (WebP)
├── robots.txt                   # Search engine directives
├── sitemap.xml                  # XML sitemap
├── netlify.toml                 # Netlify configuration
├── .gitignore                   # Git ignore rules
├── .gitattributes               # Git LFS configuration
├── README.md                    # This file
├── GIT_LFS_GUIDE_RO.md          # Guide for large files (Romanian)
├── GIT_LFS_QUICK_REFERENCE.md   # LFS quick reference
├── LFS_TEST_EXAMPLE.md          # LFS testing examples
├── SECURITY.md                  # Security recommendations
├── RECOMMENDATIONS.md           # Full analysis and improvements
├── DOCUMENTS_OVERVIEW.md        # Documentation overview
├── IMPLEMENTATION_IDEAS.md      # Implementation ideas
├── QUICK_REFERENCE.md           # Quick reference guide
└── ANALIZA_STRUCTURALA.md       # Structural analysis
```

## Browser Support

- ✅ Chrome/Edge (latest 2 versions)
- ✅ Firefox (latest 2 versions)
- ✅ Safari (latest 2 versions)
- ✅ Mobile browsers (iOS Safari, Chrome Android)

## Performance

- **Page Size**: ~250KB (with optimized images)
- **Load Time**: <2s on 4G
- **Lighthouse Score**: 85-90+

## Accessibility

- **WCAG 2.1**: Level AA compliant (target)
- **Screen Readers**: Compatible with NVDA, JAWS, VoiceOver
- **Keyboard Navigation**: Full support
- **Color Contrast**: Meets AA standards

## SEO

- **Structured Data**: LogisticsService schema
- **Meta Tags**: Title, description, OG, Twitter Card
- **Sitemap**: XML sitemap included
- **Robots.txt**: Search engine friendly

## Contributing

This is a private company website. For internal contributions:

1. Create a feature branch
2. Make your changes
3. Test thoroughly
4. Submit a pull request
5. Wait for review

## Issues and Improvements

See [RECOMMENDATIONS.md](RECOMMENDATIONS.md) for:
- Detailed analysis
- Improvement suggestions
- Priority ranking
- Implementation timeline

See [SECURITY.md](SECURITY.md) for:
- Security concerns
- Recommended fixes
- Best practices

## Contact

**XDrive Logistics**
- 📱 WhatsApp: +44 7423 272138
- 📧 Email: xdrivelogisticsltd@gmail.com
- 🌐 Website: https://xdrivelogistics.co.uk

## License

© 2021 - 2026 XDrive Logistics LTD. All rights reserved.

This website is proprietary software owned by XDrive Logistics / Loadify Market LTD.
