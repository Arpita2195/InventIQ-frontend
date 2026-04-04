# InventIQ Deployment Guide

## ✅ Pre-Deployment Checklist

### Backend (Server)
- [x] All dependencies in package.json
- [x] .env.example file created
- [x] CORS configured for production
- [x] Error handling implemented
- [x] PORT environment variable used
- [x] JWT authentication setup
- [x] Database connection configured

### Frontend (Client)
- [x] All dependencies in package.json
- [x] .env.example file created
- [x] API base URL configurable
- [x] Build script ready
- [x] Environment variable for API URL

### Git Setup
- [x] .gitignore files created
- [x] Ready for GitHub

---

## 🚀 Deployment Steps

### 1. GitHub Setup
```bash
cd inventiq_white_groq/inventiq
git init
git add .
git commit -m "Initial project setup"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/inventiq.git
git push -u origin main
```

### 2. Deploy Backend on Render
1. Go to https://render.com
2. Click "New +" → "Web Service"
3. Connect GitHub repo
4. Configure:
   - **Name:** inventiq-api
   - **Environment:** Node
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
5. Set Environment Variables:
   ```
   PORT=5000
   NODE_ENV=production
   GROQ_API_KEY=<your_key>
   JWT_SECRET=<your_secret>
   CLIENT_URL=https://inventiq.vercel.app
   MONGO_URI=<your_mongodb_uri>
   ```
6. Deploy and get URL (e.g., https://inventiq-api.onrender.com)

### 3. Deploy Frontend on Vercel
1. Go to https://vercel.com
2. Connect GitHub repo
3. Project settings:
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
4. Set Environment Variables:
   ```
   VITE_API_URL=https://inventiq-api.onrender.com
   ```
5. Deploy

---

## ⚠️ Known Issues & Solutions

### Issue: API 404 errors on production
**Solution:** Make sure VITE_API_URL is set correctly on Vercel

### Issue: CORS errors
**Solution:** Backend CORS is configured to accept:
- http://localhost:5173
- http://localhost:3000
- Your Vercel URL
- Your Render URL

### Issue: Environment variables not loaded
**Solution:** 
- Create `.env` file in both server and client
- Copy from `.env.example` files
- Never commit `.env` to GitHub

---

## 🔍 Files to Check

- ✅ `server/index.js` - CORS properly configured
- ✅ `server/.gitignore` - Excludes .env and node_modules
- ✅ `server/package.json` - All dependencies present
- ✅ `client/src/api/axiosInstance.js` - Uses VITE_API_URL
- ✅ `client/.gitignore` - Excludes .env and node_modules
- ✅ `client/package.json` - Build scripts configured

---

## 📝 Environment Variables Needed

### For Render Backend:
- PORT
- NODE_ENV
- GROQ_API_KEY
- JWT_SECRET
- CLIENT_URL
- MONGO_URI

### For Vercel Frontend:
- VITE_API_URL

---

## ✨ Ready to Deploy!
All files are configured and ready for production deployment.
