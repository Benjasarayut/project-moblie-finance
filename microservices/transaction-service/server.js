const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { v4: uuidv4 } = require('uuid');

const app = express();
const PORT = process.env.PORT || 3004;

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

// In-memory transaction store (replace with database in production)
const transactions = new Map([
  ['TXN001', {
    id: 'TXN001',
    userId: 'USR001',
    accountId: 'ACC001',
    type: 'transfer',
    amount: 5000.00,
    currency: 'THB',
    description: 'โอนเงินให้เพื่อน',
    recipient: {
      name: 'สมหญิง',
      accountNumber: '0987654321'
    },
    status: 'completed',
    timestamp: '2024-01-15T10:30:00Z',
    reference: 'REF001'
  }],
  ['TXN002', {
    id: 'TXN002',
    userId: 'USR001',
    accountId: 'ACC001',
    type: 'deposit',
    amount: 10000.00,
    currency: 'THB',
    description: 'ฝากเงินเดือน',
    status: 'completed',
    timestamp: '2024-01-14T09:00:00Z',
    reference: 'REF002'
  }],
  ['TXN003', {
    id: 'TXN003',
    userId: 'USR002',
    accountId: 'ACC003',
    type: 'withdraw',
    amount: 2000.00,
    currency: 'THB',
    description: 'ถอนเงินค่าอาหาร',
    status: 'completed',
    timestamp: '2024-01-13T12:15:00Z',
    reference: 'REF003'
  }]
]);

// Helper functions
function getUserTransactions(userId, limit = 50, offset = 0) {
  const userTransactions = Array.from(transactions.values())
    .filter(txn => txn.userId === userId)
    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

  return {
    transactions: userTransactions.slice(offset, offset + limit),
    total: userTransactions.length,
    limit,
    offset
  };
}

function findTransactionById(transactionId) {
  return transactions.get(transactionId) || null;
}

function createTransaction(transactionData) {
  const id = uuidv4();
  const transaction = {
    id,
    ...transactionData,
    status: 'pending',
    timestamp: new Date().toISOString(),
    reference: `REF${Date.now()}`
  };

  transactions.set(id, transaction);
  return transaction;
}

// Authentication middleware (simplified)
function authenticate(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      message: 'ไม่พบ token การยืนยันตัวตน'
    });
  }

  const token = authHeader.substring(7);
  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Token ไม่ถูกต้อง'
    });
  }

  try {
    const userId = token.split('_')[0];
    req.userId = userId;
    next();
  } catch (error) {
    res.status(401).json({
      success: false,
      message: 'Token ไม่ถูกต้อง'
    });
  }
}

// Routes
app.get('/transactions', authenticate, (req, res) => {
  try {
    const { limit = 50, offset = 0, type, status } = req.query;

    let userTransactions = getUserTransactions(req.userId, parseInt(limit), parseInt(offset));

    // Filter by type if specified
    if (type) {
      userTransactions.transactions = userTransactions.transactions.filter(txn => txn.type === type);
    }

    // Filter by status if specified
    if (status) {
      userTransactions.transactions = userTransactions.transactions.filter(txn => txn.status === status);
    }

    res.json({
      success: true,
      data: userTransactions
    });

  } catch (error) {
    console.error('Get transactions error:', error);
    res.status(500).json({
      success: false,
      message: 'เกิดข้อผิดพลาดในการดึงข้อมูลธุรกรรม'
    });
  }
});

app.get('/transactions/:transactionId', authenticate, (req, res) => {
  try {
    const { transactionId } = req.params;
    const transaction = findTransactionById(transactionId);

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'ไม่พบข้อมูลธุรกรรม'
      });
    }

    // Check ownership
    if (transaction.userId !== req.userId) {
      return res.status(403).json({
        success: false,
        message: 'ไม่มีสิทธิ์เข้าถึงธุรกรรมนี้'
      });
    }

    res.json({
      success: true,
      data: transaction
    });

  } catch (error) {
    console.error('Get transaction error:', error);
    res.status(500).json({
      success: false,
      message: 'เกิดข้อผิดพลาดในการดึงข้อมูลธุรกรรม'
    });
  }
});

app.post('/transactions/transfer', authenticate, async (req, res) => {
  try {
    const { fromAccountId, toAccountNumber, amount, description } = req.body;

    if (!fromAccountId || !toAccountNumber || !amount) {
      return res.status(400).json({
        success: false,
        message: 'กรุณากรอกข้อมูลให้ครบ'
      });
    }

    if (amount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'จำนวนเงินต้องมากกว่า 0'
      });
    }

    // Check if sender account belongs to user
    // In production, call account-service to verify

    // Create transaction record
    const transaction = createTransaction({
      userId: req.userId,
      accountId: fromAccountId,
      type: 'transfer',
      amount: -amount, // Negative for outgoing
      currency: 'THB',
      description: description || 'โอนเงิน',
      recipient: {
        accountNumber: toAccountNumber
      }
    });

    // In production, this would involve:
    // 1. Check sender balance via account-service
    // 2. Deduct from sender account
    // 3. Credit to recipient account
    // 4. Update transaction status

    // For demo, mark as completed immediately
    transaction.status = 'completed';

    res.json({
      success: true,
      message: 'โอนเงินสำเร็จ',
      data: {
        transactionId: transaction.id,
        reference: transaction.reference,
        amount: amount,
        recipient: toAccountNumber,
        timestamp: transaction.timestamp
      }
    });

  } catch (error) {
    console.error('Transfer error:', error);
    res.status(500).json({
      success: false,
      message: 'เกิดข้อผิดพลาดในการโอนเงิน'
    });
  }
});

app.get('/transactions/summary/:period', authenticate, (req, res) => {
  try {
    const { period } = req.params; // 'month', 'week', 'year'
    const userTransactions = Array.from(transactions.values())
      .filter(txn => txn.userId === req.userId);

    const now = new Date();
    let startDate;

    switch (period) {
      case 'week':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'month':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      case 'year':
        startDate = new Date(now.getFullYear(), 0, 1);
        break;
      default:
        return res.status(400).json({
          success: false,
          message: 'ช่วงเวลาที่ระบุไม่ถูกต้อง'
        });
    }

    const periodTransactions = userTransactions.filter(txn =>
      new Date(txn.timestamp) >= startDate
    );

    const summary = {
      period,
      totalTransactions: periodTransactions.length,
      totalAmount: periodTransactions.reduce((sum, txn) => sum + Math.abs(txn.amount), 0),
      income: periodTransactions
        .filter(txn => txn.amount > 0)
        .reduce((sum, txn) => sum + txn.amount, 0),
      expenses: Math.abs(periodTransactions
        .filter(txn => txn.amount < 0)
        .reduce((sum, txn) => sum + txn.amount, 0)),
      startDate: startDate.toISOString(),
      endDate: now.toISOString()
    };

    res.json({
      success: true,
      data: summary
    });

  } catch (error) {
    console.error('Summary error:', error);
    res.status(500).json({
      success: false,
      message: 'เกิดข้อผิดพลาดในการคำนวณสรุป'
    });
  }
});

// Health check
app.get('/health', (req, res) => {
  res.json({
    service: 'transaction-service',
    status: 'healthy',
    timestamp: new Date().toISOString()
  });
});

app.listen(PORT, () => {
  console.log(`💸 Transaction Service running on port ${PORT}`);
});