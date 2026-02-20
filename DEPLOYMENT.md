# Deployment Guide

## Prerequisites
- GitHub account
- Vercel account (sign up at https://vercel.com)
- Railway account (sign up at https://railway.app) OR Render account

## Step 1: Push to GitHub

Your code is ready to push. Run these commands:

```bash
# Add your GitHub repository URL
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git

# Push to GitHub
git push -u origin main
```

If you don't have a repository yet:
1. Go to https://github.com/new
2. Create a new repository (don't initialize with README)
3. Copy the repository URL and use it in the command above

## Step 2: Deploy Backend (Server) to Railway

Railway is recommended because it supports WebSocket connections needed for real-time chat.

1. Go to https://railway.app
2. Click "Start a New Project"
3. Select "Deploy from GitHub repo"
4. Choose your repository
5. Click "Add variables" and add these environment variables:
   - `PORT` = 3001
   - `DB_HOST` = (Railway will provide a MySQL database)
   - `DB_USER` = (from Railway MySQL)
   - `DB_PASSWORD` = (from Railway MySQL)
   - `DB_NAME` = (from Railway MySQL)
   - `JWT_SECRET` = your_super_secret_jwt_key_change_this
   - `RESEND_API_KEY` = re_HjR1SXKZ_783r76dUNHEj94GmHHhVn5FQ

6. Add MySQL database:
   - Click "New" → "Database" → "Add MySQL"
   - Railway will automatically provide connection details

7. Set Root Directory:
   - Go to Settings → Root Directory → Set to `server`
   - Start Command: `npm start`

8. Deploy and copy your backend URL (e.g., https://your-app.railway.app)

## Step 3: Deploy Frontend (Client) to Vercel

1. Go to https://vercel.com
2. Click "Add New Project"
3. Import your GitHub repository
4. Configure:
   - **Framework Preset**: Vite
   - **Root Directory**: `client`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`

5. Add Environment Variables:
   - `VITE_API_URL` = Your Railway backend URL (e.g., https://your-app.railway.app)
   - `VITE_SOCKET_URL` = Your Railway backend URL (same as above)

6. Click "Deploy"

## Step 4: Update CORS Settings

After deployment, update your server's CORS settings to allow your Vercel domain:

In `server/index.js`, update the CORS configuration:
```javascript
app.use(cors({
  origin: ['https://your-vercel-app.vercel.app', 'http://localhost:5173'],
  credentials: true
}));
```

Commit and push this change, Railway will auto-deploy.

## Alternative: Deploy Backend to Render

If you prefer Render over Railway:

1. Go to https://render.com
2. Click "New +" → "Web Service"
3. Connect your GitHub repository
4. Configure:
   - **Root Directory**: `server`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
5. Add environment variables (same as Railway)
6. Add PostgreSQL or MySQL database from Render

## Troubleshooting

- If WebSocket connections fail, ensure your backend supports WebSocket upgrades
- Check that environment variables are set correctly in both Vercel and Railway
- Verify CORS settings allow your frontend domain
- Check Railway/Render logs for backend errors

## Database Setup

Your MySQL database needs to be initialized. Railway/Render will provide a database, but you need to run migrations:

1. Connect to your Railway MySQL database
2. Run your database schema/migrations
3. Or use Sequelize auto-sync (already configured in your code)
