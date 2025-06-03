import nodemailer from 'nodemailer';
import { ProcessedResponse } from '@/types';
import { convertMarkdownToHTML } from './text-to-html';

interface EmailConfig {
  smtp_host: string;
  smtp_port: number;
  smtp_user: string;
  smtp_password: string;
  from_email: string;
  from_name: string;
}

function getEmailConfig(): EmailConfig {
  const config = {
    smtp_host: process.env.SMTP_HOST || '',
    smtp_port: parseInt(process.env.SMTP_PORT || '587'),
    smtp_user: process.env.SMTP_USER || '',
    smtp_password: process.env.SMTP_PASSWORD || '',
    from_email: process.env.FROM_EMAIL || '',
    from_name: process.env.FROM_NAME || 'SEO Content Generator',
  };

  // Debug logging
  console.log('📧 Email Configuration Check:');
  console.log('- SMTP_HOST:', config.smtp_host ? '✅ Set' : '❌ Missing');
  console.log('- SMTP_USER:', config.smtp_user ? '✅ Set' : '❌ Missing');
  console.log('- SMTP_PASSWORD:', config.smtp_password ? '✅ Set' : '❌ Missing');
  console.log('- FROM_EMAIL:', config.from_email ? '✅ Set' : '❌ Missing');

  return config;
}

function createCleanFilename(websiteName: string, pageTitle: string): string {
  // Remove special characters and replace spaces with underscores
  const cleanWebsiteName = websiteName.replace(/[^a-zA-Z0-9\u0E00-\u0E7F\s]/g, '').replace(/\s+/g, '_');
  const cleanPageTitle = pageTitle.replace(/[^a-zA-Z0-9\u0E00-\u0E7F\s]/g, '').replace(/\s+/g, '_');
  
  return `${cleanWebsiteName}-${cleanPageTitle}`;
}

export async function sendSEOContentEmail(
  recipientEmail: string,
  pageTitle: string,
  pdfBuffer: Buffer,
  websiteName?: string
): Promise<ProcessedResponse> {
  try {
    const config = getEmailConfig();

    // Validate configuration
    if (!config.smtp_host || !config.smtp_user || !config.smtp_password || !config.from_email) {
      console.error('Missing email configuration');
      return {
        success: false,
        message: 'Email configuration is incomplete'
      };
    }

    const transporter = nodemailer.createTransport({
      host: config.smtp_host,
      port: config.smtp_port,
      secure: config.smtp_port === 465,
      auth: {
        user: config.smtp_user,
        pass: config.smtp_password,
      },
    });

    // Create filename using website name and page title
    const filename = websiteName 
      ? createCleanFilename(websiteName, pageTitle)
      : pageTitle.replace(/[^a-zA-Z0-9\u0E00-\u0E7F]/g, '_');

    const mailOptions = {
      from: `"${config.from_name}" <${config.from_email}>`,
      to: recipientEmail,
      subject: `เนื้อหา SEO สำหรับ: ${pageTitle}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">เนื้อหา SEO ได้ถูกสร้างเรียบร้อยแล้ว</h2>
          <p>สวัสดีครับ/ค่ะ</p>
          <p>เนื้อหา SEO สำหรับหัวข้อ "<strong>${pageTitle}</strong>" ได้ถูกสร้างเรียบร้อยแล้ว</p>
          <p>กรุณาดาวน์โหลดไฟล์ PDF ที่แนบมาเพื่อดูเนื้อหาที่สมบูรณ์</p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
          <p style="color: #666; font-size: 14px;">
            ขอบคุณที่ใช้บริการ SEO Content Generator<br>
            หากมีข้อสงสัยสามารถติดต่อกลับมาได้เสมอ
          </p>
        </div>
      `,
      attachments: [
        {
          filename: `${filename}_SEO_Content.pdf`,
          content: pdfBuffer,
          contentType: 'application/pdf'
        }
      ]
    };

    await transporter.sendMail(mailOptions);

    return {
      success: true,
      message: 'Email sent successfully with PDF attachment'
    };

  } catch (error) {
    console.error('Email sending error:', error);
    
    if (error instanceof Error) {
      return {
        success: false,
        message: `Failed to send email: ${error.message}`
      };
    }

    return {
      success: false,
      message: 'Failed to send email'
    };
  }
}

export async function sendTextContentEmail(
  recipientEmail: string,
  pageTitle: string,
  textContent: string,
  websiteName?: string
): Promise<ProcessedResponse> {
  try {
    const config = getEmailConfig();

    // Validate configuration
    if (!config.smtp_host || !config.smtp_user || !config.smtp_password || !config.from_email) {
      console.error('Missing email configuration');
      return {
        success: false,
        message: 'Email configuration is incomplete'
      };
    }

    const transporter = nodemailer.createTransport({
      host: config.smtp_host,
      port: config.smtp_port,
      secure: config.smtp_port === 465,
      auth: {
        user: config.smtp_user,
        pass: config.smtp_password,
      },
    });

    // Convert text to HTML
    const htmlContent = convertMarkdownToHTML(textContent);
    
    // Create filename using website name and page title
    const filename = websiteName 
      ? createCleanFilename(websiteName, pageTitle)
      : pageTitle.replace(/[^a-zA-Z0-9\u0E00-\u0E7F]/g, '_');

    const mailOptions = {
      from: `"${config.from_name}" <${config.from_email}>`,
      to: recipientEmail,
      subject: `เนื้อหา SEO สำหรับ: ${pageTitle}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">เนื้อหา SEO ได้ถูกสร้างเรียบร้อยแล้ว</h2>
          <p>สวัสดีครับ/ค่ะ</p>
          <p>เนื้อหา SEO สำหรับหัวข้อ "<strong>${pageTitle}</strong>" ได้ถูกสร้างเรียบร้อยแล้ว</p>
          <p>กรุณาดาวน์โหลดไฟล์ที่แนบมาเพื่อดูเนื้อหาที่สมบูรณ์:</p>
          <ul>
            <li><strong>${filename}_SEO_Content.txt</strong> - ไฟล์ข้อความธรรมดา</li>
            <li><strong>${filename}_SEO_Content.html</strong> - ไฟล์ HTML พร้อมรูปแบบ (Internal Links เป็นสีแดง)</li>
          </ul>
          <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
          <p style="color: #666; font-size: 14px;">
            ขอบคุณที่ใช้บริการ SEO Content Generator<br>
            หากมีข้อสงสัยสามารถติดต่อกลับมาได้เสมอ
          </p>
        </div>
      `,
      attachments: [
        {
          filename: `${filename}_SEO_Content.txt`,
          content: Buffer.from(textContent, 'utf-8'),
          contentType: 'text/plain; charset=utf-8'
        },
        {
          filename: `${filename}_SEO_Content.html`,
          content: Buffer.from(htmlContent, 'utf-8'),
          contentType: 'text/html; charset=utf-8'
        }
      ]
    };

    await transporter.sendMail(mailOptions);

    return {
      success: true,
      message: 'Email sent successfully with text and HTML attachments'
    };

  } catch (error) {
    console.error('Email sending error:', error);
    
    if (error instanceof Error) {
      return {
        success: false,
        message: `Failed to send email: ${error.message}`
      };
    }

    return {
      success: false,
      message: 'Failed to send email'
    };
  }
} 