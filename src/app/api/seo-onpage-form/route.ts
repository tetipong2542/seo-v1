import { NextRequest, NextResponse } from 'next/server';
import { validateSEOForm } from '@/lib/validation';
import { generateSEOContent } from '@/lib/openrouter';
import { createGoogleDoc, exportDocumentAsPDF } from '@/lib/google-docs';
import { sendSEOContentEmail, sendTextContentEmail } from '@/lib/email';
import { APIResponse } from '@/types';

export async function POST(request: NextRequest) {
  console.log('📝 SEO Onpage Form API called');
  
  let body: any = null;
  
  try {
    body = await request.json();
    console.log('📊 Request body received:', JSON.stringify(body, null, 2));

    // Validate form data
    const validation = validateSEOForm(body);
    if (!validation.success) {
      console.error('❌ Validation failed:', validation.message);
      
      // Return validation error (will be handled on client side for logging)
      return NextResponse.json(
        { 
          success: false, 
          message: validation.message || 'Validation failed',
          formData: body // Send back form data for client-side logging
        },
        { status: 400 }
      );
    }

    console.log('✅ Form validation passed');
    const formData = validation.data!;

    // Get OpenRouter settings from client request or fallback to environment variables
    console.log('🔧 Getting OpenRouter settings...');
    
    let openrouterApiKey: string = '';
    let openrouterModel: string = '';
    
    // Check if client sent settings (prioritize client settings)
    const clientSettings = (body as any)._openrouter_settings;
    
    if (clientSettings && clientSettings.api_key) {
      console.log('📱 Using settings from client request...');
      openrouterApiKey = clientSettings.api_key;
      openrouterModel = clientSettings.model || 'deepseek/deepseek-r1-0528-qwen3-8b';
      console.log('✅ Client settings found');
      console.log('- API Key found:', openrouterApiKey.startsWith('sk-or-v1-'));
      console.log('- Model from Client:', openrouterModel);
    } else {
      console.log('📱 No client settings found, checking environment variables...');
      openrouterApiKey = process.env.OPENROUTER_API_KEY || '';
      openrouterModel = process.env.OPENROUTER_MODEL || 'deepseek/deepseek-r1-0528-qwen3-8b';
      console.log('- Using Environment Variables');
      console.log('- ENV API Key found:', !!openrouterApiKey);
      console.log('- Model from ENV:', openrouterModel);
    }
    
    if (!openrouterApiKey) {
      console.error('❌ OpenRouter API key not found in both client settings and environment variables');
      return NextResponse.json(
        { 
          success: false, 
          message: `❌ ไม่พบ OpenRouter API Key
          
กรุณาตั้งค่า OpenRouter API Key ในหน้า Settings:
1. คลิกปุ่ม "Settings" ด้านบนขวา
2. กรอก OpenRouter API Key 
3. กดปุ่ม "บันทึกการตั้งค่า"
4. ทดสอบด้วยปุ่ม "ทดสอบ"

หรือตั้งค่าใน Environment Variables (สำหรับ admin):
OPENROUTER_API_KEY=your-api-key`,
          formData: body,
          debug_info: {
            client_settings_found: !!clientSettings,
            env_key_found: !!process.env.OPENROUTER_API_KEY,
            client_api_key_exists: !!(clientSettings && clientSettings.api_key)
          }
        },
        { status: 400 }
      );
    }

    // Validate API key format
    if (!openrouterApiKey.startsWith('sk-or-v1-')) {
      console.error('❌ Invalid OpenRouter API key format');
      return NextResponse.json(
        { 
          success: false, 
          message: `❌ OpenRouter API Key รูปแบบไม่ถูกต้อง
          
API Key ต้องขึ้นต้นด้วย "sk-or-v1-"
กรุณาตรวจสอบ API Key ในหน้า Settings`,
          formData: body
        },
        { status: 400 }
      );
    }

    console.log('✅ OpenRouter settings ready');
    console.log('- Final Model:', openrouterModel);
    
    let finalSuccess = false;
    let finalMessage = '';
    let documentUrl = '';

    // Check if we should skip Google APIs (for testing)
    const googleClientEmail = process.env.GOOGLE_CLIENT_EMAIL;
    const skipGoogleManual = process.env.SKIP_GOOGLE_APIS === 'true';
    const isGmailAccount = googleClientEmail?.includes('@gmail.com');
    const isNotServiceAccount = !googleClientEmail?.includes('.iam.gserviceaccount.com');
    
    // Force skip Google APIs temporarily to avoid API not enabled error
    const forceSkipForTesting = true; // Set to false when APIs are enabled
    
    const skipGoogleAPIs = skipGoogleManual || isGmailAccount || isNotServiceAccount || forceSkipForTesting;
    
    console.log('🔍 Google APIs Skip Check:');
    console.log('- GOOGLE_CLIENT_EMAIL:', googleClientEmail);
    console.log('- SKIP_GOOGLE_APIS:', skipGoogleManual);
    console.log('- Is Gmail Account:', isGmailAccount);
    console.log('- Is Not Service Account:', isNotServiceAccount);
    console.log('- Force Skip (Testing):', forceSkipForTesting);
    console.log('- Final Decision - Skip Google APIs:', skipGoogleAPIs);

    try {
      // Step 1: Generate SEO content using OpenRouter
      console.log('🤖 Generating SEO content...');
      const seoResult = await generateSEOContent(formData, {
        apiKey: openrouterApiKey,
        model: openrouterModel
      });
      
      if (!seoResult.success || !seoResult.content) {
        throw new Error(seoResult.message || 'Failed to generate SEO content');
      }

      console.log('✅ SEO content generated successfully');

      let pdfBuffer: Buffer | null = null;

      if (skipGoogleAPIs) {
        console.log('⚠️ Skipping Google APIs (testing mode)');
        // Create a simple text file buffer for testing
        pdfBuffer = Buffer.from(seoResult.content, 'utf-8');
      } else {
        // Step 2: Create Google Document
        console.log('📄 Creating Google Document...');
        const docResult = await createGoogleDoc(formData.page_title, seoResult.content);
        
        if (!docResult.success || !docResult.documentId) {
          throw new Error(docResult.message || 'Failed to create Google Document');
        }

        console.log('✅ Google Document created:', docResult.documentUrl);
        documentUrl = docResult.documentUrl || '';

        // Step 3: Export document as PDF
        console.log('📊 Exporting document as PDF...');
        const pdfResult = await exportDocumentAsPDF(docResult.documentId);
        
        if (!pdfResult.success || !pdfResult.buffer) {
          throw new Error(pdfResult.message || 'Failed to export PDF');
        }

        console.log('✅ PDF exported successfully');
        pdfBuffer = pdfResult.buffer;
      }

      // Step 4: Send email with PDF attachment
      console.log('📧 Sending email...');
      
      if (skipGoogleAPIs) {
        // Send as text file when skipping Google APIs
        const emailResult = await sendTextContentEmail(
          formData.recipient_email,
          formData.page_title,
          seoResult.content,
          formData.website_name
        );
        
        if (!emailResult.success) {
          throw new Error(emailResult.message || 'Failed to send email');
        }
      } else {
        // Send as PDF when using Google APIs
        const emailResult = await sendSEOContentEmail(
          formData.recipient_email,
          formData.page_title,
          pdfBuffer,
          formData.website_name
        );

        if (!emailResult.success) {
          throw new Error(emailResult.message || 'Failed to send email');
        }
      }

      console.log('✅ Email sent successfully');
      
      finalSuccess = true;
      finalMessage = 'SEO content generated and sent successfully';

    } catch (error) {
      console.error('❌ Error in process:', error);
      finalSuccess = false;
      finalMessage = error instanceof Error ? error.message : 'Unknown error';
    }

    // Return response with form data for client-side logging
    return NextResponse.json({
      success: finalSuccess,
      message: finalMessage,
      document_url: skipGoogleAPIs ? 'N/A (testing mode)' : documentUrl,
      email_sent: finalSuccess,
      formData: formData, // Include form data for client-side logging
    });

  } catch (error) {
    console.error('💥 Unexpected error in SEO form API:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        message: 'Internal server error',
        error_details: error instanceof Error ? error.message : 'Unknown error',
        formData: body || null // Try to include form data even on error
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json(
    {
      success: false,
      message: 'Method not allowed. Please use POST.',
    } satisfies APIResponse,
    { status: 405 }
  );
} 