# 📋 Demo Users & Test Data

## 🔐 Test Users (สำหรับทดสอบ)

### User 1 - สมชาย วงศ์ดี
```
เบอร์โทรศัพท์: 081-234-5678 (หรือ +66812345678)
Email: somchai@thaibank.com
รหัสผ่าน: password123
```

### User 2 - สุนีย์ เรียมกร
```
เบอร์โทรศัพท์: 089-876-5432 (หรือ +66898765432)
Email: sunee@thaibank.com
รหัสผ่าน: 123456
```

---

## 🧪 Test Scenarios

### Test 1: ล็อกอินด้วยรหัสผ่านสำเร็จ
1. เปิด `login.html`
2. กรอก: `081-234-5678` + `password123`
3. คลิก "ล็อกอิน"
4. ขั้นตอน: ยืนยัน SMS OTP
5. گรอก OTP: `123456` (ดูใน Browser Console)
6. ✅ ลงนามสำเร็จ → ไป `index.html`

### Test 2: ยืนยันด้วย Face Recognition
1. เปิด `login.html`
2. คลิกแท็บ "😊 หน้า"
3. อนุญาตการเข้าถึงกล้อง
4. ยิ้มต่อกล้อง
5. ขั้นตอน: ยืนยัน SMS OTP
6. กรอก OTP: `123456`
7. ✅ ลงนามสำเร็จ

### Test 3: ยืนยันด้วย Fingerprint
1. เปิด `login.html`
2. คลิกแท็บ "👆 ลายนิ้ว"
3. วางลายนิ้วมือ (ในอุปกรณ์ที่รองรับ)
4. ขั้นตอน: ยืนยัน SMS OTP
5. กรอก OTP: `123456`
6. ✅ ลงนามสำเร็จ

### Test 4: รหัสผ่านผิด 3 ครั้ง → ยืนยัน SMS
1. เปิด `login.html`
2. กรอก: `081-234-5678` + `wrongpassword` (3 ครั้ง)
3. ล้มเหลว 3 ครั้ง
4. ✅ ขั้นตอน: ยืนยัน SMS OTP
5. กรอก OTP: `123456`
6. ✅ ลงนามสำเร็จ

### Test 5: รหัสผ่านผิด 3 ครั้ง → ยกเลิก SMS → ยืนยัน Email
1. เปิด `login.html`
2. กรอก: `081-234-5678` + `wrongpass` (3 ครั้ง)
3. ล้มเหลว 3 ครั้ง (SMS)
4. คลิก "ย้อนกลับ"
5. กรอก: `081-234-5678` + `wrongpass` (3 ครั้งอีก)
6. ✅ ขั้นตอน: ยืนยัน Email OTP
7. กรอก OTP: `123456`
8. ✅ ลงนามสำเร็จ

### Test 6: OTP ไม่ถูกต้อง
1. ล็อกอินสำเร็จ → ยืนยัน OTP
2. กรอก OTP ผิด 3 ครั้ง
3. ✅ ข้อความแสดง "ทำการป้อนรหัสมากเกินไป"
4. Auto-resend รหัสใหม่

### Test 7: ออกจากระบบ (Logout)
1. ล็อกอินสัเร็จ → หน้า `index.html`
2. คลิกปุ่มออกจากระบบ (ไอคอน logout ซ้าย-บน)
3. ยืนยัน "ออกจากระบบ?"
4. ✅ ไปหน้า login.html

---

## 🔐 Security Features

### 🛡️ Password Security
- ✅ Hash passwords with SHA-256 (ใช้ CryptoAPI)
- ✅ Never store plain text passwords
- ✅ Passwords masked in input fields

### 📱 OTP Security
- ✅ 6-digit random OTP
- ✅ 5-minute expiration
- ✅ Max 3 attempts per OTP
- ✅ Auto-resend if attempts exceeded
- ✅ OTP sent via SMS/Email (masked)

### 🔒 Session Security
- ✅ Session ID generation (UUID-like)
- ✅ 24-hour session expiration
- ✅ Session stored in sessionStorage (cleared on browser close)
- ✅ Never stored in localStorage for security

### 🚨 Attempt Tracking
- ✅ Track failed login attempts (password)
- ✅ Max 3 attempts before SMS verification
- ✅ Max 3 SMS attempts before Email verification
- ✅ Clear attempts on successful login

### 📊 Security Logging
- ✅ All authentication events logged
- ✅ Includes: timestamp, user ID, IP, user-agent
- ✅ Events: LOGIN_SUCCESS, LOGIN_FAILED, OTP_SENT, OTP_VERIFIED, etc.
- ✅ Check Browser Console for logs

---

## 📧 Contact Information Masking

### Phone Number Masking
```
Original: +66812345678
Masked:   081-****-5678
```

### Email Masking
```
Original: somchai@thaibank.com
Masked:   so****@thaibank.com
```

---

## 🔍 Developer Console

### View OTP in Browser Console
```javascript
// Browser Console (F12)
// OTP จะแสดงใน console เมื่อส่ง
📨 OTP ส่งไปทาง sms (Demo: 123456)
```

### View Security Events
```javascript
// Console logs
🔒 Security Event: {
  eventType: 'LOGIN_SUCCESS',
  userId: 'USR001',
  timestamp: '2026-04-05T...',
  ...
}
```

### Clear Session (ถ้าติดไป)
```javascript
// Browser Console
sessionStorage.clear()
// แล้ว reload หน้า
```

---

## 🐛 Common Issues

| ปัญหา | วิธีแก้ |
|------|--------|
| หน้า login ไม่ขึ้น | ตรวจสอบ `db.js` ที่ path ถูกต้อง |
| OTP ไม่ส่งมา | ดู Browser Console (F12) เพื่อดู OTP |
| ติดในหน้า verification | ใช้ `sessionStorage.clear()` ใน console |
| กล้อง/ลายนิ้วไม่เห็น | ให้สิทธิ์เข้าถึง + reload page |
| Logout ไม่ได้ | ตรวจสอบ JavaScript console errors |

---

## 🚀 Production Notes

⚠️ **ห้ามใช้ demo นี้ใน Production!**

- ❌ ไม่ใช้ SHA-256 สำหรับ password hashing → ใช้ bcrypt
- ❌ ไม่ส่ง OTP มาจริง → ใช้ SMS gateway/Email service
- ❌ Session ใน sessionStorage → ใช้ secure HTTP-only cookies
- ❌ ไม่มี rate limiting → เพิ่ม server-side rate limiting
- ❌ ไม่มี HTTPS → ต้องใช้ HTTPS สำหรับ production
- ❌ Password hash visible in code → เก็บ hash ใน secure backend

---

## 📚 Resources

- [OWASP Authentication Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html)
- [WebAuthn Biometric](https://webauthn.io/)
- [SMS OTP Best Practices](https://www.twilio.com/docs/verify/api)
