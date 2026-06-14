import express from 'express';
import cors from 'cors';
import fetch from 'node-fetch';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.VITE_API_PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Chapa Configuration
const CHAPA_API_KEY = process.env.VITE_CHAPA_API_KEY || process.env.VITE_CHAPA_SECRET_KEY;
const CHAPA_BASE_URL = 'https://api.chapa.co/v1';

// Health Check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Backend server is running' });
});

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

    // Validate required fields
    if (!amount || !email || !first_name || !last_name || !phone_number || !tx_ref) {
      return res.status(400).json({
        status: 'error',
        message: 'Missing required fields',
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

    const response = await fetch(`${CHAPA_BASE_URL}/transaction/initialize`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${CHAPA_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        amount,
        currency,
        email,
        first_name,
        last_name,
        phone_number,
        tx_ref,
        return_url,
        customization: {
          title: customization?.title || 'ScoreBook Payment',
          description: customization?.description || 'ScoreBook Subscription Payment',
        },
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('❌ Chapa API Error:', data);
      return res.status(response.status).json({
        status: 'error',
        message: data.message || 'Failed to initialize payment',
        data,
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

// Start Server
app.listen(PORT, () => {
  console.log(`\n🚀 Backend server running at http://localhost:${PORT}`);
  console.log(`📡 Chapa API endpoint: POST http://localhost:${PORT}/api/chapa/initialize`);
  console.log(`📡 Verify endpoint: GET http://localhost:${PORT}/api/chapa/verify/:reference\n`);
});
