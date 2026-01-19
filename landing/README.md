# Sentinel Landing Page

Static landing page for Sentinel Community Edition - secret management built for AI agents.

## Overview

This is a single-page marketing site built with vanilla HTML, CSS, and minimal JavaScript. No build tools or dependencies required.

**Files:**
- `index.html` - Main landing page
- `styles.css` - All styling (dark mode, responsive)
- `README.md` - This file

**Total size:** ~50KB (well under the 100KB constraint)

## Features

- **Zero dependencies** - Pure HTML/CSS/JS
- **Fast loading** - Optimized for performance
- **Responsive** - Mobile-first design
- **Dark mode** - Developer-friendly aesthetic
- **SEO ready** - Semantic HTML with meta tags

## Quick Start

### Local Development

Simply open `index.html` in your browser:

```bash
# Option 1: Direct open
open index.html  # macOS
xdg-open index.html  # Linux
start index.html  # Windows

# Option 2: Local server (recommended)
python3 -m http.server 8000
# Visit http://localhost:8000

# Option 3: Using Node.js
npx serve .
```

### Deployment

This static site can be deployed to any hosting platform:

#### Vercel (Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy from this directory
cd sentinel/landing
vercel

# Set custom domain in Vercel dashboard
```

#### Netlify

```bash
# Install Netlify CLI
npm i -g netlify-cli

# Deploy
cd sentinel/landing
netlify deploy --prod --dir .
```

#### Cloudflare Pages

1. Push to GitHub
2. Connect repo to Cloudflare Pages
3. Build settings:
   - Build command: (leave empty)
   - Build output directory: `/`
   - Root directory: `sentinel/landing`

#### GitHub Pages

```bash
# From repo root
git subtree push --prefix sentinel/landing origin gh-pages

# Or configure in Settings > Pages > Source
```

#### Self-Hosted

Upload files to any web server:

```bash
# Example: SCP to your server
scp -r sentinel/landing/* user@server:/var/www/sentinel/

# Or use rsync
rsync -avz sentinel/landing/ user@server:/var/www/sentinel/
```

## Customization

### Update Content

Edit `index.html` directly. Key sections:

- **Hero** - Line 28-62: Main headline and CTA
- **Problem/Solution** - Line 66-94: Value proposition
- **Features** - Line 98-140: Feature cards
- **Pricing** - Line 171-239: Pricing tiers
- **Testimonials** - Line 253-285: Social proof
- **Footer** - Line 313-353: Links and legal

### Styling

Edit `styles.css` for visual changes:

- **Colors** - Line 10-23: CSS custom properties (variables)
- **Typography** - Line 15: Font family
- **Spacing** - Section padding values
- **Responsive** - Line 578-659: Media queries

### Links

Update these placeholder links:

1. GitHub repo URL: `https://github.com/subcode-ventures/sentinel`
2. Cloud signup: Change `#contact` to actual signup URL
3. Sales email: `sales@subcode.ventures`
4. Documentation: Link to actual docs site

### Analytics

Add tracking before `</body>` tag in `index.html`:

```html
<!-- Google Analytics -->
<script async src="https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'GA_MEASUREMENT_ID');
</script>

<!-- Or use Plausible (privacy-friendly) -->
<script defer data-domain="sentinel.yourdomain.com" src="https://plausible.io/js/script.js"></script>
```

## SEO Optimization

The page includes basic SEO:

- Semantic HTML5 structure
- Meta description tag
- Open Graph tags (add these):

```html
<meta property="og:title" content="Sentinel - Secret Management for AI Agents">
<meta property="og:description" content="Open-source secret management built for autonomous AI agents">
<meta property="og:image" content="https://yourdomain.com/og-image.png">
<meta property="og:url" content="https://yourdomain.com">
<meta name="twitter:card" content="summary_large_image">
```

### Sitemap

Create `sitemap.xml`:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://yourdomain.com/</loc>
    <lastmod>2026-01-18</lastmod>
    <priority>1.0</priority>
  </url>
</urlset>
```

### robots.txt

Create `robots.txt`:

```
User-agent: *
Allow: /

Sitemap: https://yourdomain.com/sitemap.xml
```

## Performance

Current optimizations:

- No external CSS/JS dependencies
- Minimal inline JavaScript
- System fonts (no web font loading)
- CSS custom properties for theming
- Efficient selectors

### Additional Optimizations

If you need better performance:

1. **Minify CSS/HTML**
   ```bash
   # Using online tools or:
   npm i -g html-minifier clean-css-cli
   html-minifier --collapse-whitespace index.html -o index.min.html
   cleancss -o styles.min.css styles.css
   ```

2. **Add resource hints**
   ```html
   <link rel="preconnect" href="https://github.com">
   ```

3. **Lazy load images** (when you add them)
   ```html
   <img src="image.jpg" loading="lazy" alt="Description">
   ```

## Domain Setup

Once deployed, configure your custom domain:

### Vercel
1. Project Settings > Domains
2. Add `sentinel.yourdomain.com`
3. Configure DNS CNAME record

### Netlify
1. Site Settings > Domain Management
2. Add custom domain
3. Configure DNS

### Cloudflare Pages
1. Custom Domains > Set up a custom domain
2. Domain automatically added to Cloudflare DNS

## Maintenance

### Regular Updates

- Update GitHub star count in stats section
- Add new testimonials as they come in
- Refresh screenshots/demos
- Keep pricing current
- Update feature list as product evolves

### Testing

Test across browsers:

- Chrome/Edge (Chromium)
- Firefox
- Safari (macOS/iOS)
- Mobile devices (responsive)

### Monitoring

Set up:
- Uptime monitoring (e.g., UptimeRobot, Pingdom)
- Performance monitoring (e.g., PageSpeed Insights)
- Analytics dashboard

## Support

For issues or questions:

- Technical: Open issue in main repo
- Content: Contact marketing team
- Urgent: Email hello@subcode.ventures

## License

MIT (same as Sentinel Community Edition)
