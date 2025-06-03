# SEO Content Generator

เครื่องมือสร้างเนื้อหา SEO อัตโนมัติด้วย AI สำหรับเว็บไซต์ภาษาไทย รองรับการสร้างเนื้อหาคุณภาพสูง ส่งอีเมลอัตโนมัติ และจัดเก็บข้อมูลการใช้งาน

## ✨ คุณสมบัติหลัก

- 🤖 **AI Content Generation**: ใช้ OpenRouter API รองรับ GPT-4o, Claude, DeepSeek และ AI models อื่นๆ
- 📧 **Email Integration**: ส่งเนื้อหาไปยังอีเมลอัตโนมัติผ่าน Gmail SMTP
- 📄 **Google Docs/Drive**: สร้าง Google Document และ export เป็น PDF (ทางเลือก)
- 📊 **Analytics & Logs**: ติดตามการใช้งาน ค้นหาและวิเคราะห์ประสิทธิภาพ
- 📱 **Responsive Design**: ใช้งานได้ทั้งเดสก์ท็อปและมือถือ
- 🔧 **Settings Management**: จัดการการตั้งค่าผ่าน IndexedDB พร้อม import/export

## 🚀 การติดตั้งและรัน

### ข้อกำหนดระบบ
- Node.js 18+ 
- npm หรือ yarn

### ขั้นตอนการติดตั้ง

1. **Clone โปรเจค**
```bash
git clone <repository-url>
cd form-seo
```

2. **ติดตั้ง dependencies**
```bash
npm install
```

3. **สร้างไฟล์ .env.local** (ทางเลือก)
```bash
cp .env.example .env.local
```

4. **รันโปรเจค**
```bash
npm run dev
```

เปิดเบราว์เซอร์ที่ `http://localhost:3000`

## ⚙️ การตั้งค่า

### วิธีที่ 1: ใช้หน้า Settings (แนะนำ)

