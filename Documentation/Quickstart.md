# Quick Start Guide

## 🚀 Get Running in 5 Minutes

### Step 1: Install Backend Dependencies
```bash
cd backend
npm install
```

### Step 2: Start Backend Server
```bash
npm start
```
✅ Backend running at http://localhost:5000

### Step 3: Install Frontend Dependencies (New Terminal)
```bash
cd frontend
npm install
```

### Step 4: Start Frontend
```bash
npm run dev
```
✅ Frontend running at http://localhost:3000

### Step 5: Open Your Browser
Navigate to `http://localhost:3000` and start creating jobs!

## 🎯 Try It Out

1. Click "Create New Job"
2. Enter a task name (e.g., "Send Email Notifications")
3. Select priority (P1-P4)
4. Add JSON payload:
   ```json
   {
     "emails": ["user@example.com"],
     "template": "welcome"
   }
   ```
5. Click "Create Job"
6. Click "Run" to execute the job
7. Watch the status change from pending → running → completed

## 🔍 What Happens When You Run a Job?

1. Job status immediately changes to "running"
2. Job executes for 10 seconds (simulated processing)
3. Job status changes to "completed"
4. A webhook POST request is sent with job details
5. You receive a success notification

## 🌐 Production Deployment

See the main README.md for detailed deployment instructions for:
- Netlify (Frontend)
- Render (Backend)

## ⚡ Common Commands

### Backend
```bash
npm start          # Start server
npm run dev        # Start with nodemon (auto-restart)
```

### Frontend
```bash
npm run dev        # Development server
npm run build      # Production build
npm start          # Production server
npm run lint       # Run linter
```

## 🛟 Need Help?

- Check the main README.md for detailed documentation
- Review the API documentation section
- Check the troubleshooting guide