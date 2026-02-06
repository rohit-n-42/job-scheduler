# Job Scheduler Application

A full-stack job scheduling application built with Next.js, Node.js, Express, SQLite, and Tailwind CSS. This application allows users to create, manage, filter, and execute jobs with webhook notifications.

## 📋 Table of Contents

- [Tech Stack](#tech-stack)
- [Features](#features)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Local Development Setup](#local-development-setup)
- [API Documentation](#api-documentation)
- [Deployment](#deployment)
- [Environment Variables](#environment-variables)

## 🛠 Tech Stack

### Frontend
- **Next.js 14** - React framework with App Router
- **React 18** - UI library
- **Tailwind CSS** - Utility-first CSS framework
- **Axios** - HTTP client
- **React Hot Toast** - Toast notifications

### Backend
- **Node.js** - JavaScript runtime
- **Express** - Web application framework
- **SQLite3** - Embedded database
- **Axios** - HTTP client for webhook calls
- **CORS** - Cross-origin resource sharing

## ✨ Features

### Job Management
- ✅ Create jobs with custom task names, priorities (P1-P4), and JSON payloads
- ✅ View all jobs in a sortable table
- ✅ Filter jobs by status (pending, running, completed) and priority
- ✅ View detailed job information in a modal
- ✅ Real-time status updates with polling

### Job Execution
- ✅ Run jobs with one-click execution
- ✅ Prevent concurrent runs of the same job
- ✅ 10-second simulated job execution
- ✅ Automatic webhook notification on completion
- ✅ Webhook failure detection and logging

### User Experience
- ✅ Form validation (empty task names, invalid JSON)
- ✅ Toast notifications for all actions
- ✅ Responsive design for mobile and desktop
- ✅ Loading states and error handling
- ✅ Color-coded status and priority badges

## 📁 Project Structure

```
job-scheduler/
├── backend/
│   ├── server.js           # Express server and API routes
│   ├── database.js         # SQLite database setup
│   ├── package.json        # Backend dependencies
│   ├── .env.example        # Environment variables template
│   └── .gitignore
├── frontend/
│   ├── app/
│   │   ├── layout.js       # Root layout with Toaster
│   │   ├── page.js         # Main application page
│   │   └── globals.css     # Global styles with Tailwind
│   ├── package.json        # Frontend dependencies
│   ├── next.config.js      # Next.js configuration
│   ├── tailwind.config.js  # Tailwind CSS configuration
│   ├── postcss.config.js   # PostCSS configuration
│   ├── .env.local.example  # Environment variables template
│   └── .gitignore
└── README.md
```

## 📦 Prerequisites

Before you begin, ensure you have the following installed:
- **Node.js** (v18 or higher)
- **npm** or **yarn**

## 🚀 Local Development Setup

### 1. Clone or Download the Project

```bash
# Navigate to the project directory
cd job-scheduler
```

### 2. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Create environment file (optional)
cp .env.example .env
# Edit .env and set your webhook URL if desired

# Start the backend server
npm start

# For development with auto-restart:
npm run dev
```

The backend server will start on `http://localhost:5000`

### 3. Frontend Setup

Open a new terminal window:

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Create environment file
cp .env.local.example .env.local
# Edit .env.local if your backend runs on a different URL

# Start the development server
npm run dev
```

The frontend will be available at `http://localhost:3000`

### 4. Access the Application

Open your browser and navigate to `http://localhost:3000`

## 📚 API Documentation

### Base URL
```
http://localhost:5000
```

### Endpoints

#### 1. Create Job
```http
POST /jobs
Content-Type: application/json

{
  "taskName": "Process User Data",
  "priority": "P1",
  "payload": "{\"userId\": 123, \"action\": \"process\"}"
}
```

**Response:**
```json
{
  "message": "Job created successfully",
  "job": {
    "id": 1,
    "taskName": "Process User Data",
    "priority": "P1",
    "status": "pending",
    "payload": {"userId": 123, "action": "process"},
    "createdAt": "2026-02-06T10:30:00.000Z",
    "updatedAt": "2026-02-06T10:30:00.000Z",
    "completedAt": null
  }
}
```

#### 2. Get All Jobs (with optional filters)
```http
GET /jobs?status=pending&priority=P1
```

**Query Parameters:**
- `status` (optional): Filter by status (pending, running, completed)
- `priority` (optional): Filter by priority (P1, P2, P3, P4)

**Response:**
```json
{
  "jobs": [
    {
      "id": 1,
      "taskName": "Process User Data",
      "priority": "P1",
      "status": "pending",
      "payload": {"userId": 123},
      "createdAt": "2026-02-06T10:30:00.000Z",
      "updatedAt": "2026-02-06T10:30:00.000Z",
      "completedAt": null
    }
  ]
}
```

#### 3. Get Job Details
```http
GET /jobs/:id
```

**Response:**
```json
{
  "job": {
    "id": 1,
    "taskName": "Process User Data",
    "priority": "P1",
    "status": "completed",
    "payload": {"userId": 123},
    "createdAt": "2026-02-06T10:30:00.000Z",
    "updatedAt": "2026-02-06T10:30:40.000Z",
    "completedAt": "2026-02-06T10:30:40.000Z"
  }
}
```

#### 4. Run Job
```http
POST /run-job/:id
```

**Response:**
```json
{
  "message": "Job started successfully",
  "jobId": "1",
  "status": "running"
}
```

**Job Execution Flow:**
1. Job status changes to "running"
2. Job executes for 10 seconds
3. Job status changes to "completed"
4. Webhook notification is sent with job details
5. If webhook fails, job still completes (failure is logged)

**Webhook Payload:**
```json
{
  "jobId": 1,
  "taskName": "Process User Data",
  "priority": "P1",
  "payload": {"userId": 123},
  "completedAt": "2026-02-06T10:30:40.123Z"
}
```

## 🌐 Deployment

### Option 1: Deploy to Render

#### Backend Deployment (Render)

1. **Create a Render Account** at [render.com](https://render.com)

2. **Create a new Web Service:**
   - Connect your GitHub repository
   - Select the `backend` directory as the root
   - Configure the service:
     - **Name:** job-scheduler-backend
     - **Environment:** Node
     - **Build Command:** `npm install`
     - **Start Command:** `npm start`
     - **Plan:** Free

3. **Add Environment Variables:**
   - `PORT`: 5000
   - `WEBHOOK_URL`: Your webhook URL (e.g., https://webhook.site/your-id)

4. **Deploy** - Render will provide you with a URL like:
   ```
   https://job-scheduler-backend.onrender.com
   ```

#### Frontend Deployment (Netlify or Render)

**Option A: Netlify**

1. **Install Netlify CLI** (optional):
   ```bash
   npm install -g netlify-cli
   ```

2. **Build the frontend:**
   ```bash
   cd frontend
   npm run build
   ```

3. **Deploy:**
   
   Via Netlify CLI:
   ```bash
   netlify deploy --prod
   ```
   
   Or via Netlify Dashboard:
   - Go to [netlify.com](https://netlify.com)
   - Drag and drop the `.next` folder or connect your Git repository
   - Set build command: `npm run build`
   - Set publish directory: `.next`

4. **Configure Environment Variables in Netlify:**
   - `NEXT_PUBLIC_API_URL`: Your Render backend URL

**Option B: Render (Frontend)**

1. **Create a new Static Site:**
   - Connect your GitHub repository
   - Select the `frontend` directory
   - Configure:
     - **Build Command:** `npm run build`
     - **Publish Directory:** `.next`

2. **Add Environment Variables:**
   - `NEXT_PUBLIC_API_URL`: Your backend URL

### Option 2: Deploy Both to Render

You can deploy both frontend and backend to Render as separate services:

1. **Backend:** Follow backend deployment steps above
2. **Frontend:** Create a new Web Service (not Static Site) for Next.js:
   - **Build Command:** `npm install && npm run build`
   - **Start Command:** `npm start`
   - **Environment:** Node

### Important Notes for Deployment

1. **Database Persistence:** SQLite database will reset on Render's free tier when the service sleeps. For production, consider:
   - Using Render's persistent disk feature
   - Migrating to PostgreSQL

2. **CORS:** The backend is configured to accept requests from any origin. For production, update CORS settings:
   ```javascript
   app.use(cors({
     origin: 'https://your-frontend-domain.com'
   }));
   ```

3. **Webhook URL:** Update the webhook URL in your backend environment variables or code to point to your actual webhook endpoint.

## 🔧 Environment Variables

### Backend (.env)
```env
PORT=5000
WEBHOOK_URL=https://webhook.site/your-unique-id
```

### Frontend (.env.local)
```env
NEXT_PUBLIC_API_URL=http://localhost:5000
```

For production, update `NEXT_PUBLIC_API_URL` to your deployed backend URL.

## 🎯 Usage Guide

### Creating a Job

1. Click "Create New Job" button
2. Fill in:
   - **Task Name:** Descriptive name for your job
   - **Priority:** P1 (Highest) to P4 (Low)
   - **Payload:** Valid JSON data
3. Click "Create Job"
4. Validation checks:
   - Task name cannot be empty
   - Payload must be valid JSON

### Viewing Jobs

- All jobs are displayed in the main table
- Use dropdown filters to filter by status or priority
- Click "Refresh" to update the job list
- Click "View" on any job to see complete details

### Running a Job

1. Click "Run" button on any pending job
2. Job status changes to "running"
3. Job executes for 10 seconds
4. Status changes to "completed"
5. Webhook notification is sent
6. Toast notification confirms completion or webhook failure

### Job Status Flow

```
pending → running (3 seconds) → completed
```

## AI tools

### AI tools: Claude.ai Sonnet 4.5 
### Prompt:
```
Help me build a mini job scheduling web application using next.js as frontend, tailwind CSS for styling, Node.js and Express for backend and SQLite for database. We need to create a job, view all jobs in a table, filter jobs by status and priority, run a job, view job details. A job should contain taskName, payload which is in json format and is flexible and provided by the user, priority and status which is pending, running or completed, and timestamps createdAt, updatedAt, completedAt. Create APIs to create Job API using POST /jobs, get Job details using GET /jobs and filter based on priority and status, get job details using GET /jobs/:id for complete information, run job API using POST /run-job/:id where initially the job is in pending state, and once job is running, it should be in running state for 10 seconds and then notify an external webhook which for now use a dummy url, and send a post request with the jobId, taskName, priority, payload, and completedAt time which is the current timestamp of once the task is complete. While a job is running, we cannot run the job once again, and if the webhook notification fails, show a log on the frontend saying job successful but webhook failed. Frontend should allow users to create a job with taskName as text, priority as dropdown from P1 to P4, payload as json text area, upon clicking submit button, validate if taskName is empty or not and if the json payload is valid, and send a notification if not.  Jobs should get updated and a toast message saying job created successfully. Please provide the code and details on how to deploy it on netlify or render, and also provide a readme file with tech stack, features, how to run locally.
```
It helped me with designing, backend logic and documentation.

## 🐛 Troubleshooting

### Backend won't start
- Ensure port 5000 is not in use
- Check that all dependencies are installed: `npm install`
- Verify Node.js version: `node --version` (should be v18+)

### Frontend can't connect to backend
- Verify backend is running on the correct port
- Check `.env.local` has the correct `NEXT_PUBLIC_API_URL`
- Ensure no CORS errors in browser console

### Jobs not updating after running
- Check browser console for errors
- Verify webhook URL is accessible (or use a dummy URL)
- Check backend logs for error messages

### Database issues
- Delete `jobs.db` file and restart backend to reset database
- Check file permissions in the backend directory

## 📝 Future Enhancements

- Add job scheduling with cron expressions
- Implement job retry logic on failure
- Add user authentication
- Support for job cancellation
- Job execution history and logs
- Batch job operations
- Export jobs to CSV/JSON
- WebSocket for real-time updates instead of polling

## 📄 License

This project is open source and available under the MIT License.

## 🤝 Contributing

Contributions, issues, and feature requests are welcome!

## 📧 Support

If you have any questions or need help, please open an issue in the repository.

---

Built with ❤️ using Next.js, Express, and SQLitea
