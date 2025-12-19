# 🔧 Debugging Guide - Email & Authentication Issues

## 📧 Email Service Issues

### Problem: "Emails not being sent in production"

**Quick Fix Steps:**

1. **Test Email Configuration:**
   ```bash
   cd backend
   npm run test-email
   ```

2. **Check Production Environment Variables:**
   - `EMAIL_USER` should be: `surandinocomercializadora@gmail.com`
   - `EMAIL_PASS` should be the App Password (not regular password)
   - Verify on Render Dashboard under Environment Variables

3. **Gmail App Password Setup:**
   - Go to Google Account Settings
   - Enable 2-Factor Authentication
   - Go to App Passwords
   - Generate new App Password for "Mail"
   - Replace `EMAIL_PASS` with this 16-character password

### Problem: "404 Error on /auth/reenviar-codigo"

**Possible Causes & Solutions:**

1. **Backend Deployment Issue:**
   - Check Render logs for deployment errors
   - Verify all dependencies installed correctly
   - Ensure server.js is loading authRoutes properly

2. **Route Registration Problem:**
   ```javascript
   // Verify this line exists in server.js
   app.use('/api/auth', authRoutes);
   ```

3. **Method Not Exported:**
   ```javascript
   // Verify in authController.js exports:
   module.exports = {
     // ... other methods ...
     reenviarCodigoVerificacion,
     // ... rest of exports
   };
   ```

4. **Force Redeploy:**
   - Go to Render Dashboard
   - Manual Deploy → Clear Build Cache
   - Deploy Latest Commit

## 🔥 Firebase Popup Issues

### Problem: "Firebase: Error (auth/popup-closed-by-user)"

**Status: ✅ FIXED**
- Added proper error handling for user-cancelled popups
- No more error alerts when user intentionally closes popup
- Graceful handling of popup blocked and cancelled states

## 🚀 Quick Deployment Checklist

**Before Deploying:**
- [ ] Test email service locally: `npm run test-email`
- [ ] Verify all environment variables are set
- [ ] Check that all controller methods are exported
- [ ] Verify route registration in server.js

**After Deploying:**
- [ ] Check Render deployment logs
- [ ] Test API endpoints with Postman/curl
- [ ] Verify email sending in production
- [ ] Monitor server logs for errors

## 🐛 Debugging Commands

**Test email locally:**
```bash
cd backend
node probarEmail.js
```

**Check if endpoint is accessible:**
```bash
curl -X POST https://comercializadoraspg.onrender.com/api/auth/reenviar-codigo \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com"}'
```

**Check server logs:**
- Go to Render Dashboard → Service → Logs

## 📝 Improved Logging

The authController now includes detailed logging:
- ✅ Request received with email
- ✅ User lookup results  
- ✅ Email sending attempts
- ✅ Success/error details

Check server logs to trace the request flow and identify where issues occur.