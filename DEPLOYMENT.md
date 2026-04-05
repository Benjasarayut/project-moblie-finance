# ThaiBank Deployment Guide 🚀

## Quick Deploy (3 Steps)

### 1. **Localhost Testing** ✅ (You are here)

```bash
cd /home/labadmin/project-moblie-finance
python3 -m http.server 8080 --directory .

# Then visit: http://localhost:8080/public/install.html
```

### 2. **Production Deploy** (Pick One)

#### **Option A: Firebase (Recommended)**

```bash
# Install Firebase CLI
npm install -g firebase-tools

# Login
firebase login

# Initialize in your project folder
firebase init hosting

# Deploy
firebase deploy

# Your app is live at: https://yourproject.firebaseapp.com
```

#### **Option B: GitHub Pages (Free, Static)**

```bash
# Create repo: yourusername/thaibank
cd /home/labadmin/project-moblie-finance

git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/yourusername/thaibank.git
git push -u origin main

# In GitHub repo settings:
# - Go to Settings → Pages
# - Source: Deploy from a branch
# - Branch: main, folder: /public
# - Your app is live at: https://yourusername.github.io/thaibank/
```

**Update manifest.json:**
```json
{
  "start_url": "https://yourusername.github.io/thaibank/login.html",
  "scope": "/thaibank/"
}
```

#### **Option C: Self-Hosted (DigitalOcean/Linode)**

```bash
# Upload files via SCP
scp -r /home/labadmin/project-moblie-finance/public/* \
  root@your-server.com:/var/www/thaibank/

# Or use rsync
rsync -avz public/ root@your-server.com:/var/www/thaibank/

# On your server, setup nginx
sudo nano /etc/nginx/sites-available/thaibank
```

**Nginx config:**
```nginx
server {
    listen 443 ssl http2;
    server_name thaibank.yourdomain.com;
    root /var/www/thaibank;
    
    ssl_certificate /etc/letsencrypt/live/thaibank.yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/thaibank.yourdomain.com/privkey.pem;
    
    location / {
        try_files $uri $uri/ /login.html;
    }
    
    # Cache static assets
    location ~* \.(js|css|png|jpg|svg)$ {
        expires 30d;
        add_header Cache-Control "public, immutable";
    }
    
    # No cache for HTML
    location ~* \.html$ {
        add_header Cache-Control "no-cache, must-revalidate";
    }
}
```

**Enable and restart:**
```bash
sudo ln -s /etc/nginx/sites-available/thaibank /etc/nginx/sites-enabled/
sudo systemctl restart nginx
```

#### **Option D: Docker Deployment**

**Dockerfile:**
```dockerfile
FROM python:3.9-slim
WORKDIR /app
COPY public/ .
EXPOSE 8080
CMD ["python3", "-m", "http.server", "8080", "--directory", "."]
```

**Deploy:**
```bash
docker build -t thaibank .
docker run -p 8080:8080 thaibank
# Visit: http://localhost:8080/login.html
```

---

## 📋 Pre-Deployment Checklist

### **Code Quality**
- [ ] Remove all `console.log()` statements
- [ ] No test credentials in code
- [ ] No hardcoded API keys
- [ ] All images/assets optimized

### **Security**
- [ ] HTTPS enabled (required for PWA)
- [ ] Service Worker cached properly
- [ ] Manifest.json valid
- [ ] No XSS vulnerabilities
- [ ] No exposed sensitive data

### **Performance**
- [ ] JavaScript minified (~50KB → ~20KB)
- [ ] CSS minified (~23KB → ~15KB)
- [ ] Images optimized
- [ ] Service Worker caching works
- [ ] Load time < 3 seconds on 3G

### **Testing**
- [ ] Works on Chrome Android
- [ ] Works on Safari iOS 13+
- [ ] Works offline
- [ ] Install prompt shows
- [ ] App icons display
- [ ] Responsive on 320px width

