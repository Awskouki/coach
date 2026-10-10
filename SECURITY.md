# 🔒 Security Guide

## Implemented Security Features

### ✅ 1. **Hidden Admin Access**
- Admin URL (`/admin`) is not linked anywhere on the public site
- No buttons, no hints, completely invisible to users
- Only accessible if you know the exact URL

### ✅ 2. **Password Hashing**
- Passwords are hashed using SHA-256
- Not stored in plain text
- Current password: `admin123`
- Hash: `240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9`

### ✅ 3. **Rate Limiting**
- Maximum 5 failed login attempts
- After 5 failures: **15-minute lockout**
- Prevents brute force attacks
- Shows remaining attempts to user

### ✅ 4. **Session Timeout**
- Auto-logout after **2 hours** of inactivity
- Activity tracking (mouse, keyboard, scroll, touch)
- Prevents unauthorized access if you leave computer unlocked

### ✅ 5. **Input Sanitization**
- Removes potentially dangerous characters
- Prevents XSS attacks
- Limits input length

### ✅ 6. **Security Logging**
- Logs all security events:
  - Login success/failure
  - Session timeouts
  - Rate limit blocks
  - Logout events
- Visible in browser console (can be sent to backend in production)

### ✅ 7. **Protected Routes**
- Dashboard only accessible after authentication
- Auto-redirect to login if not authenticated
- Session validation on every route

---

## 🚨 Additional Security Recommendations

### For Production Deployment:

#### 1. **HTTPS Only** (Critical)
```
✅ Always use HTTPS in production
❌ Never use HTTP for admin access
```
- Encrypts all data in transit
- Prevents man-in-the-middle attacks
- Required for secure authentication

#### 2. **Environment Variables**
Create a `.env` file (never commit to git):
```env
VITE_ADMIN_PASSWORD_HASH=your_hashed_password_here
VITE_SESSION_TIMEOUT=7200000
VITE_MAX_LOGIN_ATTEMPTS=5
```

Update `vite.config.ts`:
```typescript
export default defineConfig({
  define: {
    'import.meta.env.VITE_ADMIN_PASSWORD_HASH': JSON.stringify(process.env.VITE_ADMIN_PASSWORD_HASH)
  }
})
```

#### 3. **Backend Authentication** (Highly Recommended)
Current setup is frontend-only. For production:
- Move authentication to backend API
- Use JWT tokens or session cookies
- Store passwords with bcrypt (not SHA-256)
- Implement server-side rate limiting

Example backend structure:
```
POST /api/auth/login
  - Validates credentials on server
  - Returns JWT token
  - Sets secure HTTP-only cookie

GET /api/auth/verify
  - Validates JWT token
  - Returns user session info

POST /api/auth/logout
  - Invalidates token
  - Clears session
```

#### 4. **Database Security**
When you add a database:
- ✅ Use parameterized queries (prevent SQL injection)
- ✅ Encrypt sensitive data at rest
- ✅ Regular backups
- ✅ Limit database user permissions

#### 5. **Content Security Policy (CSP)**
Add to your `index.html`:
```html
<meta http-equiv="Content-Security-Policy" 
      content="default-src 'self'; 
               script-src 'self' 'unsafe-inline'; 
               style-src 'self' 'unsafe-inline';">
```

#### 6. **Two-Factor Authentication (2FA)**
For extra security:
- Use Google Authenticator or similar
- Require 6-digit code after password
- Libraries: `speakeasy`, `qrcode`

#### 7. **IP Whitelisting**
Restrict admin access to specific IPs:
```javascript
const ALLOWED_IPS = ['your.home.ip', 'your.office.ip'];
// Check on backend
```

#### 8. **Security Headers**
Add to your hosting configuration:
```
X-Frame-Options: DENY
X-Content-Type-Options: nosniff
X-XSS-Protection: 1; mode=block
Referrer-Policy: strict-origin-when-cross-origin
```

#### 9. **Regular Updates**
```bash
# Check for vulnerabilities
npm audit

# Fix automatically
npm audit fix

# Update dependencies
npm update
```

#### 10. **Monitoring & Alerts**
- Set up error tracking (Sentry, LogRocket)
- Monitor failed login attempts
- Alert on suspicious activity
- Regular security audits

---

## 🔑 Changing Your Password

### Method 1: Generate New Hash (Recommended)
```javascript
// Run in browser console
async function hashPassword(password) {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// Generate hash for your new password
hashPassword('your_new_password').then(console.log);
```

### Method 2: Update in Code
1. Open `src/utils/security.ts`
2. Find `ADMIN_PASSWORD_HASH`
3. Replace with your new hash
4. Rebuild the app

---

## 🛡️ Security Checklist

### Before Going Live:
- [ ] Change default password from `admin123`
- [ ] Enable HTTPS
- [ ] Set up environment variables
- [ ] Implement backend authentication (recommended)
- [ ] Add security headers
- [ ] Set up monitoring
- [ ] Test rate limiting
- [ ] Test session timeout
- [ ] Run `npm audit`
- [ ] Review all localStorage data
- [ ] Set up regular backups
- [ ] Document admin access procedures
- [ ] Test on different devices/browsers

### Monthly Maintenance:
- [ ] Review security logs
- [ ] Update dependencies
- [ ] Check for failed login attempts
- [ ] Verify backups
- [ ] Test disaster recovery

---

## 📞 Security Incident Response

If you suspect unauthorized access:

1. **Immediately:**
   - Change admin password
   - Clear all sessions: `localStorage.clear()`
   - Check for unauthorized changes in client data

2. **Investigate:**
   - Review security logs in browser console
   - Check for unusual login times
   - Verify all client data is intact

3. **Prevent:**
   - Update password to something stronger
   - Consider adding 2FA
   - Review who has access to admin URL

---

## 💡 Best Practices

1. **Strong Password:**
   - Minimum 12 characters
   - Mix of uppercase, lowercase, numbers, symbols
   - Don't use personal information
   - Don't reuse passwords

2. **Access Control:**
   - Only share admin URL with trusted people
   - Use separate accounts for different admins (future feature)
   - Log out when done

3. **Regular Monitoring:**
   - Check security logs weekly
   - Review client data for anomalies
   - Keep software updated

4. **Backup Strategy:**
   - Export client data regularly
   - Store backups securely
   - Test restore procedures

---

## 🔗 Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Web Security Basics](https://developer.mozilla.org/en-US/docs/Web/Security)
- [JWT Best Practices](https://tools.ietf.org/html/rfc8725)
- [Content Security Policy](https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP)

---

## Current Security Level: 🟡 Medium

**Good for:**
- Personal use
- Small gym with trusted access
- Development/testing

**Not recommended for:**
- Public-facing production without backend
- Multiple admin users
- Handling payment information
- Storing sensitive personal data

**To reach 🟢 High Security:**
- Implement backend authentication
- Add HTTPS
- Use environment variables
- Set up monitoring
- Regular security audits
