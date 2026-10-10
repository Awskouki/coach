# 🚀 Deployment Guide

## Quick Deployment Options

### Option 1: Vercel (Recommended - Free & Easy)

**Why Vercel:**
- ✅ Free hosting
- ✅ Automatic HTTPS
- ✅ Fast global CDN
- ✅ Easy deployment
- ✅ Custom domain support

**Steps:**

1. **Install Vercel CLI:**
```bash
npm install -g vercel
```

2. **Login to Vercel:**
```bash
vercel login
```

3. **Deploy:**
```bash
npm run build
vercel --prod
```

4. **Configure:**
- Project name: `carthage-coach-manager`
- Framework: `Vite`
- Build command: `npm run build`
- Output directory: `dist`

5. **Custom Domain (Optional):**
- Go to Vercel dashboard
- Settings → Domains
- Add your domain (e.g., `coachaymen.tn`)

**Environment Variables on Vercel:**
- Dashboard → Settings → Environment Variables
- Add: `VITE_ADMIN_PASSWORD_HASH`

---

### Option 2: Netlify (Also Free & Easy)

**Steps:**

1. **Install Netlify CLI:**
```bash
npm install -g netlify-cli
```

2. **Login:**
```bash
netlify login
```

3. **Deploy:**
```bash
npm run build
netlify deploy --prod --dir=dist
```

4. **Configure:**
- Build command: `npm run build`
- Publish directory: `dist`

