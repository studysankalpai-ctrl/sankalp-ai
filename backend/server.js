const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');
const { generalLimiter } = require('./middleware/rateLimiter');

const app = express();

// Ensure upload directories exist
const uploadDirs = [
  path.join(__dirname, 'uploads'),
  path.join(__dirname, 'uploads', 'syllabus'),
  path.join(__dirname, 'uploads', 'papers'),
  path.join(__dirname, 'uploads', 'general'),
  path.join(__dirname, 'uploads', 'temp'),
];
uploadDirs.forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Connect to MongoDB
connectDB();

// Security & Parsing Middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
  crossOriginEmbedderPolicy: false,
  frameguard: false, // Allow embedding in iframes for internal PDF reader
  contentSecurityPolicy: false,
}));

const corsOrigins = process.env.CORS_ORIGIN 
  ? process.env.CORS_ORIGIN.split(',').map(o => o.trim())
  : ['http://localhost:5173', 'http://127.0.0.1:5173', 'http://localhost:3000'];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || corsOrigins.indexOf(origin) !== -1 || corsOrigins.includes('*')) {
      callback(null, true);
    } else {
      callback(null, true); // Allow dev origins freely
    }
  },
  credentials: true,
}));

if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
}

app.use(express.json({ limit: '15mb' }));
app.use(express.urlencoded({ extended: true, limit: '15mb' }));
app.use(generalLimiter);

// Serve uploaded academic PDFs as static files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    platform: 'SANKALP AI',
    timestamp: new Date().toISOString(),
  });
});

// API Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/admin/courses', require('./routes/courses'));
app.use('/api/admin/semesters', require('./routes/semesters'));
app.use('/api/admin/subjects', require('./routes/subjects'));
app.use('/api/admin/folders', require('./routes/folders'));
app.use('/api/admin/files', require('./routes/files'));
app.use('/api/admin/syllabus', require('./routes/syllabus'));
app.use('/api/admin/papers', require('./routes/papers'));
app.use('/api/admin/books', require('./routes/books'));
app.use('/api/admin/processing', require('./routes/processing'));
app.use('/api/admin/questions', require('./routes/questions'));
app.use('/api/admin/topics', require('./routes/topics'));
app.use('/api/admin/analysis', require('./routes/analysis'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/public', require('./routes/public'));
app.use('/api/ai', require('./routes/ai'));
app.use('/api/coding', require('./routes/coding'));

// Global error handler
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
  console.log(`[SANKALP AI Backend] Running on http://127.0.0.1:${PORT}`);
});

module.exports = { app, server };
