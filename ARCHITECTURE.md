# InventIQ Deployment Architecture

## 🏗️ System Architecture

```
┌────────────────────────────────────────────────────────────────┐
│                     PRODUCTION SETUP                           │
├────────────────────────────────────────────────────────────────┤
│                                                                │
│  GitHub Repositories:                                         │
│  ├── yashvi-746/inventiq-backend                              │
│  └── yashvi-746/inventiq-frontend                             │
│                                                                │
│  ────────────────────────────────────────────────────────     │
│                                                                │
│  BACKEND (Render)                FRONTEND (Vercel)           │
│  ┌──────────────────────┐        ┌──────────────────────┐    │
│  │  inventiq-api        │        │  inventiq-frontend   │    │
│  │  Node.js/Express     │   ←→   │  React/Vite          │    │
│  │  JWT Auth            │        │  UI Components       │    │
│  │  REST APIs           │        │  State Management    │    │
│  │  Groq AI Chat        │        │  Form Validation     │    │
│  │                      │        │                      │    │
│  │ https://inventiq-    │        │ https://inventiq-    │    │
│  │ api.onrender.com     │        │ frontend.vercel.app  │    │
│  └──────────────────────┘        └──────────────────────┘    │
│           ↓                                     ↑              │
│           │                                     │              │
│  ┌────────▼──────────────────────────────────────┐            │
│  │   MONGODB ATLAS (Cloud Database)              │            │
│  │   Collections: users, inventory, chats        │            │
│  │   Connection: Cloud hosted                    │            │
│  └───────────────────────────────────────────────┘            │
│                                                                │
│  ┌────────────────────────────────────────────────┐            │
│  │   GROQ API (AI Chat)                           │            │
│  │   Hosted externally, called by backend         │            │
│  └────────────────────────────────────────────────┘            │
│                                                                │
└────────────────────────────────────────────────────────────────┘
```

## 📊 Data Flow

```
USER BROWSER
    ↓
https://inventiq-frontend.vercel.app
    ↓
React App Loads
    ↓
Login / Register Form
    ↓
POST to https://inventiq-api.onrender.com/api/auth/login
    ↓
Express Server Processes
    ↓
JWT Token Generated
    ↓
Token Stored in Frontend
    ↓
All Requests → Authorization: Bearer <token>
    ↓
Backend Validates + MongoDB Query
    ↓
Response → Frontend
    ↓
UI Updates
```

## 🔐 Environment Variables Summary

### Backend (Render)
| Variable | Value | Purpose |
|----------|-------|---------|
| `PORT` | 5000 | Server port |
| `NODE_ENV` | production | Disable debug mode |
| `GROQ_API_KEY` | gsk_sxcB... | AI chat API |
| `JWT_SECRET` | inventiq_jwt_... | Token encryption |
| `CLIENT_URL` | https://inventiq-frontend.vercel.app | CORS whitelist |
| `MONGO_URI` | mongodb+srv://... | Database connection |

### Frontend (Vercel)
| Variable | Value | Purpose |
|----------|-------|---------|
| `VITE_API_URL` | https://inventiq-api.onrender.com | Backend URL |

## ⚡ Deployment Timeline

```
BEFORE DEPLOYMENT
├── Code ready locally ✓
├── GitHub repos created ✓
├── Code pushed to GitHub ✓
└── Environment variables prepared ✓

DEPLOYMENT (approx time)
├── Render Backend (2-3 min)
│   ├── Pull code from GitHub
│   ├── Install dependencies
│   ├── Build server
│   ├── Start process
│   └── Get URL ✓
├── Vercel Frontend (1-2 min)
│   ├── Pull code from GitHub
│   ├── Install dependencies
│   ├── Build (npm run build)
│   ├── Upload dist folder
│   └── Get URL ✓
└── Update Backend CLIENT_URL (1 min)
    └── Render redeploys automatically

TOTAL TIME: 5-7 minutes

AFTER DEPLOYMENT
└── Live! ✓
```

## 🔗 URL References

### Development
```
Frontend: http://localhost:5173
Backend: http://localhost:5000/api
Health: http://localhost:5000/api/health
```

### Production
```
Frontend: https://inventiq-frontend.vercel.app
Backend: https://inventiq-api.onrender.com/api
Health: https://inventiq-api.onrender.com/api/health
```

## 📈 Expected Performance

| Metric | Value |
|--------|-------|
| First Page Load | 1-2 seconds (Vercel) |
| API Response | 100-200ms (Render) |
| Database Query | 50-100ms |
| Total Round Trip | ~300-400ms |
| Initial Backend Wake-up | 30s (free tier) |

## 🎯 Success Indicators

✅ Frontend loads without errors
✅ Login page displays
✅ Can register new user
✅ Can login with registered account
✅ Dashboard loads data
✅ API calls return 200 status
✅ No CORS errors in console
✅ No 404 errors
✅ Database operations work

## ⚠️ Common Pitfalls

❌ Forget to update `CLIENT_URL` on Render
❌ Use wrong `VITE_API_URL` on Vercel
❌ Keep `.env` secrets in `.env.example`
❌ Not wait for full deployment
❌ Not clear cache before testing
❌ Use `localhost:5000` in production

## 🚀 Ready to Deploy?

Follow the checklist in `DEPLOYMENT_CHECKLIST.md`