1. ไปที่หน้า **Settings** 
2. กดปุ่ม **"เติมข้อมูลเริ่มต้น"** เพื่อใช้ค่า demo
3. แก้ไขข้อมูลตามความต้องการ:
   - **OpenRouter API Key**: สมัครที่ [OpenRouter.ai](https://openrouter.ai) 
   - **Gmail SMTP**: ต้องเปิด 2FA และสร้าง App Password
   - **Google APIs**: สำหรับสร้าง Google Docs (ทางเลือก)
4. กดปุ่ม **"บันทึกการตั้งค่า"**
5. ทดสอบแต่ละส่วนด้วยปุ่ม **"ทดสอบ"**

### วิธีที่ 2: ใช้ Environment Variables

สร้างไฟล์ `.env.local`:

```env
# OpenRouter AI API (จำเป็น)
OPENROUTER_API_KEY=sk-or-v1-your-api-key-here
OPENROUTER_MODEL=openai/gpt-4o-mini

# Gmail SMTP Configuration (จำเป็น)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-16-char-app-password
FROM_EMAIL=your-email@gmail.com
FROM_NAME=SEO Content Generator

# Google APIs (ทางเลือก)
GOOGLE_CLIENT_EMAIL=service-account@project.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----"
GOOGLE_PROJECT_ID=your-project-id

# Skip Google APIs for testing
SKIP_GOOGLE_APIS=true
```

## 📱 การใช้งาน

### 1. สร้างเนื้อหา SEO

1. กรอกข้อมูลเว็บไซต์:
   - ชื่อเว็บไซต์
   - URL (ทางเลือก)
   - รายละเอียดเว็บไซต์
   - หัวข้อหน้า

2. เพิ่ม Keywords และ Internal Links:
   - กำหนด keyword และความถี่
   - ระบุ internal link path

3. เลือกความยาวเนื้อหา:
   - **สั้น**: 800-1,200 คำ
   - **กลาง**: 1,500-2,000 คำ  
   - **ยาว**: 2,500-3,500 คำ

4. กรอกอีเมลผู้รับและส่ง

### 2. ดู Logs และ Analytics

- **หน้า Logs**: ดูประวัติการสร้างเนื้อหา
- **ค้นหา**: ค้นหาตามชื่อเว็บไซต์, หัวข้อ, อีเมล, Model, Keywords
- **Tooltips**: ดูข้อมูลเต็มของ fields ที่ถูกตัดทอน
- **Responsive Design**: ดูได้ทั้งเดสก์ท็อปและมือถือ

### 3. จัดการ Settings

- **บันทึก/โหลด**: ข้อมูลจัดเก็บใน IndexedDB
- **Import/Export**: สำรองข้อมูลการตั้งค่า
- **ทดสอบ API**: ทดสอบการเชื่อมต่อทุกส่วน

## 🔧 API Endpoints

### SEO Form API
```
POST /api/seo-onpage-form
```

### Testing APIs
```
POST /api/test-openrouter
POST /api/test-email  
POST /api/test-google-apis
```

## 🎨 Tech Stack

- **Frontend**: Next.js 15, TypeScript, Tailwind CSS
- **AI**: OpenRouter API (GPT-4o, Claude, DeepSeek, etc.)
- **Email**: Nodemailer + Gmail SMTP
- **Google**: Google Docs/Drive APIs
- **Storage**: IndexedDB (client-side)
- **Responsive**: Mobile-first design

## 🤖 รองรับ AI Models

- OpenAI GPT-4o, GPT-4o-mini
- Anthropic Claude 3.5 Sonnet
- DeepSeek R1 (default)
- Google Gemini Pro
- Meta Llama 3.1
- และอื่นๆ ผ่าน OpenRouter

## 📧 Gmail Setup Guide

1. เปิด 2-Factor Authentication
2. ไปที่ [Google App Passwords](https://myaccount.google.com/apppasswords)
3. สร้าง App Password สำหรับ "Mail"
4. ใช้ 16-character password ที่ได้รับ

## 🌐 Google APIs Setup (ทางเลือก)

1. ไปที่ [Google Cloud Console](https://console.cloud.google.com/)
2. สร้าง Project ใหม่
3. เปิดใช้งาน Google Docs API และ Google Drive API
4. สร้าง Service Account
5. ดาวน์โหลด JSON key file
6. ใช้ข้อมูลจาก JSON ในการตั้งค่า

## 🔒 ความปลอดภัย

- ข้อมูลการตั้งค่าจัดเก็บใน IndexedDB (local)
- API Keys ไม่ส่งไปยัง server (เว้นแต่การใช้งาน)
- Environment variables สำหรับ production
- ไม่มีการจัดเก็บข้อมูลส่วนตัวบน server

## 🐛 การแก้ไขปัญหา

### ปัญหาทั่วไป

1. **"OpenRouter API Error"**: ตรวจสอบ API Key และ format
2. **"Email send failed"**: ตรวจสอบ Gmail App Password
3. **"Google APIs Error"**: ตรวจสอบ Service Account permissions
4. **Settings หาย**: ตรวจสอบว่า IndexedDB ทำงานปกติ

### Debug Mode

เปิด Developer Console เพื่อดู logs:
```javascript
// ดู settings ใน IndexedDB
indexedDBService.getSettings().then(console.log);
```

## 📄 License

MIT License - ใช้ได้อย่างอิสระสำหรับโปรเจคส่วนตัวและเชิงพาณิชย์

## 🤝 การร่วมพัฒนา

1. Fork โปรเจค
2. สร้าง feature branch
3. Commit การเปลี่ยนแปลง
4. Push ไปยัง branch
5. สร้าง Pull Request

---

**หมายเหตุ**: โปรเจคนี้ใช้ Thai language เป็นหลัก และออกแบบมาสำหรับการสร้างเนื้อหา SEO ภาษาไทยโดยเฉพาะ
