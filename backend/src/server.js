const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const logger = require('./utils/logger');
const errorHandler = require('./middleware/errorHandler');

// Load environment configurations
dotenv.config();

const app = express();
const PORT = process.env.PORT || 10000;
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

// Configure CORS policy matching frontend client
app.use(cors({
  origin: '*' // Allow all origins for testing/academic flexibility, or bind to specific client URL
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Trace inbound logging request details
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.originalUrl} - From IP: ${req.ip}`);
  next();
});

// Import Router Handlers
const downloadRouter = require('./routes/download.routes');
const historyRouter = require('./routes/history.routes');
const healthRouter = require('./routes/health.routes');

// Register API Route paths
app.use('/api/download', downloadRouter);
app.use('/api/history', historyRouter);
app.use('/api/health', healthRouter);

// Base route fallback
app.get('/', (req, res) => {
  res.status(200).json({
    message: 'Multi-Platform Social Media Downloader and Management API Server is online.'
  });
});

// Capture and resolve global backend server errors
app.use(errorHandler);

// Bind server to port and host interfaces
app.listen(PORT, '0.0.0.0', () => {
  logger.info(`Server successfully started. Listening on http://0.0.0.0:${PORT}`);
});
