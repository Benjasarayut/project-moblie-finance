const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 3001;

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
    password: '$2a$10$example.hash.here', // bcrypt hash of 'password123'
    name: 'สมชาย',
    email: 'somchai@example.com',
    role: 'user'
  }],
  ['USR002', {
    id: 'USR002',
    phone: '082-345-6789',
    password: '$2a$10$example.hash.here', // bcrypt hash of 'password123'
    name: 'สุนีย์',
    email: 'sunny@example.com',
    role: 'user'
  }]
]);

// OTP store (in production, use Redis)
const otpStore = new Map();

// JWT Secret
const JWT_SECRET = process.env.JWT_SECRET || 'thaibank-secret-key';

// Helper functions
function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
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

// Routes
app.post('/auth/login', async (req, res) => {
  try {
    const { phone, password } = req.body;

    if (!phone || !password) {
      return res.status(400).json({
        success: false,
        message: 'กรุณากรอกเบอร์โทรและรหัสผ่าน'
      });
    }

    const user = findUserByPhone(phone);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'ไม่พบผู้ใช้'
      });
    }

    // Check password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        message: 'รหัสผ่านไม่ถูกต้อง'
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      {
        userId: user.id,
        phone: user.phone,
        name: user.name
      },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      success: true,
      message: 'เข้าสู่ระบบสำเร็จ',
      data: {
        token,
        user: {
          id: user.id,
          name: user.name,
          phone: user.phone
        }
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'เกิดข้อผิดพลาดในการเข้าสู่ระบบ'
    });
  }
});

app.post('/auth/verify-token', (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({
        success: false,
        message: 'ไม่พบ token'
      });
    }

    const decoded = jwt.verify(token, JWT_SECRET);

    res.json({
      success: true,
      data: {
        userId: decoded.userId,
        name: decoded.name,
        phone: decoded.phone
      }
    });

  } catch (error) {
    res.status(401).json({
      success: false,
      message: 'Token ไม่ถูกต้อง'
    });
  }
});

app.post('/auth/send-otp', async (req, res) => {
  try {
    const { phone, type = 'sms' } = req.body;

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

    const otp = generateOTP();
    const key = `${phone}_${type}`;

    // Store OTP (expires in 5 minutes)
    otpStore.set(key, {
      otp,
      expires: Date.now() + 5 * 60 * 1000,
      attempts: 0
    });

    // In production, send actual SMS/email
    console.log(`📱 OTP for ${phone} (${type}): ${otp}`);

    res.json({
      success: true,
      message: `ส่ง OTP ไปยัง${type === 'sms' ? 'เบอร์โทร' : 'อีเมล'}แล้ว`
    });

  } catch (error) {
    console.error('Send OTP error:', error);
    res.status(500).json({
      success: false,
      message: 'เกิดข้อผิดพลาดในการส่ง OTP'
    });
  }
});

app.post('/auth/verify-otp', (req, res) => {
  try {
    const { phone, otp, type = 'sms' } = req.body;

    if (!phone || !otp) {
      return res.status(400).json({
        success: false,
        message: 'กรุณากรอกข้อมูลให้ครบ'
      });
    }

    const key = `${phone}_${type}`;
    const otpData = otpStore.get(key);

    if (!otpData) {
      return res.status(400).json({
        success: false,
        message: 'OTP หมดอายุหรือไม่ถูกต้อง'
      });
    }

    if (Date.now() > otpData.expires) {
      otpStore.delete(key);
      return res.status(400).json({
        success: false,
        message: 'OTP หมดอายุ'
      });
    }

    if (otpData.attempts >= 3) {
      otpStore.delete(key);
      return res.status(429).json({
        success: false,
        message: 'พยายามยืนยัน OTP เกินกำหนด'
      });
    }

    if (otpData.otp !== otp) {
      otpData.attempts++;
      return res.status(400).json({
        success: false,
        message: 'OTP ไม่ถูกต้อง'
      });
    }

    // OTP verified successfully
    otpStore.delete(key);

    res.json({
      success: true,
      message: 'ยืนยัน OTP สำเร็จ'
    });

  } catch (error) {
    console.error('Verify OTP error:', error);
    res.status(500).json({
      success: false,
      message: 'เกิดข้อผิดพลาดในการยืนยัน OTP'
    });
  }
});

// Health check
app.get('/health', (req, res) => {
  res.json({
    service: 'auth-service',
    status: 'healthy',
    timestamp: new Date().toISOString()
  });
});

app.listen(PORT, () => {
  console.log(`🔐 Auth Service running on port ${PORT}`);
});