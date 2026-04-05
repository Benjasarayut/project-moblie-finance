const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

const app = express();
const PORT = process.env.PORT || 3003;

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

// In-memory account store (replace with database in production)
const accounts = new Map([
  ['ACC001', {
    id: 'ACC001',
    userId: 'USR001',
    accountNumber: '1234567890',
    accountName: 'บัญชีออมทรัพย์',
    type: 'savings',
    balance: 125000.50,
    currency: 'THB',
    status: 'active',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  }],
  ['ACC002', {
    id: 'ACC002',
    userId: 'USR001',
    accountNumber: '1234567891',
    accountName: 'บัญชีกระแสรายวัน',
    type: 'checking',
    balance: 25000.75,
    currency: 'THB',
    status: 'active',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  }],
  ['ACC003', {
    id: 'ACC003',
    userId: 'USR002',
    accountNumber: '2345678901',
    accountName: 'บัญชีออมทรัพย์',
    type: 'savings',
    balance: 89000.25,
    currency: 'THB',
    status: 'active',
    createdAt: '2024-01-02T00:00:00Z',
    updatedAt: '2024-01-02T00:00:00Z'
  }]
]);

// Helper functions
function getUserAccounts(userId) {
  return Array.from(accounts.values()).filter(account => account.userId === userId);
}

function findAccountById(accountId) {
  return accounts.get(accountId) || null;
}

function updateAccountBalance(accountId, amount) {
  const account = accounts.get(accountId);
  if (account) {
    account.balance += amount;
    account.updatedAt = new Date().toISOString();
    return account;
  }
  return null;
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
app.get('/accounts', authenticate, (req, res) => {
  try {
    const userAccounts = getUserAccounts(req.userId);

    const summary = {
      totalBalance: userAccounts.reduce((sum, acc) => sum + acc.balance, 0),
      accountCount: userAccounts.length,
      accounts: userAccounts.map(acc => ({
        id: acc.id,
        accountNumber: acc.accountNumber,
        accountName: acc.accountName,
        type: acc.type,
        balance: acc.balance,
        currency: acc.currency,
        status: acc.status
      }))
    };

    res.json({
      success: true,
      data: summary
    });

  } catch (error) {
    console.error('Get accounts error:', error);
    res.status(500).json({
      success: false,
      message: 'เกิดข้อผิดพลาดในการดึงข้อมูลบัญชี'
    });
  }
});

app.get('/accounts/:accountId', authenticate, (req, res) => {
  try {
    const { accountId } = req.params;
    const account = findAccountById(accountId);

    if (!account) {
      return res.status(404).json({
        success: false,
        message: 'ไม่พบข้อมูลบัญชี'
      });
    }

    // Check ownership
    if (account.userId !== req.userId) {
      return res.status(403).json({
        success: false,
        message: 'ไม่มีสิทธิ์เข้าถึงบัญชีนี้'
      });
    }

    res.json({
      success: true,
      data: {
        id: account.id,
        accountNumber: account.accountNumber,
        accountName: account.accountName,
        type: account.type,
        balance: account.balance,
        currency: account.currency,
        status: account.status,
        createdAt: account.createdAt,
        updatedAt: account.updatedAt
      }
    });

  } catch (error) {
    console.error('Get account error:', error);
    res.status(500).json({
      success: false,
      message: 'เกิดข้อผิดพลาดในการดึงข้อมูลบัญชี'
    });
  }
});

app.post('/accounts/:accountId/deposit', authenticate, (req, res) => {
  try {
    const { accountId } = req.params;
    const { amount, description } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'จำนวนเงินต้องมากกว่า 0'
      });
    }

    const account = findAccountById(accountId);
    if (!account) {
      return res.status(404).json({
        success: false,
        message: 'ไม่พบข้อมูลบัญชี'
      });
    }

    // Check ownership
    if (account.userId !== req.userId) {
      return res.status(403).json({
        success: false,
        message: 'ไม่มีสิทธิ์เข้าถึงบัญชีนี้'
      });
    }

    const updatedAccount = updateAccountBalance(accountId, amount);

    res.json({
      success: true,
      message: 'ฝากเงินสำเร็จ',
      data: {
        accountId: accountId,
        newBalance: updatedAccount.balance,
        transaction: {
          type: 'deposit',
          amount: amount,
          description: description || 'ฝากเงิน',
          timestamp: new Date().toISOString()
        }
      }
    });

  } catch (error) {
    console.error('Deposit error:', error);
    res.status(500).json({
      success: false,
      message: 'เกิดข้อผิดพลาดในการฝากเงิน'
    });
  }
});

app.post('/accounts/:accountId/withdraw', authenticate, (req, res) => {
  try {
    const { accountId } = req.params;
    const { amount, description } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'จำนวนเงินต้องมากกว่า 0'
      });
    }

    const account = findAccountById(accountId);
    if (!account) {
      return res.status(404).json({
        success: false,
        message: 'ไม่พบข้อมูลบัญชี'
      });
    }

    // Check ownership
    if (account.userId !== req.userId) {
      return res.status(403).json({
        success: false,
        message: 'ไม่มีสิทธิ์เข้าถึงบัญชีนี้'
      });
    }

    if (account.balance < amount) {
      return res.status(400).json({
        success: false,
        message: 'ยอดเงินในบัญชีไม่เพียงพอ'
      });
    }

    const updatedAccount = updateAccountBalance(accountId, -amount);

    res.json({
      success: true,
      message: 'ถอนเงินสำเร็จ',
      data: {
        accountId: accountId,
        newBalance: updatedAccount.balance,
        transaction: {
          type: 'withdraw',
          amount: amount,
          description: description || 'ถอนเงิน',
          timestamp: new Date().toISOString()
        }
      }
    });

  } catch (error) {
    console.error('Withdraw error:', error);
    res.status(500).json({
      success: false,
      message: 'เกิดข้อผิดพลาดในการถอนเงิน'
    });
  }
});

// Health check
app.get('/health', (req, res) => {
  res.json({
    service: 'account-service',
    status: 'healthy',
    timestamp: new Date().toISOString()
  });
});

app.listen(PORT, () => {
  console.log(`💳 Account Service running on port ${PORT}`);
});