# ✅ UPDATE: 4 Categories → 5 Categories

## 📱 NEW TAB BAR (5 Tabs)

```
┌─────────────────────────────────────────┐
│ 🏠   💳    📈    ⚡    ⚙️               │
│หน้า  บัญ  ระบบ  กำหนด ตั้ง            │
│หลัก  ชี   การเงิน จ่าย  ค่า             │
└─────────────────────────────────────────┘
```

### 1️⃣ หน้าหลัก (home) 
- → ทำรายการด่วน (Quick Actions)

### 2️⃣ บัญชี (accounts)
- บัญชีธนาคารต่างๆ
- ยอดเงินแต่ละบัญชี
- ธุรกรรมล่าสุด + เพิ่มบัญชี

### 3️⃣ ระบบการเงิน (finance) ⭐ RENAMED from "manage"
- 4 Management Cards:
  - ภาษี (Tax)
  - ลงทุน (Investment)
  - บริจาค (Donation)
  - สถานะ (Status)
- สรุปการเงิน (Income/Expenses/Savings)

### 4️⃣ กำหนดจ่าย (bills) 
- ค่าสาธารณูปโภค (Utilities)
- ยอดรวม + วันครบกำหนด
- ปุ่มชำระอย่างเร็ว

### 5️⃣ ตั้งค่า (settings) ⭐ NEW PAGE
- **ข้อมูลบัญชี**
  - ชื่อ / เบอร์โทร / อีเมล
  
- **ความปลอดภัย**
  - เปลี่ยนรหัสผ่าน
  - 2FA (Two-Factor Auth)
  - Face ID / Biometric
  
- **การแจ้งเตือน**
  - สามารถ Toggle ON/OFF
  - ตั้งค่าความถี่
  
- **อื่นๆ**
  - นโยบายความเป็นส่วนตัว
  - เงื่อนไขการใช้
  - ติดต่อสนับสนุน
  - ออกจากระบบ ⚠️

═══════════════════════════════════════════

## 🔧 TECHNICAL CHANGES

### Files Modified:
✅ public/index.html
   - Updated tab-bar: 5 buttons (added settings)
   - Renamed page: p-manage → p-finance
   - Added: p-settings page (NEW)
   - Updated: openInvest/openDonate to use 'finance'

✅ src/css/style.css
   - Added: .setting-item styles
   - Added: .set-label / .set-value
   - Added: .edit-btn styling
   - Added: .toggle-switch (animated switch)
   - Added: .btn-danger (red logout button)
   - Reduced: .tab span font-size (9px → 8px)

### JavaScript Functions Added:
- toggleSwitch(el) - Toggle button animation
- Settings page fully functional

═══════════════════════════════════════════

## 📊 COMPARISON

| Feature | Old | New |
|---------|-----|-----|
| Tab Count | 4 | **5** |
| Pages | home, accounts, manage, bills | home, accounts, **finance**, bills, **settings** |
| Settings | ❌ None | ✅ Full settings page |
| Security Options | ❌ None | ✅ 2FA, Face ID, Password |
| Notifications | ❌ None | ✅ Customizable alerts |
| Account Info | ❌ None | ✅ Edit profile |

═══════════════════════════════════════════

## 🎯 USER JOURNEY

1. Login → index.html (Dashboard)
2. Tab bar shows 5 options
3. Click any tab:
   - หน้าหลัก → Quick actions
   - บัญชี → Bank accounts & transactions
   - ระบบการเงิน → Tax, Investment, Status
   - กำหนดจ่าย → Bills management
   - ตั้งค่า → Profile & Security
4. ตั้งค่า → Settings → ออกจากระบบ → login.html

═══════════════════════════════════════════

