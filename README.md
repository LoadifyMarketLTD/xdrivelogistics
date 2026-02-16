# XDrive Logistics Website

Professional website for XDrive Logistics Ltd - UK Transport & Courier Services

## 🚀 Features

- **Fully Responsive Design** - Works seamlessly on desktop, tablet, and mobile devices
- **Mobile-First Approach** - Optimized for mobile browsing with hamburger menu navigation
- **Contact Forms with Validation** - Real-time form validation for better user experience
- **Quote Request System** - Dedicated quote request form with split layout design
- **Service Showcase** - Detailed presentation of all transport services offered
- **Fleet Presentation** - Comprehensive showcase of vehicles with specifications
- **Professional Styling** - Modern design with navy blue and gold color scheme
- **Accessibility Compliant** - WCAG 2.1 AA standards with proper ARIA labels
- **SEO Optimized** - Semantic HTML and proper meta tags for search engines

## 📋 Project Structure

```
xdrivelogistics/
├── index.html          # Homepage with hero, services, fleet preview
├── services.html       # Detailed services page with 4 service cards
├── fleet.html          # Fleet showcase with vehicle specifications
├── quote.html          # Quote request form with split layout
├── contact.html        # Contact page with form and information
├── css/
│   └── style.css      # Main stylesheet with responsive design
├── js/
│   └── main.js        # JavaScript for interactivity and validation
├── images/
│   └── .gitkeep       # Placeholder for image files
└── README.md          # This file
```

## 🎨 Design Specifications

### Color Palette
- **Primary Navy Blue:** `#1a2332` - Headers, footers, dark sections
- **Secondary Orange/Gold:** `#d4934f` - CTA buttons, accents, highlights
- **White:** `#ffffff` - Backgrounds, text on dark backgrounds
- **Light Gray:** `#f5f5f5` - Alternative section backgrounds
- **Text Dark:** `#333333` - Primary text color
- **Text Light:** `#666666` - Secondary text color

### Typography
- **Headings:** Poppins (Google Fonts)
- **Body Text:** Inter (Google Fonts)
- **Font Sizes:**
  - H1: 48px (desktop), 32px (mobile)
  - H2: 36px (desktop), 28px (mobile)
  - H3: 24px (desktop), 20px (mobile)
  - Body: 16px
  - Small: 14px

### Responsive Breakpoints
- **Mobile:** 320px - 767px
- **Tablet:** 768px - 1023px
- **Desktop:** 1024px - 1439px
- **Large Desktop:** 1440px+

## 🔧 Setup Instructions

### 1. Clone the Repository

```bash
git clone https://github.com/LoadifyMarketLTD/xdrivelogistics.git
cd xdrivelogistics
```

### 2. Update Placeholder Data

Find and replace the following placeholders in **ALL HTML files** (index.html, services.html, fleet.html, quote.html, contact.html):

#### Contact Information
- `[YOUR_PHONE_NUMBER]` → Your main phone number (e.g., "01582 123456")
- `[YOUR_MOBILE_NUMBER]` → Your mobile number (e.g., "07423 272138")
- `[YOUR_EMAIL]` → Your email address (e.g., "info@xdrivelogistics.co.uk")

#### Location Information
- `[YOUR_COMPANY_NAME]` → Official company name (e.g., "XDrive Logistics Ltd")
- `[YOUR_ADDRESS_LINE_1]` → Address line 1 (e.g., "Unit 5, Industrial Estate")
- `[YOUR_ADDRESS_LINE_2]` → Address line 2 (e.g., "High Street")
- `[YOUR_CITY]` → City (e.g., "Luton")
- `[YOUR_POSTCODE]` → UK Postcode (e.g., "LU1 3XY")
- `[YOUR_LOCATION]` → Short location (e.g., "Luton, UK")

#### Business Hours
- `[YOUR_HOURS]` → Business hours (e.g., "8:00 AM - 6:00 PM")

