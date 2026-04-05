const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

const app = express();
const PORT = process.env.PORT || 3006;

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// In-memory investment data (would be replaced with database)
const investments = [
  {
    id: 1,
    name: 'SET50 Index Fund',
    type: 'Index Fund',
    currentValue: 1250000,
    investedAmount: 1000000,
    return: 0.25,
    risk: 'Medium',
    description: 'Tracks the SET50 index with low fees'
  },
  {
    id: 2,
    name: 'Thai Bond Fund',
    type: 'Bond Fund',
    currentValue: 750000,
    investedAmount: 700000,
    return: 0.07,
    risk: 'Low',
    description: 'Government bonds with stable returns'
  },
  {
    id: 3,
    name: 'Tech Growth Fund',
    type: 'Equity Fund',
    currentValue: 850000,
    investedAmount: 800000,
    return: 0.06,
    risk: 'High',
    description: 'Technology sector growth investments'
  }
];

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', service: 'investment-service', timestamp: new Date().toISOString() });
});

// Get all investments
app.get('/investments', (req, res) => {
  res.json({ investments });
});

// Get investment by ID
app.get('/investments/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const investment = investments.find(inv => inv.id === id);

  if (!investment) {
    return res.status(404).json({ error: 'Investment not found' });
  }

  res.json({ investment });
});

// Calculate portfolio performance
app.post('/portfolio/analysis', (req, res) => {
  try {
    const { investments: portfolioInvestments } = req.body;

    if (!Array.isArray(portfolioInvestments)) {
      return res.status(400).json({ error: 'Invalid portfolio data' });
    }

    let totalInvested = 0;
    let totalCurrent = 0;
    let totalReturn = 0;

    portfolioInvestments.forEach(inv => {
      totalInvested += inv.investedAmount || 0;
      totalCurrent += inv.currentValue || 0;
    });

    totalReturn = totalCurrent - totalInvested;
    const returnPercentage = totalInvested > 0 ? totalReturn / totalInvested : 0;

    res.json({
      totalInvested,
      totalCurrent,
      totalReturn,
      returnPercentage,
      analysis: {
        performance: returnPercentage > 0 ? 'Positive' : 'Negative',
        recommendation: returnPercentage > 0.1 ? 'Hold' : 'Review portfolio'
      }
    });
  } catch (error) {
    console.error('Portfolio analysis error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get investment recommendations
app.get('/recommendations', (req, res) => {
  const recommendations = [
    {
      type: 'Conservative',
      suggestion: 'Focus on bond funds and stable investments',
      expectedReturn: '3-5%'
    },
    {
      type: 'Balanced',
      suggestion: 'Mix of stocks and bonds for moderate growth',
      expectedReturn: '5-8%'
    },
    {
      type: 'Aggressive',
      suggestion: 'High-growth stocks and emerging markets',
      expectedReturn: '8-15%'
    }
  ];

  res.json({ recommendations });
});

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

app.listen(PORT, () => {
  console.log(`🚀 Investment Service running on port ${PORT}`);
});