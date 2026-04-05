const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

const app = express();
const PORT = process.env.PORT || 3002;

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

// In-memory user store (replace with database in production)
const users = new Map([
  ['USR001', {
    id: 'USR001',
    phone: '081-234-5678',
    name: 'สมชาย',
    email: 'somchai@example.com',
    profile: {
      firstName: 'สมชาย',
      lastName: 'ใจดี',
      dateOfBirth: '1990-01-15',
      address: '123 ถนนสุขุมวิท แขวงคลองเตย เขตคลองเตย กรุงเทพฯ 10110',
      occupation: 'พนักงานบริษัท',
      monthlyIncome: 45000
    },
    preferences: {
      language: 'th',
      currency: 'THB',
      notifications: {
        sms: true,
        email: true,
        push: false
      }
    },
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  }],
  ['USR002', {
    id: 'USR002',
    phone: '082-345-6789',
    name: 'สุนีย์',
    email: 'sunny@example.com',
    profile: {
      firstName: 'สุนีย์',
      lastName: 'รักเรียน',
      dateOfBirth: '1985-05-20',
      address: '456 ถนนพระราม 9 แขวงห้วยขวาง เขตห้วยขวาง กรุงเทพฯ 10310',
      occupation: 'ครู',
      monthlyIncome: 35000
    },
    preferences: {
      language: 'th',
      currency: 'THB',
      notifications: {
        sms: true,
        email: false,
        push: true
      }
    },
    createdAt: '2024-01-02T00:00:00Z',
    updatedAt: '2024-01-02T00:00:00Z'
  }]
]);

// Helper functions
function findUserById(userId) {
  return users.get(userId) || null;
}

function findUserByPhone(phone) {
  // Remove dashes and compare last 8 digits
  const cleanPhone = phone.replace(/-/g, '');
  const last8 = cleanPhone.slice(-8);

  for (const [id, user] of users) {
    const userPhone = user.phone.replace(/-/g, '').slice(-8);
    if (userPhone === last8) {
      return user;
    }
  }
  return null;
}

// Authentication middleware (simplified - in production use JWT verification)
function authenticate(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      message: 'ไม่พบ token การยืนยันตัวตน'
    });
  }

  // In production, verify JWT token here
  const token = authHeader.substring(7);
  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Token ไม่ถูกต้อง'
    });
  }

  // For demo, extract userId from token (simplified)
  try {
    // This would normally decode JWT
    const userId = token.split('_')[0]; // Simplified
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
app.get('/users/:userId', authenticate, (req, res) => {
  try {
    const { userId } = req.params;

    // Check if user can access this data
    if (req.userId !== userId) {
      return res.status(403).json({
        success: false,
        message: 'ไม่มีสิทธิ์เข้าถึงข้อมูลนี้'
      });
    }

    const user = findUserById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'ไม่พบผู้ใช้'
      });
    }

    res.json({
      success: true,
      data: {
        id: user.id,
        phone: user.phone,
        name: user.name,
        email: user.email,
        profile: user.profile,
        preferences: user.preferences,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      }
    });

  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({
      success: false,
      message: 'เกิดข้อผิดพลาดในการดึงข้อมูลผู้ใช้'
    });
  }
});

app.put('/users/:userId', authenticate, (req, res) => {
  try {
    const { userId } = req.params;
    const updates = req.body;

    // Check if user can update this data
    if (req.userId !== userId) {
      return res.status(403).json({
        success: false,
        message: 'ไม่มีสิทธิ์แก้ไขข้อมูลนี้'
      });
    }

    const user = findUserById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'ไม่พบผู้ใช้'
      });
    }

    // Update allowed fields
    if (updates.profile) {
      user.profile = { ...user.profile, ...updates.profile };
    }
    if (updates.preferences) {
      user.preferences = { ...user.preferences, ...updates.preferences };
    }

    user.updatedAt = new Date().toISOString();

    res.json({
      success: true,
      message: 'อัปเดตข้อมูลสำเร็จ',
      data: {
        id: user.id,
        name: user.name,
        updatedAt: user.updatedAt
      }
    });

  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({
      success: false,
      message: 'เกิดข้อผิดพลาดในการอัปเดตข้อมูล'
    });
  }
});

app.get('/users/search', authenticate, (req, res) => {
  try {
    const { phone } = req.query;

    if (!phone) {
      return res.status(400).json({
        success: false,
        message: 'กรุณากรอกเบอร์โทร'
      });
    }

    const user = findUserByPhone(phone);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'ไม่พบผู้ใช้'
      });
    }

    // Return limited user info for search
    res.json({
      success: true,
      data: {
        id: user.id,
        name: user.name,
        phone: user.phone
      }
    });

  } catch (error) {
    console.error('Search user error:', error);
    res.status(500).json({
      success: false,
      message: 'เกิดข้อผิดพลาดในการค้นหาผู้ใช้'
    });
  }
});

// Health check
app.get('/health', (req, res) => {
  res.json({
    service: 'user-service',
    status: 'healthy',
    timestamp: new Date().toISOString()
  });
});

app.listen(PORT, () => {
  console.log(`👤 User Service running on port ${PORT}`);
});