require('dotenv').config();
const express = require('express');
const cors = require('cors');

const analyzeRoute = require('./routes/analyze');
const scanRoute = require('./routes/scan');
const repositoryRoute = require('./routes/repository');
const roastRoute = require('./routes/roast');
const rescanRoute = require('./routes/rescan');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: ['http://localhost:5173', 'http://127.0.0.1:5173', 'http://localhost:3000'],
  credentials: true
}));
app.use(express.json());

// Routes
app.use('/api', analyzeRoute);
app.use('/api', scanRoute);
app.use('/api', repositoryRoute);
app.use('/api', roastRoute);
app.use('/api', rescanRoute);

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'Roast My GitHub API',
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('[Unhandled Error]', err);
  res.status(500).json({
    error: 'INTERNAL_SERVER_ERROR',
    message: err.message || 'An unexpected error occurred.'
  });
});

app.listen(PORT, () => {
  console.log(`🔥 Roast My GitHub Backend listening on http://localhost:${PORT}`);
});
