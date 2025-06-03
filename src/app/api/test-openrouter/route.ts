import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { api_key, model } = await request.json();

    console.log('🔧 Testing OpenRouter API...');
    console.log('- API Key length:', api_key?.length || 0);
    console.log('- API Key format check:', api_key?.startsWith('sk-or-v1-') || false);
    console.log('- Model:', model || 'deepseek/deepseek-r1-0528-qwen3-8b');

    if (!api_key) {
      console.log('❌ No API key provided');
      return NextResponse.json(
        { success: false, message: 'API Key ไม่ได้ระบุ' },
        { status: 400 }
      );
    }

    // Validate API key format
    if (!api_key.startsWith('sk-or-v1-')) {
      console.log('❌ Invalid API key format');
      return NextResponse.json(
        { 
          success: false, 
          message: 'API Key รูปแบบไม่ถูกต้อง ต้องขึ้นต้นด้วย "sk-or-v1-"' 
        },
        { status: 400 }
      );
    }

    // Check for demo/invalid keys
    const demoKeys = [
      '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',
      'sk-or-v1-test',
      'sk-or-v1-demo',
      'sk-or-v1-example'
    ];

    if (demoKeys.includes(api_key)) {
      console.log('❌ Demo API key detected');
      return NextResponse.json(
        { 
          success: false, 
          message: '❌ นี่เป็น Demo API Key ที่ใช้ร่วมกัน\n\nสำหรับการใช้งานส่วนตัว กรุณาไปที่ OpenRouter.ai สมัครบัญชีและสร้าง API Key ของคุณเอง\n\nDemo Key นี้อาจมีข้อจำกัดหรือหมดอายุได้' 
        },
        { status: 400 }
      );
    }

    const requestBody = {
      model: model || 'deepseek/deepseek-r1-0528-qwen3-8b',
      messages: [
        {
          role: 'user',
          content: 'ทดสอบการเชื่อมต่อ กรุณาตอบกลับว่า "การเชื่อมต่อสำเร็จ"'
        }
      ],
      max_tokens: 50,
      temperature: 0.1
    };

    console.log('📤 Sending request to OpenRouter...');

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${api_key}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
        'X-Title': 'SEO Content Generator'
      },
      body: JSON.stringify(requestBody)
    });

    console.log('📊 Response status:', response.status);

    if (!response.ok) {
      const errorData = await response.text();
      console.log('❌ API Error:', errorData);
      
      let errorMessage = `OpenRouter API Error: ${response.status}`;
      
      try {
        const errorJson = JSON.parse(errorData);
        if (response.status === 401) {
          errorMessage = `❌ API Key ไม่ถูกต้องหรือหมดอายุ
          
กรุณาตรวจสอบ:
1. API Key ถูกต้องหรือไม่
2. API Key ยังใช้งานได้หรือไม่  
3. บัญชี OpenRouter มี credits เหลืออยู่หรือไม่

Error: ${errorJson.error?.message || errorData}`;
        } else {
          errorMessage = `${errorMessage} - ${errorJson.error?.message || errorData}`;
        }
      } catch (parseError) {
        errorMessage = `${errorMessage} - ${errorData}`;
      }
      
      return NextResponse.json(
        { success: false, message: errorMessage },
        { status: 400 }
      );
    }

    const data = await response.json();
    console.log('✅ OpenRouter API test successful');
    
    return NextResponse.json({
      success: true,
      message: '✅ OpenRouter API ทำงานปกติ!',
      response: data.choices?.[0]?.message?.content || 'ได้รับการตอบกลับจาก AI',
      usage: data.usage
    });

  } catch (error) {
    console.error('💥 Test OpenRouter error:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: `เกิดข้อผิดพลาดในการทดสอบ: ${error instanceof Error ? error.message : 'Unknown error'}` 
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json(
    { success: false, message: 'Method not allowed. Please use POST.' },
    { status: 405 }
  );
} 