# คู่มือการตั้งค่าระบบ SEO Onpage Generator

## ขั้นตอนการตั้งค่าครั้งแรก

### 1. สร้างไฟล์ Environment Variables

คัดลอกเนื้อหาจากไฟล์ `env.local.template` และสร้างไฟล์ `.env.local`:

```bash
cp env.local.template .env.local
```

### 2. ตั้งค่า Email สำหรับการทดสอบ

ในไฟล์ `.env.local` แก้ไขข้อมูล Email Settings:

#### วิธีสร้าง Gmail App Password:

1. เข้าไปที่ [Google Account Settings](https://myaccount.google.com/)
2. ไปที่ "Security" > "2-Step Verification" (เปิดใช้งานถ้ายังไม่ได้เปิด)
3. ไปที่ "App passwords"
4. เลือก "Mail" และ "Other (custom name)"
5. ใส่ชื่อ "SEO Generator"
6. คัดลอก App Password ที่ได้

#### แก้ไขใน .env.local:

```env
EMAIL_FROM=your-email@gmail.com
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-16-digit-app-password
```

### 3. ตรวจสอบการตั้งค่า Google APIs

ตรวจสอบว่า Google Service Account มีสิทธิ์:
- Google Docs API
- Google Drive API
- สามารถเข้าถึงโฟลเดอร์ที่กำหนดได้

### 4. ทดสอบระบบ

```bash
npm run dev
```

เข้าไปที่ http://localhost:3000 และทดสอบการส่งฟอร์ม

## การทดสอบ Email

เมื่อทดสอบครั้งแรก แนะนำให้:

1. ใช้อีเมลทดสอบของตัวเอง
2. ตรวจสอบใน inbox และ spam/junk folder
3. ตรวจสอบว่าไฟล์ PDF ถูกส่งมาครบถ้วน

## การแก้ไขปัญหาที่พบบ่อย

### OpenRouter API Error
- ตรวจสอบ API key ให้ถูกต้อง
- ตรวจสอบ quota/credits ใน OpenRouter dashboard

### Google API Error
- ตรวจสอบ Service Account email และ private key
- ตรวจสอบว่า APIs ถูกเปิดใช้งาน
- ตรวจสอบ folder permissions

### Email Error
- ตรวจสอบ App Password
- ตรวจสอบ 2FA ว่าเปิดใช้งานแล้ว
- ลองส่งจากอีเมลอื่น

### PDF Export Error
- ตรวจสอบ Google Drive permissions
- ตรวจสอบว่าโฟลเดอร์ ID ถูกต้อง

## Security Notes

⚠️ **คำเตือน**: 
- ไม่เปิดเผย API keys
- ไม่ commit ไฟล์ `.env.local` 
- ใช้ App Password แทน password ปกติ
- ตรวจสอบ Google Service Account permissions

## Production Deployment

สำหรับการ deploy บน production:

1. ตั้งค่า environment variables บน hosting platform
2. เปลี่ยน `NEXT_PUBLIC_APP_URL` ให้ตรงกับ domain จริง
3. ใช้ระบบ email production ที่เหมาะสม
4. ตั้งค่า rate limiting สำหรับ API 