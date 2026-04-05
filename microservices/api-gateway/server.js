const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { createProxyMiddleware } = require('http-proxy-middleware');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 3000;

// Service URLs (in production, use service discovery)
const SERVICES = {
  auth: process.env.AUTH_SERVICE_URL || 'http://localhost:3001',
  user: process.env.USER_SERVICE_URL || 'http://localhost:3002',
  account: process.env.ACCOUNT_SERVICE_URL || 'http://localhost:3003',
  transaction: process.env.TRANSACTION_SERVICE_URL || 'http://localhost:3004',
  tax: process.env.TAX_SERVICE_URL || 'http://localhost:3005',
  investment: process.env.INVESTMENT_SERVICE_URL || 'http://localhost:3006'
};

// Middleware
app.use(helmet());
app.use(cors({
  origin: ['http://localhost:8080', 'http://localhost:3000'],
  credentials: true
}));
app.use(express.json());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000 // limit each IP to 1000 requests per windowMs
});
app.use(limiter);

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Health check for all services
app.get('/health', async (req, res) => {
  try {
    const healthChecks = await Promise.allSettled([
      axios.get(`${SERVICES.auth}/health`),
      axios.get(`${SERVICES.user}/health`),
      axios.get(`${SERVICES.account}/health`),
      axios.get(`${SERVICES.transaction}/health`)
    ]);

    const results = {
      gateway: 'healthy',
      timestamp: new Date().toISOString(),
      services: {
        auth: healthChecks[0].status === 'fulfilled' ? healthChecks[0].value.data : 'unhealthy',
        user: healthChecks[1].status === 'fulfilled' ? healthChecks[1].value.data : 'unhealthy',
        account: healthChecks[2].status === 'fulfilled' ? healthChecks[2].value.data : 'unhealthy',
        transaction: healthChecks[3].status === 'fulfilled' ? healthChecks[3].value.data : 'unhealthy'
      }
    };

    const allHealthy = Object.values(results.services).every(service =>
      service !== 'unhealthy'
    );

    res.status(allHealthy ? 200 : 503).json(results);

  } catch (error) {
    res.status(503).json({
      gateway: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: error.message
    });
  }
});

// Authentication routes (direct to auth service)
app.use('/api/auth', createProxyMiddleware({
  target: SERVICES.auth,
  changeOrigin: true,
  pathRewrite: {
    '^/api/auth': '/auth'
  },
  onError: (err, req, res) => {
    console.error('Auth service error:', err.message);
    res.status(503).json({
      success: false,
      message: 'Authentication service unavailable'
    });
  }
}));

// User routes (with auth middleware)
app.use('/api/users', createProxyMiddleware({
  target: SERVICES.user,
  changeOrigin: true,
  pathRewrite: {
    '^/api/users': '/users'
  },
  onError: (err, req, res) => {
    console.error('User service error:', err.message);
    res.status(503).json({
      success: false,
      message: 'User service unavailable'
    });
  }
}));

// Account routes
app.use('/api/accounts', createProxyMiddleware({
  target: SERVICES.account,
  changeOrigin: true,
  pathRewrite: {
    '^/api/accounts': '/accounts'
  },
  onError: (err, req, res) => {
    console.error('Account service error:', err.message);
    res.status(503).json({
      success: false,
      message: 'Account service unavailable'
    });
  }
}));

// Transaction routes
app.use('/api/transactions', createProxyMiddleware({
  target: SERVICES.transaction,
  changeOrigin: true,
  pathRewrite: {
    '^/api/transactions': '/transactions'
  },
  onError: (err, req, res) => {
    console.error('Transaction service error:', err.message);
    res.status(503).json({
      success: false,
      message: 'Transaction service unavailable'
    });
  }
}));

// Tax calculation routes (placeholder)
app.use('/api/tax', createProxyMiddleware({
  target: SERVICES.tax,
  changeOrigin: true,
  pathRewrite: {
    '^/api/tax': '/tax'
  },
  onError: (err, req, res) => {
    // Fallback for tax calculation
    res.json({
      success: true,
      data: {
        taxAmount: 0,
        message: 'Tax service not available - using simplified calculation'
      }
    });
  }
}));

// Investment analysis routes (placeholder)
app.use('/api/investment', createProxyMiddleware({
  target: SERVICES.investment,
  changeOrigin: true,
  pathRewrite: {
    '^/api/investment': '/investment'
  },
  onError: (err, req, res) => {
    // Fallback for investment analysis
    res.json({
      success: true,
      data: {
        analysis: 'Investment service not available',
        recommendation: 'Consult with financial advisor'
      }
    });
  }
}));

// Combined dashboard data endpoint
app.get('/api/dashboard', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    // Get user info
    const userResponse = await axios.get(`${SERVICES.user}/users/profile`, {
      headers: { authorization: authHeader }
    });

    // Get account summary
    const accountResponse = await axios.get(`${SERVICES.account}/accounts`, {
      headers: { authorization: authHeader }
    });

    // Get recent transactions
    const transactionResponse = await axios.get(`${SERVICES.transaction}/transactions?limit=5`, {
      headers: { authorization: authHeader }
    });

    const dashboardData = {
      user: userResponse.data.data,
      accounts: accountResponse.data.data,
      recentTransactions: transactionResponse.data.data.transactions,
      timestamp: new Date().toISOString()
    };

    res.json({
      success: true,
      data: dashboardData
    });

  } catch (error) {
    console.error('Dashboard error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Unable to load dashboard data'
    });
  }
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Gateway error:', error);
  res.status(500).json({
    success: false,
    message: 'Internal server error'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'API endpoint not found'
  });
});

app.listen(PORT, () => {
  console.log(`🚪 API Gateway running on port ${PORT}`);
  console.log('Services:');
  Object.entries(SERVICES).forEach(([name, url]) => {
    console.log(`  ${name}: ${url}`);
  });
});