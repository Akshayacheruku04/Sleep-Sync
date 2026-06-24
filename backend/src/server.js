require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const mongoSanitize = require('express-mongo-sanitize');
const rateLimit = require('express-rate-limit');

// Route imports
const authRoutes = require('./controllers/authController');
const sleepRoutes = require('./controllers/sleepController');
const coachRoutes = require('./controllers/coachController');
const { protect } = require('./middleware/auth');

const app = express();
const PORT = process.env.PORT || 5000;

// ==========================================
// SECURITY MIDDLEWARES & DATA PARSERS
// ==========================================

// Helmet for security headers
app.use(helmet());

// CORS configuration - allow frontend requests (Vercel deployment or local)
const corsOptions = {
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};
app.use(cors(corsOptions));

// Cookie Parser for secure refresh token storage
app.use(cookieParser());

// Express JSON body parser
app.use(express.json({ limit: '10kb' })); // Body limit to prevent DOS
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// Sanitize data against NoSQL Query Injection
app.use(mongoSanitize());

// Rate Limiter: Limit requests from same IP to 100 per 15 minutes
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, 
  message: { error: 'Too many requests from this IP, please try again after 15 minutes' },
  standardHeaders: true,
  legacyHeaders: false
});
app.use('/api/', limiter);

// ==========================================
// ROUTING
// ==========================================

// 1. Authentication Routes
const authRouter = express.Router();
authRouter.post('/signup', authRoutes.signup);
authRouter.post('/login', authRoutes.login);
authRouter.post('/refresh', authRoutes.refresh);
authRouter.post('/logout', authRoutes.logout);
authRouter.post('/change-password', protect, authRoutes.changePassword);
app.use('/api/auth', authRouter);

// 2. Sleep Tracking & Report Routes
const sleepRouter = express.Router();
sleepRouter.use(protect); // All sleep routes are protected
sleepRouter.post('/entry', sleepRoutes.logEntry);
sleepRouter.get('/history', sleepRoutes.getHistory);
sleepRouter.delete('/entry/:id', sleepRoutes.deleteEntry);
sleepRouter.get('/dashboard', sleepRoutes.getDashboardStats);
sleepRouter.get('/weekly', sleepRoutes.getWeeklyAnalytics);
app.use('/api/sleep', sleepRouter);

// 3. AI Sleep Coach Chat Routes
const coachRouter = express.Router();
coachRouter.use(protect); // All coach routes are protected
coachRouter.post('/message', coachRoutes.sendMessage);
coachRouter.get('/history', coachRoutes.getChatHistory);
app.use('/api/coach', coachRouter);

// Root Endpoint
app.get('/', (req, res) => {
  res.json({ message: 'SleepSync AI API - Status: Healthy' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong on the server!' });
});

// ==========================================
// DATABASE CONNECTION & BOOTSTRAP
// ==========================================

const dbURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/sleepsync';
mongoose.connect(dbURI)
  .then(() => {
    console.log('MongoDB connected successfully.');
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('Database connection failed:', err.message);
    process.exit(1);
  });