#### Vehicle Specifications (in fleet.html)
- `[SPECIFICATIONS]` → Replace with actual vehicle specifications

### 3. Add Images

Place the following images in the `/images` folder:

#### Required Images:
- **logo.png** - Company logo (transparent background, 200x60px recommended)
- **hero-van.jpg** - Hero section background (1920x800px, delivery van on road)
- **luton-van.jpg** - Luton van with tail lift (800x600px)
- **long-van.jpg** - Long wheelbase van (800x600px)
- **drivers.jpg** - Professional drivers or driver with vehicle (800x600px)
- **branded-vehicles.jpg** - Fleet of branded vehicles (1920x800px)
- **loading-dock.jpg** - Loading dock scene (800x600px, optional)

#### Image Guidelines:
- Use high-quality, professional photos
- Optimize images for web (use compression tools)
- Recommended formats: JPG for photos, PNG for graphics
- Include alt text for accessibility (already added in HTML)

### 4. Deploy to Hosting

The website is static HTML and can be deployed to various platforms:

#### GitHub Pages
1. Go to repository Settings
2. Navigate to Pages section
3. Select branch: `main`
4. Select folder: `/` (root)
5. Click Save
6. Site will be live at: `https://loadifymarketltd.github.io/xdrivelogistics/`

#### Netlify
1. Connect your GitHub repository to Netlify
2. Set build command: (none required)
3. Set publish directory: `/`
4. Deploy automatically on push

#### Vercel
1. Import your GitHub repository
2. Configure project (default settings work)
3. Deploy with one click

#### Traditional Hosting
1. Upload all files via FTP/SFTP
2. Ensure proper file permissions
3. Point domain to hosting directory

## 🎯 Customization Guide

### Update Colors

Edit CSS variables in `css/style.css`:

```css
:root {
  --primary-navy: #1a2332;      /* Change primary color */
  --secondary-orange: #d4934f;  /* Change accent color */
  /* Add your custom colors */
}
```

### Update Logo

Replace the Font Awesome truck icon with your logo:

In all HTML files, replace:
```html
<i class="fas fa-truck logo-icon"></i>
```

With:
```html
<img src="images/logo.png" alt="XDrive Logistics" style="height: 40px;">
```

### Form Submission

Currently, forms use JavaScript to show success messages without backend integration.

To connect to a backend service:

1. **Update `js/main.js`** - Find the form submission handlers (lines ~200-300)
2. **Replace the `setTimeout` blocks** with actual API calls:

```javascript
// Example with fetch API
fetch('YOUR_BACKEND_URL', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(formData)
})
.then(response => response.json())
.then(data => {
  // Show success message
})
.catch(error => {
  // Show error message
});
```

#### Recommended Form Services:
- **Formspree** - https://formspree.io/ (easy email forms)
- **EmailJS** - https://www.emailjs.com/ (client-side email)
- **Netlify Forms** - Built-in form handling (if hosting on Netlify)
- **Custom Backend** - Your own API endpoint

### Google Maps Integration

To add Google Maps to the contact page:

1. Get a Google Maps embed code from https://www.google.com/maps
2. In `contact.html`, find the map section (around line 130)
3. Replace the placeholder with your embed code:

```html
<div class="map-container">
  <iframe 
    src="YOUR_GOOGLE_MAPS_EMBED_URL"
    width="100%" 
    height="400" 
    style="border:0; border-radius: var(--radius-lg);" 
    allowfullscreen="" 
    loading="lazy">
  </iframe>
</div>
```

### Social Media Links

Update social media links in the footer (all HTML files):

```html
<a href="https://facebook.com/yourpage" class="social-link" aria-label="Facebook">
<a href="https://twitter.com/yourhandle" class="social-link" aria-label="Twitter">
<a href="https://linkedin.com/company/yourcompany" class="social-link" aria-label="LinkedIn">
<a href="https://instagram.com/yourhandle" class="social-link" aria-label="Instagram">
```

