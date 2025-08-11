require('dotenv').config();
const axios = require('axios');
const WebSocket = require('ws');

const API_BASE = 'https://api.pro.coinbase.com';
const WS_URL = 'wss://ws-feed.pro.coinbase.com';

class CoinbaseService {
  constructor() {
    this.wsClients = new Set();
    this.initWebSocket();
  }

  // REST API Methods
  async getHistoricalData(product = 'BTC-USD', granularity = 3600) {
    const response = await axios.get(`${API_BASE}/products/${product}/candles`, {
      params: { granularity }
    });
    return response.data.map(([time, low, high, open, close, volume]) => ({
      time: new Date(time * 1000),
      low, high, open, close, volume
    }));
  }

  async getAccountBalance() {
    // Implement auth using API keys
    const response = await axios.get(`${API_BASE}/accounts`, {
      headers: this._getAuthHeaders()
    });
    return response.data;
  }

  // WebSocket Management
  initWebSocket() {
    this.ws = new WebSocket(WS_URL);
    
    this.ws.on('open', () => {
      this.ws.send(JSON.stringify({
        type: 'subscribe',
        product_ids: ['BTC-USD', 'ETH-USD'],
        channels: ['ticker', 'level2']
      }));
    });

    this.ws.on('message', (data) => {
      const message = JSON.parse(data);
      this.broadcast(message);
    });
  }

  broadcast(data) {
    this.wsClients.forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify(data));
      }
    });
  }

  // Helper for authenticated requests
  _getAuthHeaders() {
    const timestamp = Date.now() / 1000;
    const message = timestamp + 'GET' + '/accounts';
    const signature = crypto
      .createHmac('sha256', process.env.API_SECRET)
      .update(message)
      .digest('base64');

    return {
      'CB-ACCESS-KEY': process.env.API_KEY,
      'CB-ACCESS-SIGN': signature,
      'CB-ACCESS-TIMESTAMP': timestamp,
      'CB-ACCESS-PASSPHRASE': process.env.API_PASSPHRASE
    };
  }
}

module.exports = new CoinbaseService();