# ThaiBank Mobile Finance App

แอปธนาคารมือถือสำหรับจัดการการเงินส่วนบุคคล ด้วยธีมสีม่วงสวยงาม ฟีเจอร์ครบครัน และสามารถติดตั้งเป็นแอปได้ (PWA)

## 🚀 ติดตั้งแอป

### วิธีที่ 1: ติดตั้งบนมือถือ/แท็บเล็ต (ผ่าน PWA)
1. เปิด URL ของแอปในเบราว์เซอร์มือถือ: `login.html`
2. แท็บบราวเซอร์บนสุด จะมีปุ่ม "ติดตั้ง" (หรือ "Add to Home Screen")
3. คลิก "ติดตั้ง" → แอปจะปรากฏบนหน้าหลัก
4. สามารถใช้งานเหมือนแอปปกติ แม้ออนไลน์ไม่ได้

### วิธีที่ 2: เปิดในเบราว์เซอร์ (Desktop)
1. ดาวน์โหลดโปรเจกต์
2. เปิดไฟล์ `login.html` ในเบราว์เซอร์
3. หรือรันเซิร์ฟเวอร์ local:
   ```bash
   # ใช้ Python
   python3 -m http.server 8000
   
   # หรือใช้ Node.js
   npx http-server
   ```
4. เข้า `http://localhost:8000/login.html`

## ✨ ฟีเจอร์หลัก

### 🔐 ล็อกอิน (Login) - พร้อม Multi-Factor Authentication
- **3 วิธีล็อกอิน:**
  - 🔑 รหัสผ่าน (Password)
  - 😊 แสกนหน้า (Face Recognition)
  - 👆 ลายนิ้วมือ (Fingerprint / WebAuthn)
- **ระบบ Security แบบหลายชั้น:**
  - พยายามล็อกอิน max 3 ครั้ง
  - ครั้งแรกผิด 3 ครั้ง: ยืนยันทาง **SMS OTP**
  - ครั้งที่ 2 ผิด 3 ครั้ง: ยืนยันทาง **Email OTP**
  - รหัส OTP 6 หลัก + Timer 5 นาที
  - Auto-verify เมื่อกรอก OTP ครบ
- **ปุ่มออกจากระบบ (Logout)** ที่หน้าแรก
- ยอดเงินคงเหลือ
- รายได้และรายจ่ายประจำเดือน
- พอร์ตการลงทุน + อัตราการออม
- ธุรกรรมล่าสุด
- ปุ่มเข้าถึงด่วน

### 🧾 คำนวณภาษี (พร้อม AI)
- คำนวณภาษีเงินได้บุคคลธรรมดา
- รองรับมาตรา 40(1), 40(2), 40(5), 40(8)
- คำนึงถึงค่าลดหย่อน:
  - เบี้ยประกันชีวิต
  - กองทุน LTF/RMF/SSF
  - ประกันสุขภาพ
  - บริจาค
- **ใช้ AI** วิเคราะห์และให้คำแนะนำลดหย่อนภาษีเพิ่มเติม

### 📈 การลงทุน (พร้อม AI)
- วางแผนการลงทุนระยะยาว
- เลือกประเภทการลงทุน:
  - กองทุน LTF/SSF
  - กองทุน RMF
  - หุ้น SET ไทย
  - พันธบัตรรัฐบาล
  - สินทรัพย์ดิจิทัล
- ปรับระดับความเสี่ยง
- เลือกเป้าหมายการลงทุน
- **ใช้ AI** คำนวณผลตอบแทน + จัดสรรพอร์ต

### ⚡ สาธารณูปโภค (Utility)
- บิลไฟฟ้า (กฟนฯ)
- บิลน้ำประปา (มวนฯ)
- บิลมือถือ (AIS)
- บิลอินเทอร์เน็ต (True)
- ชำระทั้งหมดในครั้งเดียว

### ❤️ บริจาค (Donate)
- โรงพยาบาลสงฆ์
- มูลนิธิสร้างสรรค์เด็ก
- กรีนพีซ ประเทศไทย
- บ้านมิตรภาพ
- ลดหย่อนภาษี 2 เท่า

### 📊 สถานะการเงิน (Status)
- คะแนนสุขภาพการเงิน (0-100)
- สถิติรายจ่ายตามหมวดหมู่
- แผนภูมิแสดงค่าใช้จ่าย
- ติดตามเป้าหมายการออม
- **ใช้ AI** วิเคราะห์จุดแข็ง + แนะนำการปรับปรุง

## 🛠️ เทคโนโลยี

