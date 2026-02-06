const express = require('express');
const cors = require('cors');
const axios = require('axios');
const db = require('./database');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Dummy webhook URL for notifications
const WEBHOOK_URL = '	https://webhook.site/9cfeb8a0-8baf-4081-acf2-37e89bd7c913';

// Store running jobs to prevent concurrent runs
const runningJobs = new Set();

// Helper function to update timestamp
const updateTimestamp = (id, callback) => {
  const query = 'UPDATE jobs SET updatedAt = CURRENT_TIMESTAMP WHERE id = ?';
  db.run(query, [id], callback);
};

// POST /jobs - Create a new job
app.post('/jobs', (req, res) => {
  const { taskName, payload, priority } = req.body;

  // Validation
  if (!taskName || !taskName.trim()) {
    return res.status(400).json({ error: 'Task name is required' });
  }

  if (!priority || !['P1', 'P2', 'P3', 'P4'].includes(priority)) {
    return res.status(400).json({ error: 'Valid priority (P1-P4) is required' });
  }

  if (!payload) {
    return res.status(400).json({ error: 'Payload is required' });
  }

  // Validate JSON payload
  let payloadString;
  try {
    payloadString = typeof payload === 'string' ? payload : JSON.stringify(payload);
    JSON.parse(payloadString); // Validate JSON
  } catch (error) {
    return res.status(400).json({ error: 'Invalid JSON payload' });
  }

  const query = `
    INSERT INTO jobs (taskName, payload, priority, status)
    VALUES (?, ?, ?, 'pending')
  `;

  db.run(query, [taskName, payloadString, priority], function (err) {
    if (err) {
      console.error('Error creating job:', err.message);
      return res.status(500).json({ error: 'Failed to create job' });
    }

    // Fetch the created job
    db.get('SELECT * FROM jobs WHERE id = ?', [this.lastID], (err, job) => {
      if (err) {
        console.error('Error fetching created job:', err.message);
        return res.status(500).json({ error: 'Job created but failed to fetch' });
      }

      res.status(201).json({
        message: 'Job created successfully',
        job: {
          ...job,
          payload: JSON.parse(job.payload)
        }
      });
    });
  });
});

// GET /jobs - Get all jobs with optional filters
app.get('/jobs', (req, res) => {
  const { status, priority } = req.query;

  let query = 'SELECT * FROM jobs WHERE 1=1';
  const params = [];

  if (status) {
    query += ' AND status = ?';
    params.push(status);
  }

  if (priority) {
    query += ' AND priority = ?';
    params.push(priority);
  }

  query += ' ORDER BY createdAt DESC';

  db.all(query, params, (err, jobs) => {
    if (err) {
      console.error('Error fetching jobs:', err.message);
      return res.status(500).json({ error: 'Failed to fetch jobs' });
    }

    // Parse payload JSON for each job
    const jobsWithParsedPayload = jobs.map(job => ({
      ...job,
      payload: JSON.parse(job.payload)
    }));

    res.json({ jobs: jobsWithParsedPayload });
  });
});

// GET /jobs/:id - Get job details by ID
app.get('/jobs/:id', (req, res) => {
  const { id } = req.params;

  db.get('SELECT * FROM jobs WHERE id = ?', [id], (err, job) => {
    if (err) {
      console.error('Error fetching job:', err.message);
      return res.status(500).json({ error: 'Failed to fetch job' });
    }

    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }

    res.json({
      job: {
        ...job,
        payload: JSON.parse(job.payload)
      }
    });
  });
});

// POST /run-job/:id - Run a job
app.post('/run-job/:id', async (req, res) => {
  const { id } = req.params;

  // Check if job exists
  db.get('SELECT * FROM jobs WHERE id = ?', [id], async (err, job) => {
    if (err) {
      console.error('Error fetching job:', err.message);
      return res.status(500).json({ error: 'Failed to fetch job' });
    }

    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }

    // Check if job is already running
    if (runningJobs.has(parseInt(id))) {
      return res.status(400).json({ 
        error: 'Job is already running',
        status: 'running'
      });
    }

    // Check if job is already completed
    if (job.status === 'completed') {
      return res.status(400).json({ 
        error: 'Job is already completed',
        status: 'completed'
      });
    }

    // Update job status to running
    const updateQuery = 'UPDATE jobs SET status = ?, updatedAt = CURRENT_TIMESTAMP WHERE id = ?';
    
    db.run(updateQuery, ['running', id], async (err) => {
      if (err) {
        console.error('Error updating job status:', err.message);
        return res.status(500).json({ error: 'Failed to start job' });
      }

      // Add to running jobs set
      runningJobs.add(parseInt(id));

      // Send immediate response
      res.json({ 
        message: 'Job started successfully',
        jobId: id,
        status: 'running'
      });

      // Simulate job execution (10 seconds)
      setTimeout(async () => {
        const completedAt = new Date().toISOString();
        
        // Update job status to completed
        const completeQuery = `
          UPDATE jobs 
          SET status = 'completed', 
              completedAt = ?, 
              updatedAt = CURRENT_TIMESTAMP 
          WHERE id = ?
        `;

        db.run(completeQuery, [completedAt, id], async (err) => {
          if (err) {
            console.error('Error completing job:', err.message);
          }

          // Remove from running jobs set
          runningJobs.delete(parseInt(id));

          // Prepare webhook payload
          const webhookPayload = {
            jobId: job.id,
            taskName: job.taskName,
            priority: job.priority,
            payload: JSON.parse(job.payload),
            completedAt: completedAt
          };

          // Notify webhook
          try {
            await axios.post(WEBHOOK_URL, webhookPayload, {
              timeout: 5000
            });
            console.log(`Webhook notification sent for job ${id}`);
          } catch (webhookError) {
            console.error(`Webhook notification failed for job ${id}:`, webhookError.message);
            // Store webhook failure info (could be extended to store in DB)
          }
        });
      }, 3000); // 10 seconds
    });
  });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

module.exports = app;
