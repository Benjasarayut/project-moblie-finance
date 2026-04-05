const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

const app = express();
const PORT = process.env.PORT || 3005;

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

// In-memory tax data (would be replaced with database)
const taxBrackets = [
  { min: 0, max: 150000, rate: 0 },
  { min: 150000, max: 300000, rate: 0.05 },
  { min: 300000, max: 500000, rate: 0.10 },
  { min: 500000, max: 750000, rate: 0.15 },
  { min: 750000, max: 1000000, rate: 0.20 },
  { min: 1000000, max: 2000000, rate: 0.25 },
  { min: 2000000, max: 5000000, rate: 0.30 },
  { min: 5000000, max: Infinity, rate: 0.35 }
];

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', service: 'tax-service', timestamp: new Date().toISOString() });
});

// Calculate tax
app.post('/calculate', (req, res) => {
  try {
    const { income, deductions = 0 } = req.body;

    if (typeof income !== 'number' || income < 0) {
      return res.status(400).json({ error: 'Invalid income amount' });
    }

    const taxableIncome = Math.max(0, income - deductions);
    let tax = 0;
    let breakdown = [];

    for (const bracket of taxBrackets) {
      if (taxableIncome > bracket.min) {
        const taxableInBracket = Math.min(taxableIncome - bracket.min, bracket.max - bracket.min);
        const taxInBracket = taxableInBracket * bracket.rate;

        if (taxInBracket > 0) {
          tax += taxInBracket;
          breakdown.push({
            bracket: `${bracket.min.toLocaleString()} - ${bracket.max === Infinity ? '∞' : bracket.max.toLocaleString()}`,
            rate: bracket.rate,
            taxableAmount: taxableInBracket,
            tax: taxInBracket
          });
        }
      }
    }

    res.json({
      income,
      deductions,
      taxableIncome,
      totalTax: tax,
      effectiveRate: income > 0 ? tax / income : 0,
      breakdown
    });
  } catch (error) {
    console.error('Tax calculation error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get tax brackets
app.get('/brackets', (req, res) => {
  res.json({ brackets: taxBrackets });
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
  console.log(`🚀 Tax Service running on port ${PORT}`);
});