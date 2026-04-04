# 🚀 QUICK DEPLOYMENT START (Copy-Paste Ready)

## STEP 1: Deploy Backend on Render (5 minutes)

### 1A. Open Render
```
https://render.com
Login with GitHub
```

### 1B. Create Web Service
```
New + → Web Service
Select: yashvi-746/inventiq-backend
Connect
```

### 1C. Configure
```
Name: inventiq-api
Environment: Node
Build Command: npm install
Start Command: npm start
Region: Singapore (or nearest)
Plan: Free
```

### 1D. Environment Variables
Copy and paste these EXACTLY:

```
PORT=5000
NODE_ENV=production
GROQ_API_KEY=gsk_your_groq_api_key_here
JWT_SECRET=inventiq_jwt_secret_2024_yashvi
CLIENT_URL=LEAVE_EMPTY_FOR_NOW
MONGO_URI=mongodb+srv://admin:yashvi123@yashvicluster.tfra1ok.mongodb.net/inventiq?retryWrites=true&w=majority
```

### 1E. Deploy
```
Click: Create Web Service
Wait: 2-3 minutes

Your Backend URL:
https://inventiq-api.onrender.com

Test it:
https://inventiq-api.onrender.com/api/health
```

✅ **Save backend URL for later**

---

## STEP 2: Deploy Frontend on Vercel (3 minutes)

### 2A. Open Vercel
```
https://vercel.com
Login with GitHub
```

### 2B. Import Project
```
Add New → Project
Import Git Repository
Paste: https://github.com/yashvi-746/inventiq-frontend
Continue
```

### 2C. Configure
```
Project Name: inventiq-frontend
Framework Preset: Vite
Root Directory: ./
Build Command: npm run build
Output Directory: dist
Install Command: npm install
```

### 2D. Environment Variable
```
VITE_API_URL=https://inventiq-api.onrender.com
(Use your actual backend URL from Step 1E)
```

### 2E. Deploy
```
Click: Deploy
Wait: 1-2 minutes

Your Frontend URL:
https://inventiq-frontend.vercel.app
```

✅ **Test it:**
```
Open: https://inventiq-frontend.vercel.app
Should see: Login page
```

---

## STEP 3: Update Backend with Frontend URL (1 minute)

### Go back to Render
```
3A. Open: https://render.com
3B. Click: inventiq-api service
3C. Click: Environment (in the sidebar)
3D. Find: CLIENT_URL variable
3E. Update to: https://inventiq-frontend.vercel.app
3F. Click: Save
3G. Wait for auto-redeploy (1-2 min)
```

---

## STEP 4: Test Everything! 🧪

### Test 1: Backend Health
```
URL: https://inventiq-api.onrender.com/api/health
Expected Response: {"status":"InventIQ server running"}
```

### Test 2: Frontend Loads
```
URL: https://inventiq-frontend.vercel.app
Expected: Login page
Console: No errors (F12 → Console tab)
```

### Test 3: Registration
```
1. Click "Register" on login page
2. Fill form:
   - Email: test@example.com
   - Password: Test123!
   - Name: Test User
   - Shop Name: My Shop
3. Click Register
4. Should redirect to Dashboard
5. Should show welcome message
```

### Test 4: API Integration
```
1. Open DevTools: F12
2. Go to Network tab
3. Try clicking any button on dashboard
4. Check network requests:
   - Should go to: https://inventiq-api.onrender.com/api/*
   - Status should be: 200 (green)
   - Should NOT see 404 or 500 errors
```

---

## 📍 Your Final URLs

### FRONTEND (Share this with users)
```
https://inventiq-frontend.vercel.app
```

### BACKEND API (For developers)
```
https://inventiq-api.onrender.com/api
```

### HEALTH CHECK (Verify backend is up)
```
https://inventiq-api.onrender.com/api/health
```

---

## ⚠️ If Something Goes Wrong

### Problem: "Cannot get /api/health"
```
Solution: Wait 30 seconds (Render startup)
Or: Backend might still be deploying
Check Render logs
```

### Problem: "CORS Error" / "Network request failed"
```
Solution 1: Verify VITE_API_URL on Vercel is correct
Solution 2: Clear browser cache (Ctrl+Shift+Del)
Solution 3: Hard refresh (Ctrl+F5)
Solution 4: Check Render CLIENT_URL has Vercel URL
```

### Problem: "Cannot POST /api/auth/register"
```
Solution: Frontend not connected to backend
1. Check VITE_API_URL in Vercel environment
2. Redeploy Vercel (Deployments → Redeploy)
3. Check backend is running
4. Check CORS on backend (should be fine)
```

### Problem: Long loading (30+ seconds)
```
Reason: Free tier Render sleeps after inactivity
Solution: Normal behavior, upgrade to paid for instant response
Or: Just wait, it will wake up
```

---

## 🎉 Deployment Complete!

**Congratulations!** Your InventIQ app is now live! 

You have:
✅ Backend running on Render
✅ Frontend running on Vercel
✅ Deployed to production
✅ Database connected
✅ AI integration working
✅ Live URLs for users

---

## 📚 Advanced (Optional)

### Setup Auto-Deploy on Git Push
```
Both Render and Vercel auto-deploy on GitHub push!
Just push changes:
git add .
git commit -m "Feature description"
git push
```

### Add Custom Domain
```
Vercel: Settings → Domains
Render: Settings → Custom Domain
```

### Setup Monitoring
```
Vercel: Analytics (built-in)
Render: Logs and alerts available
```

### Upgrade for Better Performance
```
Render: $12/month (paid instance)
Vercel: Pay per usage (very cheap)
```

---

## 🔍 Debugging Endpoints

Test these manually in browser:

```
Backend Health:
https://inventiq-api.onrender.com/api/health

Register (via curl):
curl -X POST https://inventiq-api.onrender.com/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","email":"test@example.com","password":"123456","shopName":"Shop"}'

Login (via curl):
curl -X POST https://inventiq-api.onrender.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"123456"}'
```

---

## 📞 Support

If stuck:
1. Check the logs (Render → Logs tab)
2. Check environment variables
3. Clear browser cache
4. Try hard refresh (Ctrl+F5)
5. Wait for deployment to complete

**You've got this!** 🚀
