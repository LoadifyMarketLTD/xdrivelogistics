# XDrive Logistics Website

A modern, single-page website for XDrive Logistics - UK & EU dedicated transport services.

## Overview

This website provides a simple, elegant interface for customers to request quotes for transport services. Features include:

- **Quote Request Form**: Comprehensive form for transport quotes
- **Login Page**: Professional login interface for customer accounts
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

## Login Page

The website now includes a professional login page at `login.html` with the following features:

### Features
- **Modern Design**: Matches the main website's glassmorphic aesthetic
- **Form Validation**: Real-time email and password validation
- **User Experience**: 
  - Remember me checkbox
  - Forgot password link
  - Create account option
  - Success/error message display
- **Responsive**: Fully mobile-friendly design
- **Accessibility**: ARIA labels, keyboard navigation, proper focus states

### Important Notes

⚠️ **Backend Required**: The current login page is a **frontend demonstration only**. To make it functional in production:

1. **Authentication Backend**: You need to implement a backend API for user authentication
2. **Recommended Stack**:
   - Node.js + Express with JWT tokens
   - Serverless functions (Vercel, Netlify, AWS Lambda)
   - Firebase Authentication
   - Auth0 or similar service
3. **Security Requirements**:
   - HTTPS only (already configured)
   - Secure password hashing (bcrypt, Argon2)
   - Session management with secure cookies
   - CSRF protection
   - Rate limiting for login attempts

### Customization

To integrate with your backend, modify the `simulateLogin()` function in `login.html`:

```javascript
async function simulateLogin(data) {
  // Replace this with your actual API call
  const response = await fetch('YOUR_API_ENDPOINT/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: data.email,
      password: data.password,
      remember: data.remember
    })
  });
  return await response.json();
}
```

## File Structure

```
xdrivelogistics/
├── index.html          # Main website file
├── login.html          # Login page
├── logo.png            # Company logo (PNG format)
├── logo.webp           # Company logo (WebP format)
├── background.jpg      # Background image (JPEG format)
├── background.webp     # Background image (WebP format)
├── robots.txt          # Search engine directives
├── sitemap.xml         # XML sitemap
├── netlify.toml        # Netlify configuration
├── .gitignore          # Git ignore rules
├── README.md           # This file
├── SECURITY.md         # Security recommendations
└── RECOMMENDATIONS.md  # Full analysis and improvements
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

© 2026 XDrive Logistics. All rights reserved.

This website is proprietary software owned by XDrive Logistics / Loadify Market LTD.
