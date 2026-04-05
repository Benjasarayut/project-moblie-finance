# ThaiBank Microservices Architecture

แอปพลิเคชันธนาคารมือถือที่ถูกแยกออกเป็นไมโครเซอร์วิส เพื่อความสามารถในการขยายตัวและการบำรุงรักษาที่ดีขึ้น

## 🏗️ สถาปัตยกรรมไมโครเซอร์วิส

```
┌─────────────────┐    ┌─────────────────┐
│   Frontend      │────│   API Gateway   │
│   (Port 8080)   │    │   (Port 3000)   │
└─────────────────┘    └─────────────────┘
                              │
                    ┌─────────┼─────────┐
                    │         │         │
            ┌─────────────┐ ┌─────────────┐ ┌─────────────┐
            │ Auth Service│ │User Service │ │Account     │
            │ (Port 3001) │ │(Port 3002)  │ │Service     │
            └─────────────┘ └─────────────┘ │(Port 3003)  │
                                             └─────────────┘
                                             ┌─────────────┐
                                             │Transaction  │
                                             │Service      │
                                             │(Port 3004)  │
                                             └─────────────┘
```

## 🚀 การเริ่มใช้งาน

### วิธีที่ 1: ใช้ Docker (แนะนำ)

```bash
cd microservices/docker
docker-compose up --build
```

### วิธีที่ 2: รันแยกแต่ละเซอร์วิส

```bash
cd microservices

# ติดตั้ง dependencies สำหรับทุกเซอร์วิส
for service in auth-service user-service account-service transaction-service api-gateway frontend; do
  cd $service
  npm install
  cd ..
done

# เริ่มเซอร์วิสทั้งหมด
./start-services.sh
```

### วิธีที่ 3: รันทีละเซอร์วิส

```bash
# Terminal 1: Auth Service
cd microservices/auth-service
npm install && npm start

# Terminal 2: User Service
cd microservices/user-service
npm install && npm start

# Terminal 3: Account Service
cd microservices/account-service
npm install && npm start

# Terminal 4: Transaction Service
cd microservices/transaction-service
npm install && npm start

# Terminal 5: API Gateway
cd microservices/api-gateway
npm install && npm start

# Terminal 6: Frontend
cd microservices/frontend
npm install && npm start
```

## 📋 API Endpoints

### Authentication Service (Port 3001)
- `POST /auth/login` - เข้าสู่ระบบ
- `POST /auth/verify-token` - ตรวจสอบ token
- `POST /auth/send-otp` - ส่ง OTP
- `POST /auth/verify-otp` - ยืนยัน OTP

### User Service (Port 3002)
- `GET /users/:userId` - ข้อมูลผู้ใช้
- `PUT /users/:userId` - อัปเดตข้อมูลผู้ใช้
- `GET /users/search` - ค้นหาผู้ใช้

### Account Service (Port 3003)
- `GET /accounts` - สรุปบัญชีทั้งหมด
- `GET /accounts/:accountId` - รายละเอียดบัญชี
- `POST /accounts/:accountId/deposit` - ฝากเงิน
- `POST /accounts/:accountId/withdraw` - ถอนเงิน

### Transaction Service (Port 3004)
- `GET /transactions` - รายการธุรกรรม
- `GET /transactions/:transactionId` - รายละเอียดธุรกรรม
- `POST /transactions/transfer` - โอนเงิน
- `GET /transactions/summary/:period` - สรุปธุรกรรม

### API Gateway (Port 3000)
- `GET /health` - สถานะเซอร์วิสทั้งหมด
- `GET /api/dashboard` - ข้อมูลแดชบอร์ดรวม

## 🔐 ข้อมูลเข้าสู่ระบบทดสอบ

- **เบอร์โทร**: `081-234-5678` หรือ `082-345-6789`
- **รหัสผ่าน**: `password123`, `123456`, หรือ `1234`

## 🧪 การทดสอบ

### ทดสอบ API

```bash
# เข้าสู่ระบบ
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"phone": "081-234-5678", "password": "password123"}'

# ดูข้อมูลบัญชี
curl http://localhost:3000/api/accounts \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### ทดสอบ Frontend

เปิดเบราว์เซอร์ไปที่: `http://localhost:8080`

## 📁 โครงสร้างโปรเจกต์

```
microservices/
├── auth-service/          # บริการยืนยันตัวตน
├── user-service/          # บริการจัดการผู้ใช้
├── account-service/       # บริการจัดการบัญชี
├── transaction-service/   # บริการจัดการธุรกรรม
├── api-gateway/           # API Gateway
├── frontend/              # บริการ Frontend
├── shared/                # โค้ดร่วม
├── docker/                # Docker configs
└── start-services.sh      # สคริปต์เริ่มเซอร์วิส
```

## 🔧 การพัฒนา

### เพิ่มเซอร์วิสใหม่

1. สร้างโฟลเดอร์ใหม่ใน `microservices/`
2. สร้าง `package.json` และ `server.js`
3. เพิ่มใน `docker-compose.yml`
4. อัปเดต API Gateway routes

### การสื่อสารระหว่างเซอร์วิส

- ใช้ HTTP/REST APIs
- ในโปรดักชั่นควรใช้ gRPC หรือ message queues
- API Gateway จัดการ routing และ authentication

## 🚀 การ Deploy

### Development
```bash
docker-compose -f docker/docker-compose.yml up --build
```

### Production
```bash
# ใช้ Kubernetes หรือ Docker Swarm
kubectl apply -f k8s/
```

## 📊 Monitoring

- Health checks: `GET /health` ในทุกเซอร์วิส
- Logs: ตรวจสอบใน Docker logs หรือ stdout
- Metrics: เพิ่ม Prometheus metrics ในอนาคต

## 🔒 ความปลอดภัย

- JWT tokens สำหรับ authentication
- Rate limiting ในทุกเซอร์วิส
- Input validation
- HTTPS ในโปรดักชั่น

## 🎯 ประโยชน์ของไมโครเซอร์วิส

- **Scalability**: ขยายแต่ละเซอร์วิสได้独立
- **Maintainability**: บำรุงรักษาง่ายขึ้น
- **Technology Diversity**: ใช้ภาษาต่างๆ ได้
- **Fault Isolation**: ปัญหาในเซอร์วิสหนึ่งไม่กระทบอื่น
- **Team Autonomy**: ทีมพัฒนาเซอร์วิสได้独立

---

**Version**: 1.0.0  
**Status**: Microservices Architecture ✅