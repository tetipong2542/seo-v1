import { NextRequest, NextResponse } from 'next/server';
import { createTransport } from 'nodemailer';

export async function POST(request: NextRequest) {
  try {
    const { 
      smtp_host, 
      smtp_port, 
      smtp_user, 
      smtp_password, 
      from_email, 
      from_name,
      test_email 
    } = await request.json();

    if (!smtp_user || !smtp_password || !from_email) {
      return NextResponse.json(
        { success: false, message: 'ข้อมูล Email configuration ไม่ครบถ้วน' },
        { status: 400 }
      );
    }

    // Create transporter
    const transporter = createTransport({
      host: smtp_host || 'smtp.gmail.com',
      port: smtp_port || 587,
      secure: false,
      auth: {
        user: smtp_user,
        pass: smtp_password,
      },
    });

    // Verify connection
    await transporter.verify();

    // Send test email
    const info = await transporter.sendMail({
      from: `${from_name || 'SEO Content Generator'} <${from_email}>`,
      to: test_email || smtp_user,
      subject: 'ทดสอบการส่งอีเมล - SEO Content Generator',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2563eb;">การทดสอบอีเมลสำเร็จ! ✅</h2>
          <p>นี่คืออีเมลทดสอบจาก <strong>SEO Content Generator</strong></p>
          <p>การตั้งค่าอีเมลของคุณทำงานถูกต้อง</p>
          <hr style="margin: 20px 0; border: none; border-top: 1px solid #e5e7eb;">
          <p style="color: #6b7280; font-size: 14px;">
            เวลาที่ส่ง: ${new Date().toLocaleString('th-TH')}
          </p>
        </div>
      `,
    });

    return NextResponse.json({
      success: true,
      message: 'ส่งอีเมลทดสอบสำเร็จ',
      messageId: info.messageId
    });

  } catch (error) {
    console.error('Test Email error:', error);
    
    let errorMessage = 'เกิดข้อผิดพลาดในการส่งอีเมล';
    
    if (error instanceof Error) {
      if (error.message.includes('Invalid login')) {
        errorMessage = 'อีเมลหรือรหัสผ่านไม่ถูกต้อง กรุณาตรวจสอบ App Password';
      } else if (error.message.includes('getaddrinfo ENOTFOUND')) {
        errorMessage = 'ไม่สามารถเชื่อมต่อ SMTP Server ได้';
      } else {
        errorMessage = error.message;
      }
    }
    
    return NextResponse.json(
      { success: false, message: errorMessage },
      { status: 400 }
    );
  }
}

export async function GET() {
  return NextResponse.json(
    { success: false, message: 'Method not allowed. Please use POST.' },
    { status: 405 }
  );
} 