- **HTML5** - โครงสร้าง
- **CSS3** - การออกแบบ (Responsive Design)
- **JavaScript (ES6+)** - ฟังก์ชันการทำงาน
- **Anthropic Claude AI** - คำนวณภาษีและการลงทุน
- **Progressive Web App (PWA)** - ติดตั้งได้บนอุปกรณ์

## 📱 PWA Features

- ✅ ติดตั้งบนหน้าหลักมือถือ
- ✅ ทำงานแบบ Offline
- ✅ Loading แรกเร็ว (Cached)
- ✅ Full Screen Mode
- ✅ Add to Home Screen

## ⚙️ ใช้งาน AI Features

หากต้องการใช้ฟีเจอร์ AI (คำนวณภาษี, ลงทุน, วิเคราะห์สถานะ):

1. สมัครสมาชิก [Anthropic](https://console.anthropic.com)
2. สร้าง API Key
3. แก้ไขไฟล์ `index.html` ค้นหา:
   ```javascript
   const API_KEY = 'YOUR_ANTHROPIC_API_KEY';
   ```
4. แทนที่ `'YOUR_ANTHROPIC_API_KEY'` ด้วย API Key จริง
5. รีโหลดหน้าเว็บ

### ⚠️ Production Notes
- ห้ามฝัง API Key ใน Client-side code สำหรับแอปจริง
- ควรเรียก API ผ่าน Backend server เสมอ
- Security: HTTP ONLY Cookies, CORS, Rate Limiting

## 📁 โครงสร้างไฟล์

```
project-moblie-finance/
├── index.html          # หโครงหลัก (PWA, Meta tags)
├── style.css           # Stylesheet ทั้งหมด
├── service-worker.js   # Service Worker (Caching, Offline)
├── manifest.json       # PWA Manifest
├── .htaccess           # Server Configuration
├── README.md           # Documentation
└── .git/               # Git repository
```

## 🎨 สีที่ใช้

| ชื่อ | รหัส | ใช้งาน |
|------|------|--------|
| Purple (หลัก) | `#6b35b8` | Header, Button, Accent |
| Light Purple | `#8b5cf6` | Hover state, Icon |
| Very Light Purple | `#ede9fe` | Background, Card |
| Dark Purple | `#1a0a2e` | Phone background |
| Green (Positive) | `#4ade80` | Income, Success |
| Red (Negative) | `#f87171` | Expense, Alert |
| Amber (Warning) | `#fbbf24` | Warning, Alert |

## 🔧 Development

### ปรับแต่งข้อมูล
แก้ไขค่าใน `index.html` HTML section:
- ยอดเงิน: ค้นหา `฿ 248,350`
- รายการธุรกรรม: ค้นหา `tx-name`
- เป้าหมายการออม: ค้นหา `goal-name`

### เพิ่ม Features ใหม่
1. สร้าง element ใน HTML
2. เพิ่ม CSS ใน `style.css`
3. เพิ่ม JavaScript logic ใน `index.html` script tag

## 📖 Resources

- [PWA Documentation](https://web.dev/progressive-web-apps/)
- [Service Workers](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API)
- [Anthropic API](https://console.anthropic.com/docs)

## 📝 License

สำหรับใช้งานส่วนตัว / Educational purposes

## 🧪 Demo Credentials (สำหรับทดสอบ)

### ล็อกอิน
- **หน้า:** login.html
- **วิธีล็อกอิน:** รหัสผ่าน / หน้า / ลายนิ้มือ
- **Demo OTP:** `123456` (สำหรับยืนยันตัวตน)

### Test Cases
| สถานการณ์ | วิธีทดสอบ |
|----------|---------|
| ล็อกอินสำเร็จ (Password) | ใส่รหัสผ่าน 6 ตัวขึ้นไป → ยืนยัน OTP |
| ล็อกอิน ครั้งแรกผิด 3 ครั้ง | พิมพ์รหัสผ่านผิด 3 ครั้ง → SMS OTP |
| ล็อกอิน ครั้งที่ 2 ผิด 3 ครั้ง | ยกเลิก SMS → ล็อกอินผิดอีก 3 ครั้ง → Email OTP |
| Face Recognition | คลิก "😊 หน้า" → ยิ้มต่อกล้อง → ยืนยัน OTP |
| Fingerprint | คลิก "👆 ลายนิ้ว" → วางลายนิ้ว → ยืนยัน OTP |

---

พัฒนาโดย AI Assistant สำหรับการสาธิตแอปธนาคารมือถือ 🚀
