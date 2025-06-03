#!/bin/bash

# SEO Onpage Generator Setup Script
echo "🚀 กำลังตั้งค่าระบบ SEO Onpage Generator..."

# Copy environment template
if [ ! -f .env.local ]; then
  cp env.local.template .env.local
  echo "✅ สร้างไฟล์ .env.local เรียบร้อย"
  echo "⚠️  กรุณาแก้ไข EMAIL_PASS ในไฟล์ .env.local"
else
  echo "📁 ไฟล์ .env.local มีอยู่แล้ว"
fi

# Install dependencies
echo "📦 กำลังติดตั้ง dependencies..."
npm install

echo "🎉 การตั้งค่าเสร็จสิ้น!"
echo "ขั้นตอนถัดไป:"
echo "1. แก้ไขไฟล์ .env.local (EMAIL_PASS)"
echo "2. รันคำสั่ง: npm run dev"
echo "3. เปิด http://localhost:3000" 