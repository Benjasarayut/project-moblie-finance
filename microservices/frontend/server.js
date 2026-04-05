const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const path = require('path');
const { createProxyMiddleware } = require('http-proxy-middleware');

const app = express();
const PORT = process.env.PORT || 8080;

// API Gateway URL
const API_GATEWAY_URL = process.env.API_GATEWAY_URL || 'http://localhost:3000';

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// API proxy to gateway
app.use('/api', createProxyMiddleware({
  target: API_GATEWAY_URL,
  changeOrigin: true,
  onError: (err, req, res) => {
    console.error('API proxy error:', err.message);
    res.status(503).json({
      success: false,
      message: 'API Gateway unavailable'
    });
  }
}));

// Serve static files from the public directory
app.use(express.static(path.join(__dirname, 'public')));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', service: 'frontend', timestamp: new Date().toISOString() });
});

// Fallback to index.html for SPA routing
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`🌐 Frontend server running on port ${PORT}`);
  console.log(`📡 API Gateway: ${API_GATEWAY_URL}`);
});

// Health check
app.get('/health', (req, res) => {
  res.json({
    service: 'frontend',
    status: 'healthy',
    apiGateway: API_GATEWAY_URL,
    timestamp: new Date().toISOString()
  });
});

// Catch all handler: send back index.html for client-side routing
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../../public/index.html'));
});

app.listen(PORT, () => {
  console.log(`🌐 Frontend Service running on port ${PORT}`);
  console.log(`📡 API Gateway: ${API_GATEWAY_URL}`);
  console.log(`🔗 Access app at: http://localhost:${PORT}`);
});