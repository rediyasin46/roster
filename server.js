import express from 'express';
import cors from 'cors';
import fetch from 'node-fetch';
import dotenv from 'dotenv';
import helmet from 'helmet';
import mysql from 'mysql2/promise';
import { initializeAuthRoutes } from './server/auth.js';
import { initializeProfileRoutes } from './server/profile.js';

dotenv.config();

const app = express();
const PORT = process.env.VITE_API_PORT || 3001;

// ============================================
// SECURITY MIDDLEWARE
// ============================================
app.use(helmet()); // Add security headers

// CORS Configuration
const allowedOrigins = (process.env.CORS_ORIGIN || 'http://localhost:3000')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);
const isDev = process.env.NODE_ENV !== 'production';

app.use(cors({
  origin(origin, callback) {
    if (!origin) return callback(null, true);
    if (isDev && /^https?:\/\/(localhost|127\.0\.0\.1|\[::1\])(:\d+)?$/.test(origin)) {
      return callback(null, true);
    }
    if (allowedOrigins.includes(origin)) return callback(null, true);
    return callback(new Error(`CORS blocked for origin: ${origin}`));
  },
  credentials: true,
  optionsSuccessStatus: 200,
}));

// Middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// ============================================
// DATABASE CONNECTION POOL
// ============================================
let pool;

async function initializeDatabase() {
  try {
    pool = mysql.createPool({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'roster_user',
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME || 'roster_db',
      waitForConnections: true,
      connectionLimit: parseInt(process.env.DB_POOL_SIZE || '10'),
      queueLimit: 0,
      enableKeepAlive: true,
      keepAliveInitialDelayMs: 0,
    });

    // Test connection
    const conn = await pool.getConnection();
    console.log('✓ Database connected successfully');
    conn.release();

    return pool;
  } catch (error) {
    console.warn('⚠ Database connection failed:', error.message);
    console.warn('Running in test mode - API endpoints requiring database will fail');
    console.warn('To enable database features:');
    console.warn('1. Install MySQL and start the service');
    console.warn('2. Create database: mysql -u root -p < database/schema.sql');
    console.warn('3. Update .env with database credentials');
    
    // Don't exit - allow server to run without database for testing payments
    return null;
  }
}

