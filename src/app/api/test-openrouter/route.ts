import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { api_key, model } = await request.json();

    console.log('🧪 Testing OpenRouter API');
    console.log('- API Key received:', api_key ? `${api_key.substring(0, 10)}...` : 'NONE');
    console.log('- API Key length:', api_key ? api_key.length : 0);
    console.log('- API Key format:', api_key ? api_key.startsWith('sk-or-v1-') : 'N/A');
    console.log('- Model:', model);

    if (!api_key) {
      return NextResponse.json(
        { success: false, message: 'API Key ไม่ได้ระบุ' },
        { status: 400 }
      );
    }

    if (!api_key.startsWith('sk-or-v1-')) {
      return NextResponse.json(
        { 
          success: false, 
          message: `❌ API Key รูปแบบไม่ถูกต้อง (ต้องขึ้นต้นด้วย sk-or-v1-)
          
ได้รับ API Key: ${api_key.substring(0, 20)}...
รูปแบบที่ถูกต้อง: sk-or-v1-xxxxxxxxx

กรุณาตรวจสอบ API Key ใน OpenRouter dashboard` 
        },
        { status: 400 }
      );
    }

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${api_key}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': process.env.NEXT_PUBLIC_APP_URL || process.env.SITE_URL || 'http://localhost:3000',
        'X-Title': 'SEO Content Generator'
      },
      body: JSON.stringify({
        model: model || 'deepseek/deepseek-r1-0528-qwen3-8b',
        messages: [
          {
            role: 'user',
            content: 'ทดสอบการเชื่อมต่อ กรุณาตอบกลับว่า "การเชื่อมต่อสำเร็จ"'
          }
        ],
        max_tokens: 50,
        temperature: 0.1
      })
    });

    if (!response.ok) {
      const errorData = await response.text();
      return NextResponse.json(
        { 
          success: false, 
          message: `OpenRouter API Error: ${response.status} - ${errorData}` 
        },
        { status: 400 }
      );
    }

    const data = await response.json();
    
    return NextResponse.json({
      success: true,
      message: 'OpenRouter API ทำงานปกติ',
      response: data.choices?.[0]?.message?.content || 'ได้รับการตอบกลับจาก AI'
    });

  } catch (error) {
    console.error('Test OpenRouter error:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: `เกิดข้อผิดพลาด: ${error instanceof Error ? error.message : 'Unknown error'}` 
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