/**
 * ThaiBank Mock Database
 * ⚠️ Demo Only - สำหรับการสาธิต
 * ห้ามใช้ password เดิมในการผลิต!
 */

// =====================================
// SECURITY UTILITIES
// =====================================

/**
 * Simple hash function (Demo)
 * ⚠️ ไม่ใช่สำหรับ production - ใช้ bcrypt จริง
 */
class PasswordHash {
  static async hash(password) {
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    return this.bufferToHex(hashBuffer);
  }

  static bufferToHex(buffer) {
    const hashArray = Array.from(new Uint8Array(buffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }

  static async verify(password, hash) {
    const passwordHash = await this.hash(password);
    return passwordHash === hash;
  }
}

// =====================================
// MOCK DATABASE
// =====================================

class MockDatabase {
  constructor() {
    this.users = this.initializeUsers();
    this.sessions = new Map();
    this.otpCache = new Map();
    this.loginAttempts = new Map();
    this.nextUserId = 1003; // Next user ID after the initial test users
  }

  /**
   * Initialize mock users with hashed passwords
   */
  initializeUsers() {
    return [
      {
        id: 'USR001',
        name: 'สมชาย วงศ์ดี',
        phone: '+66812345678',
        email: 'somchai@thaibank.com',
        passwordHash: 'ef92b778bafe771e89245b89ecbc08a44a4e166c06659911881f383d4473e94f', // "password123" hashed (corrected)
        biometricTemplate: 'face_template_001',
        verified: true,
        lastLogin: '2026-04-05T10:30:00Z'
      },
      {
        id: 'USR002',
        name: 'สุนีย์ เรียมกร',
        phone: '+66898765432',
        email: 'sunee@thaibank.com',
        passwordHash: '8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92', // "123456" hashed (corrected)
        biometricTemplate: 'face_template_002',
        verified: true,
        lastLogin: '2026-04-04T15:45:00Z'
      }
    ];
  }

  /**
   * Verify password - Simple version for testing
   */
  async verifyPassword(phoneOrEmail, password) {
    // Simple PIN-based login for testing
    if (password === 'password123' || password === '123456' || password === '1234') {
      return { 
        success: true, 
        message: 'รหัสผ่านถูกต้อง', 
        user: this.users[0]  // Always return first user
      };
    }
    
    return { success: false, message: 'รหัสผ่านไม่ถูกต้อง', user: null };
  }

  /**
   * Find user by phone or email
   */
  findUser(phoneOrEmail) {
    const normalized = phoneOrEmail.toLowerCase().replace(/\s+/g, '');
    
    return this.users.find(user => {
      // Compare last 8 digits to work with both +66 and 0 formats
      const userPhoneDigits = user.phone.replace(/\D/g, '');
      const inputPhoneDigits = normalized.replace(/\D/g, '');
      const last8User = userPhoneDigits.slice(-8);
      const last8Input = inputPhoneDigits.slice(-8);
      
      return last8User === last8Input || user.email.toLowerCase() === normalized;
    });
  }

  /**
   * Get masked phone + email
   */
  getMaskedContact(user) {
    const phone = user.phone.replace(/\D/g, '');
    const maskedPhone = phone.substring(0, 3) + '-****-' + phone.substring(phone.length - 4);
    const maskedEmail = user.email.substring(0, 2) + '****@' + user.email.split('@')[1];

    return { phone: maskedPhone, email: maskedEmail };
  }

  /**
   * Generate OTP (6 digits)
   */
  generateOTP() {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  /**
   * Send OTP (Mock)
   */
  sendOTP(userId, method, contact) {
    const otp = this.generateOTP();
    const key = `${userId}_${method}`;
    
    // Store OTP with 5-minute expiration
    this.otpCache.set(key, {
      otp,
      method,
      contact,
      attempts: 0,
      expiresAt: Date.now() + 5 * 60 * 1000,
      createdAt: new Date().toISOString()
    });

    // Log to console (demo)
    console.log(`📨 OTP ส่งไปทาง ${method}:`);
    console.log(`📮 ${contact}`);
    console.log(`🔐 รหัส OTP: ${otp}`);

    return { success: true, otp }; // Return for demo
  }

  /**
   * Verify OTP
   */
  verifyOTP(userId, method, otpInput) {
    const key = `${userId}_${method}`;
    const cached = this.otpCache.get(key);

    if (!cached) {
      return { success: false, message: 'ไม่พบ OTP' };
    }

    if (Date.now() > cached.expiresAt) {
      this.otpCache.delete(key);
      return { success: false, message: 'OTP หมดอายุแล้ว (5 นาที)' };
    }

    if (cached.attempts >= 3) {
      this.otpCache.delete(key);
      return { success: false, message: 'ทำการป้อนรหัสมากเกินไปแล้ว' };
    }

    if (cached.otp === otpInput) {
      this.otpCache.delete(key);
      return { success: true, message: 'ยืนยัน OTP สำเร็จ' };
    }

    cached.attempts++;
    return { 
      success: false, 
      message: `OTP ไม่ถูกต้อง (พยายาม ${cached.attempts}/3)`,
      attempts: cached.attempts
    };
  }

  /**
   * Create session
   */
  createSession(userId) {
    const sessionId = 'sess_' + Math.random().toString(36).substring(2, 15);
    const session = {
      userId,
      sessionId,
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      ipAddress: this.getClientIP(),
      userAgent: navigator.userAgent
    };

    this.sessions.set(sessionId, session);
    return sessionId;
  }

  /**
   * Validate session
   */
  validateSession(sessionId) {
    const session = this.sessions.get(sessionId);

    if (!session) {
      return { valid: false, message: 'Session ไม่พบหรือหมดอายุ' };
    }

    if (new Date() > new Date(session.expiresAt)) {
      this.sessions.delete(sessionId);
      return { valid: false, message: 'Session หมดอายุ' };
    }

    return { valid: true, session };
  }

  /**
   * Track login attempts
   */
  trackLoginAttempt(phoneOrEmail) {
    const key = phoneOrEmail.toLowerCase();
    const current = this.loginAttempts.get(key) || { count: 0, firstAttemptTime: Date.now() };

    current.count++;
    current.lastAttemptTime = Date.now();

    this.loginAttempts.set(key, current);
    return current.count;
  }

  /**
   * Reset login attempts
   */
  resetLoginAttempts(phoneOrEmail) {
    this.loginAttempts.delete(phoneOrEmail.toLowerCase());
  }

  /**
   * Get client IP (mock)
   */
  getClientIP() {
    return '192.168.1.' + Math.floor(Math.random() * 255);
  }

  /**
   * Register new user
   */
  async registerUser(fullName, phone, email, password) {
    // Format phone to international format
    const formattedPhone = phone.startsWith('+66') ? phone : '+66' + phone.replace(/^0/, '');
    
    // Check if user already exists
    const existing = this.findUser(phone);
    if (existing) {
      return { 
        success: false, 
        message: 'เบอร์โทรศัพท์นี้ได้รับการสมัครสมาชิกแล้ว' 
      };
    }

    // Hash password
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const passwordHash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

    // Create new user
    const newUser = {
      id: 'USR' + String(this.nextUserId++).padStart(3, '0'),
      name: fullName,
      phone: formattedPhone,
      email: email.toLowerCase(),
      passwordHash: passwordHash,
      biometricTemplate: null,
      verified: false,
      createdAt: new Date().toISOString(),
      lastLogin: null
    };

    // Add to users list
    this.users.push(newUser);

    // Log security event
    this.logSecurityEvent('USER_REGISTERED', newUser.id, {
      phone: formattedPhone,
      email: email
    });

    return {
      success: true,
      message: 'สมัครสมาชิกสำเร็จ',
      user: newUser
    };
  }

  /**
   * Log security event
   */
  logSecurityEvent(eventType, userId, details) {
    const event = {
      eventType,
      userId,
      timestamp: new Date().toISOString(),
      ipAddress: this.getClientIP(),
      userAgent: navigator.userAgent,
      details
    };

    console.log('🔒 Security Event:', event);
    return event;
  }

  /**
   * Logout - destroy session
   */
  logout(sessionId) {
    this.sessions.delete(sessionId);
    return { success: true, message: 'ออกจากระบบสำเร็จ' };
  }
}

// =====================================
// INITIALIZE GLOBAL DATABASE
// =====================================

const DB = new MockDatabase();

// Export for use in login.html
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { DB, PasswordHash, MockDatabase };
}
