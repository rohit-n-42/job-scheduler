# Deployment Guide

This guide walks you through deploying the Job Scheduler application to Render (backend) and Netlify (frontend).

## 📋 Prerequisites

- GitHub account (for connecting repositories)
- Render account (sign up at render.com)
- Netlify account (sign up at netlify.com)

## 🔧 Step 1: Prepare Your Code

### Push to GitHub

1. Create a new repository on GitHub
2. Initialize git and push your code:

```bash
cd job-scheduler
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/yourusername/job-scheduler.git
git push -u origin main
```

## 🖥️ Step 2: Deploy Backend to Render

### Method 1: Using Render Dashboard

1. **Sign in to Render** at [render.com](https://render.com)

2. **Create New Web Service:**
   - Click "New +" → "Web Service"
   - Connect your GitHub repository
   - Select your repository

3. **Configure the Service:**
   - **Name:** `job-scheduler-backend`
   - **Root Directory:** `backend`
   - **Environment:** `Node`
   - **Region:** Choose closest to your users
   - **Branch:** `main`
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
   - **Instance Type:** Free

4. **Add Environment Variables:**
   Click "Environment" tab and add:
   ```
   PORT = 10000
   WEBHOOK_URL = https://webhook.site/your-unique-id
   ```
   
   Note: Render automatically sets PORT to 10000 for web services.

5. **Deploy:**
   - Click "Create Web Service"
   - Wait for deployment (usually 2-5 minutes)
   - Your backend URL will be: `https://job-scheduler-backend.onrender.com`

6. **Test the Backend:**
   ```bash
   curl https://job-scheduler-backend.onrender.com/health
   ```

### Method 2: Using render.yaml

1. Create a `render.yaml` in your repository root:

```yaml
services:
  - type: web
    name: job-scheduler-backend
    env: node
    rootDir: backend
    buildCommand: npm install
    startCommand: npm start
    envVars:
      - key: WEBHOOK_URL
        value: https://webhook.site/your-unique-id
```

2. In Render Dashboard:
   - Click "New +" → "Blueprint"
   - Connect repository
   - Render will automatically detect and deploy from render.yaml

## 🌐 Step 3: Deploy Frontend to Netlify

### Method 1: Using Netlify Dashboard

1. **Sign in to Netlify** at [netlify.com](https://netlify.com)

2. **Create New Site:**
   - Click "Add new site" → "Import an existing project"
   - Connect to GitHub
   - Select your repository

3. **Configure Build Settings:**
   - **Base directory:** `frontend`
   - **Build command:** `npm run build`
   - **Publish directory:** `frontend/.next`
   - **Functions directory:** (leave empty)

4. **Add Environment Variables:**
   Go to "Site settings" → "Environment variables" → "Add a variable"
   ```
   NEXT_PUBLIC_API_URL = https://job-scheduler-backend.onrender.com
   ```
   
   Replace with your actual Render backend URL from Step 2.

5. **Deploy:**
   - Click "Deploy site"
   - Wait for build (usually 1-3 minutes)
   - Your frontend URL will be: `https://your-site-name.netlify.app`

### Method 2: Using Netlify CLI

1. **Install Netlify CLI:**
   ```bash
   npm install -g netlify-cli
   ```

2. **Login to Netlify:**
   ```bash
   netlify login
   ```

3. **Initialize and Deploy:**
   ```bash
   cd frontend
   
   # Create .env.local with your backend URL
   echo "NEXT_PUBLIC_API_URL=https://job-scheduler-backend.onrender.com" > .env.local
   
   # Build the project
   npm run build
   
   # Deploy
   netlify deploy --prod
   ```

4. **Follow the prompts:**
   - Create a new site or link existing
   - Set publish directory to `.next`

### Method 3: Using netlify.toml

The included `netlify.toml` file will automatically configure deployment when you connect your repository to Netlify.

## 🔄 Step 4: Connect Frontend to Backend

1. **Update Frontend Environment Variable:**
   - In Netlify dashboard: Site settings → Environment variables
   - Set `NEXT_PUBLIC_API_URL` to your Render backend URL
   - Example: `https://job-scheduler-backend.onrender.com`

2. **Redeploy Frontend:**
   - Trigger a new deploy in Netlify
   - Or push a commit to trigger auto-deploy

3. **Update Backend CORS (Optional but Recommended):**
   
   Edit `backend/server.js`:
   ```javascript
   app.use(cors({
     origin: 'https://your-site-name.netlify.app'
   }));
   ```
   
   Push changes to trigger Render redeploy.

## ✅ Step 5: Verify Deployment

1. **Test Backend:**
   ```bash
   curl https://job-scheduler-backend.onrender.com/health
   ```
   Should return: `{"status":"OK","message":"Server is running"}`

2. **Test Frontend:**
   - Visit your Netlify URL
   - Try creating a job
   - Verify it appears in the table
   - Try running a job
   - Check that status updates work

## 🔔 Step 6: Set Up Webhook (Optional)

1. **Get a Webhook URL:**
   - Visit [webhook.site](https://webhook.site)
   - Copy your unique URL

2. **Update Backend Environment Variable:**
   - In Render dashboard: Environment → Edit
   - Update `WEBHOOK_URL` to your webhook.site URL
   - Save and redeploy

3. **Test Webhook:**
   - Run a job in your application
   - Check webhook.site for the incoming POST request

## 🚨 Important Notes

### Render Free Tier Limitations
- Services sleep after 15 minutes of inactivity
- First request after sleeping takes ~30 seconds to wake up
- SQLite database resets when service restarts
- For production: Use paid plan or persistent disk

### Database Persistence on Render
To persist SQLite data on Render's free tier:

1. In Render dashboard, go to your service
2. Click "Disk" tab → "Add Disk"
3. Mount path: `/app/backend` (or where your .db file is)
4. Size: 1GB (free tier limit)

Or migrate to PostgreSQL for better persistence.

### Netlify Build Issues
If build fails:
- Check build logs in Netlify dashboard
- Ensure all dependencies are in package.json
- Verify Node.js version compatibility

## 📊 Monitoring Your Application

### Render
- View logs: Service → Logs tab
- Monitor metrics: Service → Metrics tab
- Check deployments: Service → Events tab

### Netlify
- View build logs: Site → Deploys → Deploy log
- Function logs: Site → Functions
- Analytics: Site → Analytics (on paid plans)

## 🔄 Continuous Deployment

Both Render and Netlify support automatic deployments:

1. **Connect to GitHub:** Done during initial setup
2. **Auto-deploy:** Any push to main branch triggers deployment
3. **Preview deployments:** Pull requests create preview URLs (Netlify)

## 🎉 You're All Set!

Your Job Scheduler application is now live and accessible worldwide. Share your URLs:
- Frontend: `https://your-site-name.netlify.app`
- Backend API: `https://job-scheduler-backend.onrender.com`

## 🛠️ Updating Your Application

### Frontend Updates
```bash
git add .
git commit -m "Update frontend"
git push
# Netlify automatically rebuilds and deploys
```

### Backend Updates
```bash
git add .
git commit -m "Update backend"
git push
# Render automatically rebuilds and deploys
```

## 🔐 Security Best Practices for Production

1. **Use Environment Variables:** Never hardcode sensitive data
2. **Configure CORS Properly:** Limit to your frontend domain
3. **Add Rate Limiting:** Prevent API abuse
4. **Use HTTPS:** Both platforms provide free SSL
5. **Validate Inputs:** Always validate on backend
6. **Add Authentication:** Protect your API endpoints
7. **Monitor Logs:** Regularly check for suspicious activity

---

Need help? Check the troubleshooting section or open an issue!