require('dotenv').config();
const express = require('express');
const WebSocket = require('ws');
const axios = require('axios');
const cors = require('cors');

const app = express();
app.use(cors());

const PORT = 8030;

// Initialize WebSocket connection to Coinbase
const initCoinbaseWebSocket = () => {
  const ws = new WebSocket('wss://ws-feed.pro.coinbase.com');

  ws.on('open', () => {
    console.log('✅ Connected to Coinbase WebSocket');
    ws.send(JSON.stringify({
      type: 'subscribe',
      product_ids: ['BTC-USD', 'ETH-USD'],
      channels: ['ticker', 'level2', 'matches'],
    }));
  });

  ws.on('message', (data) => {
    console.log('📡 Received:', JSON.parse(data));
  });

  ws.on('close', () => {
    console.log('❌ Disconnected from Coinbase WebSocket. Reconnecting...');
    setTimeout(initCoinbaseWebSocket, 5000); // Reconnect after 5s
  });

  ws.on('error', (err) => {
    console.error('⚠️ WebSocket Error:', err);
  });

  return ws;
};

// REST API Endpoints
app.get('/api/history/:product', async (req, res) => {
  try {
    const response = await axios.get(`https://api.pro.coinbase.com/products/${req.params.product}/candles`);
    res.json(response.data);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch historical data' });
  }
});

// Start HTTP server
const server = app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});

// WebSocket server for frontend
const wss = new WebSocket.Server({ server });

wss.on('connection', (clientWS) => {
  console.log('🔌 New frontend client connected');

  clientWS.on('close', () => {
    console.log('🔌 Frontend client disconnected');
  });
});