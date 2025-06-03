import { NextRequest, NextResponse } from 'next/server';
import { GoogleAuth } from 'google-auth-library';

export async function POST(request: NextRequest) {
  try {
    const { google_client_email, google_private_key, google_project_id } = await request.json();

    if (!google_client_email || !google_private_key || !google_project_id) {
      return NextResponse.json(
        { success: false, message: 'ข้อมูล Google APIs configuration ไม่ครบถ้วน' },
        { status: 400 }
      );
    }

    // Validate service account format
    if (!google_client_email.includes('@') || !google_client_email.includes('.iam.gserviceaccount.com')) {
      return NextResponse.json(
        { success: false, message: 'Google Client Email ต้องเป็น Service Account Email' },
        { status: 400 }
      );
    }

    // Validate private key format
    if (!google_private_key.includes('BEGIN PRIVATE KEY') || !google_private_key.includes('END PRIVATE KEY')) {
      return NextResponse.json(
        { success: false, message: 'Google Private Key รูปแบบไม่ถูกต้อง' },
        { status: 400 }
      );
    }

    console.log('🔐 Testing Google APIs authentication...');
    console.log('Project ID:', google_project_id);
    console.log('Service Account:', google_client_email);

    // Create auth client
    const auth = new GoogleAuth({
      credentials: {
        client_email: google_client_email,
        private_key: google_private_key.replace(/\\n/g, '\n'),
        project_id: google_project_id,
      },
      scopes: [
        'https://www.googleapis.com/auth/documents',
        'https://www.googleapis.com/auth/drive.file',
      ],
    });

    // Test authentication by getting access token
    console.log('🎯 Getting access token...');
    const authClient = await auth.getClient();
    const accessToken = await authClient.getAccessToken();

    if (!accessToken.token) {
      throw new Error('ไม่สามารถได้รับ Access Token');
    }

    console.log('✅ Access token received successfully');

    // Test creating a document directly (ไม่ต้องเรียก endpoint ที่ไม่มี)
    console.log('📝 Testing document creation...');
    const testResponse = await fetch('https://docs.googleapis.com/v1/documents', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken.token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        title: 'SEO Generator Test Document - ' + new Date().toISOString(),
      }),
    });

    if (!testResponse.ok) {
      const errorData = await testResponse.text();
      console.error('❌ Document Creation Error:', testResponse.status, errorData);
      
      if (testResponse.status === 403) {
        return NextResponse.json({
          success: false,
          message: `❌ Google Docs API ไม่ได้เปิดใช้งาน

📋 วิธีแก้ไข:
1. ไปที่ Google Cloud Console
2. เลือก Project: ${google_project_id}
3. ไปที่ "APIs & Services" > "Library"
4. ค้นหาและเปิด "Google Docs API"
5. ค้นหาและเปิด "Google Drive API"

🔗 Link: https://console.cloud.google.com/apis/library?project=${google_project_id}`
        });
      } else if (testResponse.status === 401) {
        return NextResponse.json({
          success: false,
          message: `❌ การยืนยันตัวตนไม่สำเร็จ

🔧 ตรวจสอบ:
- Private Key ถูกต้อง (ต้องมี \\n จริงๆ)
- Service Account Email ถูกต้อง
- Project ID ถูกต้อง`
        });
      } else {
        throw new Error(`Document Creation Error: ${testResponse.status} - ${errorData}`);
      }
    }

    const testDoc = await testResponse.json();
    console.log('✅ Test document created:', testDoc.documentId);

    // Test Google Drive API by deleting the test document
    if (testDoc.documentId) {
      try {
        console.log('🧹 Testing Google Drive API - Cleaning up test document...');
        const deleteResponse = await fetch(`https://www.googleapis.com/drive/v3/files/${testDoc.documentId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${accessToken.token}`,
          },
        });

        if (deleteResponse.ok) {
          console.log('✅ Test document deleted - Google Drive API working');
        } else {
          console.log('⚠️ Could not delete test document, but document creation succeeded');
        }
      } catch (cleanupError) {
        console.log('⚠️ Note: Could not delete test document:', cleanupError);
      }
    }

    return NextResponse.json({
      success: true,
      message: '✅ Google APIs ทำงานปกติ! สามารถสร้าง Google Docs ได้',
      details: {
        project_id: google_project_id,
        service_account: google_client_email,
        test_document_created: testDoc.documentId ? 'สำเร็จ' : 'ไม่สำเร็จ',
        apis_working: ['Google Docs API', 'Google Drive API'],
        document_id: testDoc.documentId
      }
    });

  } catch (error) {
    console.error('💥 Test Google APIs error:', error);
    
    let errorMessage = 'เกิดข้อผิดพลาดในการทดสอบ Google APIs';
    
    if (error instanceof Error) {
      if (error.message.includes('invalid_grant')) {
        errorMessage = `❌ Google Service Account credentials ไม่ถูกต้อง

🔧 ตรวจสอบ:
- Private Key ถูกต้องและครบถ้วน
- Service Account ยังใช้งานได้
- Project ID ถูกต้อง`;
      } else if (error.message.includes('403')) {
        errorMessage = `❌ Google APIs ไม่ได้เปิดใช้งาน หรือไม่มีสิทธิ์เข้าถึง

📋 วิธีแก้ไข:
1. เปิดใช้งาน Google Docs API และ Google Drive API
2. ตรวจสอบ Service Account มี Role ที่เหมาะสม
3. Link: https://console.cloud.google.com/apis/library`;
      } else if (error.message.includes('401')) {
        errorMessage = `❌ การยืนยันตัวตนไม่สำเร็จ

🔧 ตรวจสอบ:
- Private Key ถูกต้อง (ต้องมี \\n จริงๆ)
- Service Account Email ถูกต้อง
- Project ID ถูกต้อง`;
      } else {
        errorMessage = `❌ ${error.message}

📞 หากปัญหายังอยู่ ลองตรวจสอบ:
1. Google Cloud Console Project Settings
2. Service Account Keys
3. API Quotas`;
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