### **Browser Support**
- [ ] Chrome 90+
- [ ] Edge 90+
- [ ] Firefox 88+
- [ ] Safari 14.1+ (iOS)
- [ ] Samsung Internet 14+

---

## 🔍 Verification After Deploy

### **Check HTTPS**
```bash
curl -I https://yourdomain.com/login.html
# Should show: HTTP/1.1 200 OK
```

### **Test Service Worker**
```bash
curl -I https://yourdomain.com/manifest.json
# Should show correct content-type: application/json
```

### **Validate Manifest**
https://manifest-validator.appspot.com/

### **Lighthouse Audit**
- Open DevTools (F12)
- Click "Lighthouse"
- Run audit
- Fix any warnings

---

## 🎯 Production Updates

### **Update Service Worker Version**

In `src/js/service-worker.js`:
```javascript
const CACHE_NAME = 'thaibank-v2';  // Increment version
```

In `public/login.html`:
```html
<script>
  navigator.serviceWorker.register('../src/js/service-worker.js?v=20260406')
    // Version bumped above
</script>
```

### **Update Manifest**

In `public/manifest.json`:
```json
{
  "version": "1.1.0",
  "start_url": "https://your-production-domain.com/login.html"
}
```

---

## 📊 Monitoring

### **Check Uptime**
- UptimeRobot: https://uptimerobot.com
- Pingdom: https://www.pingdom.com

### **Monitor Performance**
- Google PageSpeed Insights
- WebPageTest: https://www.webpagetest.org

### **Error Tracking**
- Sentry: https://sentry.io
- LogRocket: https://logrocket.com

---

## 🆘 Troubleshooting

### **Install Prompt Not Showing**

❌ Problem: User can't install app
✅ Solutions:
- Must be HTTPS (not HTTP)
- Service Worker must be active
- Manifest must be valid
- First 2 visits for engagement

```bash
# Test Service Worker activation
curl -I https://yourdomain.com
# Must return: Cache-Control headers
```

### **App Not Loading Offline**

❌ Problem: Offline page shows 503
✅ Solutions:
- Check Service Worker caches files
- Verify URLs in urlsToCache
- Check browser DevTools → Application

```javascript
// In service-worker.js, increase cache list
const urlsToCache = [
  '/login.html',
  '/index.html',
  '/manifest.json',
  '/src/css/style.css',
  '/src/js/db.js'
];
```

### **CORS Errors**

❌ Problem: "Access to XMLHttpRequest blocked"
✅ Solutions:
- Add CORS headers to API calls
- Use proxy for cross-origin requests
- Check manifest scope

```nginx
# In nginx config
add_header Access-Control-Allow-Origin "*";
add_header Access-Control-Allow-Methods "GET, POST, PUT, DELETE";
```

---

## 📦 Build Optimization

### **Minify JavaScript**

```bash
npm install -g uglify-js
uglifyjs src/js/db.js -c -m -o src/js/db.min.js
```

### **Minify CSS**

```bash
npm install -g cssnano-cli
cssnano src/css/style.css -o src/css/style.min.css
```

### **Optimize Images**

```bash
# Install ImageMagick
sudo apt-get install imagemagick

# Compress PNG
convert input.png -quality 85 -strip output.png

# Convert to WEBP
cwebp input.png -o output.webp
```

---

## 🎓 Learning Resources

- **PWA Basics**: https://web.dev/progressive-web-apps/
- **Deployment**: https://web.dev/deploy/
- **Firebase Hosting**: https://firebase.google.com/docs/hosting/quickstart
- **GitHub Pages**: https://pages.github.com/

---

## ✅ After Deployment

1. **Share with Users**
   - Short link: https://bit.ly/thaibank-app
   - QR code: Generate from link
   - Email: Announcement with install link

2. **Collect Feedback**
   - User testing form
   - Browser console errors
   - Offline functionality reports

3. **Monitor & Improve**
   - Track installation numbers
   - Monitor error logs
   - Gather user feedback
   - Plan v2 features

---

**Status**: Ready to Deploy ✅  
**Last Updated**: 2025-04-05