// ============================================
// REQUEST LOGGING MIDDLEWARE
// ============================================
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.path} - ${res.statusCode} (${duration}ms)`);
  });
  next();
});

// ============================================
// HEALTH CHECK
// ============================================
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'Backend server is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
  });
});

// ============================================
// AUTHENTICATION ROUTES
// ============================================
if (pool) {
  app.use('/api/auth', initializeAuthRoutes(pool));
} else {
  // Placeholder route when database is unavailable
  app.post('/api/auth/login', (req, res) => {
    res.status(503).json({
      error: 'Database unavailable',
      message: 'Authentication requires database. Please configure MySQL.'
    });
  });
}

// ============================================
// PROFILE ROUTES
// ============================================
if (pool) {
  app.use('/api/profile', initializeProfileRoutes(pool));
} else {
  // Placeholder route when database is unavailable
  app.get('/api/profile/profile', (req, res) => {
    res.status(503).json({
      error: 'Database unavailable',
      message: 'Profile management requires database. Please configure MySQL.'
    });
  });
}

// ============================================
// CHAPA PAYMENT INTEGRATION
// ============================================

const CHAPA_API_KEY =
  process.env.CHAPA_SECRET_KEY ||
  process.env.VITE_CHAPA_SECRET_KEY ||
  process.env.VITE_CHAPA_API_KEY;
const CHAPA_BASE_URL = 'https://api.chapa.co/v1';

function formatChapaErrorMessage(message) {
  if (typeof message !== 'object' || message === null) {
    return message || 'Payment validation failed';
  }

  const fieldLabels = {
    email: 'Please enter a valid email address',
    phone_number: 'Please enter a valid Ethiopian phone number (e.g. +251912345678)',
    amount: 'Please enter a valid payment amount',
    first_name: 'Please enter a valid first name',
    last_name: 'Please enter a valid last name',
    tx_ref: 'Invalid transaction reference',
    'customization.title': 'Title must be 16 characters or fewer',
    return_url: 'Invalid return URL',
  };

  return Object.entries(message)
    .map(([key, msgs]) => {
      if (fieldLabels[key]) return fieldLabels[key];
      if (Array.isArray(msgs)) return `${key}: ${msgs.join(', ')}`;
      return `${key}: ${msgs}`;
    })
    .join('; ');
}

function normalizeEthiopianPhone(phone) {
  const digits = String(phone).replace(/\s+/g, '');
  if (digits.startsWith('+251')) return digits;
  if (digits.startsWith('0')) return `+251${digits.slice(1)}`;
  if (digits.startsWith('251')) return `+${digits}`;
  return `+251${digits}`;
}

function isValidChapaEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) && !email.toLowerCase().endsWith('@example.com');
}

// Initialize Payment
app.post('/api/chapa/initialize', async (req, res) => {
  try {
    const {
      amount,
      currency = 'ETB',
      email,
      first_name,
      last_name,
      phone_number,
      tx_ref,
      return_url,
      customization,
    } = req.body;

    const normalizedEmail = String(email || '').trim().toLowerCase();
    const normalizedPhone = normalizeEthiopianPhone(phone_number || '');
    const parsedAmount = Number(amount);

    // Validate required fields
    if (!parsedAmount || !normalizedEmail || !first_name || !last_name || !phone_number || !tx_ref) {
      return res.status(400).json({
        status: 'error',
        message: 'Missing required fields',
      });
    }

    if (!isValidChapaEmail(normalizedEmail)) {
      return res.status(400).json({
        status: 'error',
        message: 'Please enter a valid email address. Chapa rejects test domains like @example.com.',
      });
    }

    if (!/^\+251[79]\d{8}$/.test(normalizedPhone)) {
      return res.status(400).json({
        status: 'error',
        message: 'Please enter a valid Ethiopian phone number (e.g. +251912345678 or 0912345678).',
      });
    }

    // Validate API key
    if (!CHAPA_API_KEY) {
      console.error('CHAPA_API_KEY is not configured');
      return res.status(500).json({
        status: 'error',
        message: 'Payment service is not configured',
      });
    }

    console.log(`📤 Initializing Chapa payment: ${tx_ref}`);
    
    const payload = {
      amount: parsedAmount,
      currency,
      email: normalizedEmail,
      first_name: String(first_name).trim(),
      last_name: String(last_name).trim(),
      phone_number: normalizedPhone,
      tx_ref,
      return_url,
      customization: {
        title: customization?.title || 'ScoreBook',
        description: customization?.description || 'Subscription',
      },
    };
    
    console.log('📋 Chapa Payload:', JSON.stringify(payload, null, 2));

    const response = await fetch(`${CHAPA_BASE_URL}/transaction/initialize`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${CHAPA_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('❌ Chapa API Error:', data);
      
      // Format error message from Chapa response
      const errorMessage = formatChapaErrorMessage(data.message) || 'Failed to initialize payment';
      
      return res.status(response.status).json({
        status: 'error',
        message: errorMessage,
      });
    }

    console.log('✅ Payment initialized:', tx_ref);
    res.json(data);
  } catch (error) {
    console.error('❌ Backend Error:', error);
    res.status(500).json({
      status: 'error',
      message: error instanceof Error ? error.message : 'Internal server error',
    });
  }
});

// Verify Payment
app.get('/api/chapa/verify/:reference', async (req, res) => {
  try {
    const { reference } = req.params;

    if (!reference) {
      return res.status(400).json({
        status: 'error',
        message: 'Reference is required',
      });
    }

    if (!CHAPA_API_KEY) {
      return res.status(500).json({
        status: 'error',
        message: 'Payment service is not configured',
      });
    }

    console.log(`📤 Verifying payment: ${reference}`);

    const response = await fetch(`${CHAPA_BASE_URL}/transaction/verify/${reference}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${CHAPA_API_KEY}`,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('❌ Chapa Verification Error:', data);
      return res.status(response.status).json({
        status: 'error',
        message: data.message || 'Failed to verify payment',
      });
    }

    console.log('✅ Payment verified:', reference);
    res.json(data);
  } catch (error) {
    console.error('❌ Verification Error:', error);
    res.status(500).json({
      status: 'error',
      message: error instanceof Error ? error.message : 'Internal server error',
    });
  }
});

// ============================================
// ERROR HANDLING MIDDLEWARE
// ============================================

// 404 Handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Not Found',
    path: req.path,
    message: 'The requested endpoint does not exist',
  });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(err.status || 500).json({
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'An error occurred',
  });
});

// ============================================
// SERVER STARTUP
// ============================================

async function startServer() {
  try {
    // Initialize database
    await initializeDatabase();

    // Start server
    app.listen(PORT, () => {
      console.log(`
╔════════════════════════════════════════╗
║   Roster Application Backend Server    ║
╠════════════════════════════════════════╣
║  Environment: ${(process.env.NODE_ENV || 'development').padEnd(24)} ║
║  Port: ${PORT.toString().padEnd(32)} ║
║  API URL: ${(process.env.VITE_API_URL || `http://localhost:${PORT}`).substring(0, 30).padEnd(30)} ║
╚════════════════════════════════════════╝
      `);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  if (pool) {
    pool.end(() => {
      console.log('Database pool closed');
      process.exit(0);
    });
  }
});

export default app;
