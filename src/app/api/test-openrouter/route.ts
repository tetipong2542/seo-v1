import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { api_key, model } = await request.json();

    if (!api_key) {
      return NextResponse.json(
        { success: false, message: 'API Key ไม่ได้ระบุ' },
        { status: 400 }
      );
    }

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${api_key}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': process.env.SITE_URL || 'http://localhost:3000',
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