**Add `netlify.toml`:**
```toml
[build]
  command = "npm run build"
  publish = "dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

---

### Option 3: GitHub Pages (Free)

**Steps:**

1. **Install gh-pages:**
```bash
npm install --save-dev gh-pages
```

2. **Update `package.json`:**
```json
{
  "scripts": {
    "predeploy": "npm run build",
    "deploy": "gh-pages -d dist"
  },
  "homepage": "https://yourusername.github.io/carthage-coach-manager"
}
```

3. **Update `vite.config.ts`:**
```typescript
export default defineConfig({
  base: '/carthage-coach-manager/',
  // ... rest of config
})
```

4. **Deploy:**
```bash
npm run deploy
```

---

### Option 4: Traditional Hosting (cPanel, etc.)

**Steps:**

1. **Build the app:**
```bash
npm run build
```

2. **Upload `dist` folder contents to your hosting:**
- Via FTP/SFTP
- Or cPanel File Manager
- Upload to `public_html` or `www` folder

3. **Configure `.htaccess` (for Apache):**
```apache
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  RewriteRule ^index\.html$ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule . /index.html [L]
</IfModule>
```

---

## Pre-Deployment Checklist

### 🔒 Security
- [ ] Change admin password from `admin123`
- [ ] Generate new password hash
- [ ] Update `ADMIN_PASSWORD_HASH` in `src/utils/security.ts`
- [ ] Test login with new password
- [ ] Verify HTTPS is enabled
- [ ] Test rate limiting (try 5 wrong passwords)
- [ ] Test session timeout

### 🎨 Branding
- [ ] Update coach name if not "Coach Aymen"
- [ ] Update phone number in landing page
- [ ] Update email address
- [ ] Update social media links
- [ ] Add real testimonials
- [ ] Update location details
- [ ] Add real photos/images (optional)

### 📝 Content
- [ ] Review all text for accuracy
- [ ] Check pricing (450 TND / 800 TND)
- [ ] Verify subscription durations
- [ ] Update contact information
- [ ] Test sign-up form
- [ ] Test all navigation links

### 🧪 Testing
- [ ] Test on mobile devices
- [ ] Test on different browsers (Chrome, Firefox, Safari)
- [ ] Test sign-up flow
- [ ] Test admin login
- [ ] Test client CRUD operations
- [ ] Test session scheduling
- [ ] Test payment tracking
- [ ] Test reminder system
- [ ] Test logout
- [ ] Clear localStorage and test fresh

### 🌐 SEO & Performance
- [ ] Add favicon
- [ ] Update page title in `index.html`
- [ ] Add meta description
- [ ] Add Open Graph tags for social sharing
- [ ] Test page load speed
- [ ] Optimize images (if added)

---

## Post-Deployment

### 1. **Test Everything**
```bash
# Test URLs
https://yoursite.com/              # Landing page
https://yoursite.com/admin         # Admin login
https://yoursite.com/admin/dashboard  # Dashboard (after login)
```

### 2. **Monitor**
- Check browser console for errors
- Test on mobile
- Ask a friend to test sign-up
- Monitor sign-up requests in admin

### 3. **Backup**
- Export client data regularly
- Keep backup of localStorage data
- Document admin credentials securely

### 4. **Analytics (Optional)**
Add Google Analytics to `index.html`:
```html
<!-- Google Analytics -->
<script async src="https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'GA_MEASUREMENT_ID');
</script>
```

---

## Custom Domain Setup

### For Vercel:
1. Buy domain (Namecheap, GoDaddy, etc.)
2. In Vercel dashboard: Settings → Domains
3. Add your domain
4. Update DNS records at your registrar:
   ```
   Type: A
   Name: @
   Value: 76.76.21.21

   Type: CNAME
   Name: www
   Value: cname.vercel-dns.com
   ```

### For Netlify:
1. In Netlify dashboard: Domain settings
2. Add custom domain
3. Update DNS:
   ```
   Type: A
   Name: @
   Value: 75.2.60.5

   Type: CNAME
   Name: www
   Value: your-site.netlify.app
   ```

---

## Troubleshooting

### Issue: 404 on refresh
**Solution:** Configure redirects (see hosting-specific instructions above)

### Issue: Admin login not working
**Solution:** 
- Clear browser cache
- Check password hash is correct
- Check browser console for errors

### Issue: Sign-ups not appearing
**Solution:**
- Check localStorage in browser DevTools
- Verify `signup_requests` key exists
- Test in incognito mode

### Issue: Styles not loading
**Solution:**
- Hard refresh: Ctrl+Shift+R
- Clear browser cache
- Check build output includes CSS files

### Issue: Can't access /admin
**Solution:**
- Ensure routing is configured (redirects)
- Check `.htaccess` or `netlify.toml`
- Verify build completed successfully

---

## Updating Your Site

### Method 1: Automatic (Vercel/Netlify with Git)
1. Push changes to GitHub
2. Automatic deployment triggers
3. Site updates in ~2 minutes

### Method 2: Manual
1. Make changes locally
2. Test: `npm run dev`
3. Build: `npm run build`
4. Deploy: `vercel --prod` or `netlify deploy --prod`

### Method 3: Traditional Hosting
1. Build: `npm run build`
2. Upload new `dist` folder contents via FTP
3. Replace old files

---

## Performance Optimization

### 1. **Code Splitting**
Update `vite.config.ts`:
```typescript
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom'],
          'chart-vendor': ['recharts'],
          'motion-vendor': ['motion']
        }
      }
    }
  }
})
```

### 2. **Image Optimization**
- Use WebP format
- Compress images (TinyPNG, Squoosh)
- Lazy load images

### 3. **Caching**
Add to `vercel.json` or `netlify.toml`:
```json
{
  "headers": [
    {
      "source": "/assets/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=31536000, immutable"
        }
      ]
    }
  ]
}
```

---

## Maintenance Schedule

### Daily:
- Check for new sign-ups
- Respond to client requests

### Weekly:
- Review security logs
- Backup client data
- Check for errors

### Monthly:
- Update dependencies: `npm update`
- Security audit: `npm audit`
- Review and optimize

### Quarterly:
- Review and update content
- Check analytics
- Plan new features

---

## Support & Resources

- **Vite Docs:** https://vitejs.dev/
- **React Docs:** https://react.dev/
- **Vercel Docs:** https://vercel.com/docs
- **Netlify Docs:** https://docs.netlify.com/

---

## Cost Estimate

### Free Tier (Recommended for Starting):
- **Hosting:** Free (Vercel/Netlify)
- **Domain:** ~$10-15/year
- **SSL:** Free (included)
- **Total:** ~$10-15/year

### Paid Tier (For Growth):
- **Hosting:** $20/month (Vercel Pro)
- **Domain:** $10-15/year
- **Backend API:** $5-10/month (if needed)
- **Database:** $5-10/month (if needed)
- **Total:** ~$30-40/month

---

## Next Steps After Deployment

1. ✅ Share landing page URL with potential clients
2. ✅ Bookmark admin URL for easy access
3. ✅ Test sign-up flow with a friend
4. ✅ Add site to Google Search Console
5. ✅ Share on social media
6. ✅ Print business cards with website URL
7. ✅ Monitor sign-ups daily
8. ✅ Respond to inquiries promptly

**Your gym management system is ready to go! 🎉**
