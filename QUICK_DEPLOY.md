# Quick Deployment Guide

Your code is already on GitHub: https://github.com/Avishkar2003/secure-chat-app

## Option 1: Deploy via Vercel Web Interface (Recommended - Easiest)

### Frontend Deployment:

1. Go to https://vercel.com and sign in with GitHub
2. Click "Add New Project"
3. Select your `secure-chat-app` repository
4. Configure:
   - **Root Directory**: `client`
   - **Framework Preset**: Vite
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install --legacy-peer-deps`
5. Click "Deploy" (don't add environment variables yet)
6. Wait for deployment to complete
7. Copy your frontend URL (e.g., https://secure-chat-app.vercel.app)

### Backend Deployment (Railway - Best for WebSocket):

1. Go to https://railway.app and sign in with GitHub
2. Click "New Project" → "Deploy from GitHub repo"
3. Select your `secure-chat-app` repository
4. Railway will detect your project
5. Click on the service → Settings:
   - **Root Directory**: `server`
   - **Start Command**: `npm start`
6. Add a MySQL database:
   - Click "New" → "Database" → "Add MySQL"
   - Railway will auto-connect it
7. Go to Variables tab and add:
   ```
   PORT=3001
   JWT_SECRET=your_super_secret_jwt_key_change_this
   RESEND_API_KEY=re_HjR1SXKZ_783r76dUNHEj94GmHHhVn5FQ
   ```
   (DB variables are auto-added by Railway)
8. Deploy and copy your backend URL (e.g., https://your-app.up.railway.app)

### Update Frontend Environment Variables:

1. Go back to Vercel → Your Project → Settings → Environment Variables
2. Add:
   - `VITE_API_URL` = Your Railway backend URL
   - `VITE_SOCKET_URL` = Your Railway backend URL (same)
3. Go to Deployments → Click "..." → Redeploy

### Update Backend CORS:

Your backend needs to allow your Vercel domain. I'll update this now.

## Option 2: Deploy via CLI

### Vercel CLI:
```bash
cd client
vercel login
vercel --prod
```

### Railway CLI:
```bash
npm install -g @railway/cli
railway login
railway init
railway up
```

## What's Already Done:

✅ Code pushed to GitHub
✅ Git configured
✅ Dependencies installed
✅ Configuration files created
✅ Documentation ready

## Next Steps After Deployment:

1. Test your frontend URL
2. Test your backend URL/health endpoint
3. Verify WebSocket connections work
4. Check database is connected
5. Test the full authentication flow

Your app should be live within 5-10 minutes!