## 💻 Technical Details

### Dependencies
- **Google Fonts:** Poppins, Inter (loaded via CDN)
- **Font Awesome:** v6.4.0 (icons, loaded via CDN)
- **No JavaScript libraries:** Vanilla JS only

### Browser Support
- ✅ Chrome (latest 2 versions)
- ✅ Firefox (latest 2 versions)
- ✅ Safari (latest 2 versions)
- ✅ Edge (latest 2 versions)
- ✅ Mobile browsers (iOS Safari, Chrome Android)

### Performance Features
- Mobile-first CSS approach
- Lazy loading for images
- Minimal external dependencies
- Optimized CSS with CSS variables
- Efficient JavaScript with event delegation

### Accessibility Features
- Semantic HTML5 elements
- ARIA labels on interactive elements
- Keyboard navigation support
- Proper heading hierarchy
- Form labels and validation messages
- High color contrast ratios
- Screen reader friendly

### SEO Features
- Descriptive page titles
- Meta descriptions on all pages
- Semantic HTML structure
- Alt text on all images
- Clean URL structure
- Fast loading times

## 🧪 Testing

### Local Testing

Start a local web server:

```bash
# Using Python 3
python3 -m http.server 8080

# Using Node.js
npx http-server -p 8080

# Using PHP
php -S localhost:8080
```

Open your browser to `http://localhost:8080`

### Test Checklist

- [ ] All pages load correctly
- [ ] Navigation works on all pages
- [ ] Mobile menu toggles properly
- [ ] Forms validate input correctly
- [ ] Forms show success messages
- [ ] All links work (internal and external)
- [ ] Images display properly
- [ ] Responsive design works on mobile, tablet, desktop
- [ ] Contact information is updated
- [ ] No console errors in browser

### Mobile Testing

Test on actual devices or use browser DevTools:
- iPhone (Safari, Chrome)
- Android (Chrome, Samsung Internet)
- iPad (Safari)
- Tablets (various sizes)

## 🔒 Security Notes

- All form inputs are validated on client-side
- Replace placeholder contact information
- Use HTTPS when deploying
- Implement server-side validation for forms
- Sanitize all user inputs on backend
- Use environment variables for API keys
- Never commit sensitive data to repository

## 📝 Maintenance

### Regular Updates

- Update contact information as needed
- Add new images to showcase fleet
- Update services and pricing
- Refresh testimonials periodically
- Check for broken links monthly
- Update copyright year annually

### Code Updates

- Keep dependencies up to date (Font Awesome, Google Fonts)
- Test on new browser versions
- Monitor site performance
- Check accessibility compliance
- Update meta descriptions for SEO

## 🐛 Troubleshooting

### Forms Not Submitting
- Check browser console for JavaScript errors
- Verify form IDs match JavaScript selectors
- Ensure form validation is working
- Test backend endpoint if connected

### Images Not Loading
- Check file paths are correct
- Verify images are in `/images` folder
- Check file names match HTML references
- Ensure images are web-optimized

### Mobile Menu Not Working
- Clear browser cache
- Check JavaScript is loading
- Verify hamburger button event listener
- Test on different browsers

### Styling Issues
- Clear browser cache
- Check CSS file is loading
- Verify CSS path in HTML
- Test on different browsers

## 📄 License

© 2026 XDrive Logistics Ltd. All rights reserved.

This website is proprietary software owned by XDrive Logistics Ltd.

## 📞 Support

For technical support or questions:

- **Email:** [YOUR_EMAIL]
- **Phone:** [YOUR_PHONE_NUMBER]
- **Website:** https://xdrivelogistics.co.uk

## 🙏 Acknowledgments

- Google Fonts for typography
- Font Awesome for icons
- GitHub for hosting and version control

---

**Last Updated:** February 2026  
**Version:** 1.0  
**Built with:** HTML5, CSS3, JavaScript (Vanilla)
