import axios from 'axios';
import { SEOFormData, OpenRouterResponse, ProcessedResponse, ContentAnalysis, KeywordAnalysis } from '@/types';

const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';

interface OpenRouterConfig {
  apiKey: string;
  model?: string;
}

export async function generateSEOContent(
  data: SEOFormData, 
  config?: OpenRouterConfig
): Promise<ProcessedResponse> {
  try {
    let apiKey: string;
    let model: string;

    if (config) {
      // Use provided config (for API calls)
      apiKey = config.apiKey;
      model = config.model || 'deepseek/deepseek-r1-0528-qwen3-8b';
    } else {
      // Fallback to IndexedDB (for client-side calls)
      const { indexedDBService } = await import('@/lib/indexeddb');
      console.log('Getting settings from IndexedDB...');
      const settings = await indexedDBService.getSettings();
      
      if (!settings) {
        console.error('No settings found in IndexedDB');
        return {
          success: false,
          message: 'กรุณาตั้งค่า OpenRouter API ในหน้า Settings ก่อน'
        };
      }
      
      apiKey = settings.openrouter_api_key;
      model = settings.openrouter_model || 'deepseek/deepseek-r1-0528-qwen3-8b';
    }
    
    if (!apiKey) {
      console.error('OpenRouter API key not found');
      return {
        success: false,
        message: 'กรุณาใส่ OpenRouter API Key ในหน้า Settings'
      };
    }
    
    if (!apiKey.startsWith('sk-or-v1-')) {
      console.error('Invalid OpenRouter API key format');
      return {
        success: false,
        message: 'OpenRouter API Key รูปแบบไม่ถูกต้อง'
      };
    }
    
    console.log('API Key found and format is correct');
    console.log('Using model:', model);
    
    const systemPrompt = "คุณเป็นผู้เชี่ยวชาญด้าน SEO และการเขียนเนื้อหาภาษาไทย ที่สามารถสร้างเนื้อหาคุณภาพสูงและเหมาะสมกับการทำ SEO โดยจะต้องปฏิบัติตามข้อกำหนดเรื่อง keywords และ internal links อย่างเคร่งครัด 100% ไม่มีข้อยกเว้น";

    // Generate content with retry mechanism
    let currentContent = '';
    let attempts = 0;
    const maxAttempts = 3;
    let validationResult;

    while (attempts < maxAttempts) {
      attempts++;
      console.log(`🔄 Attempt ${attempts}/${maxAttempts} to generate valid content`);

      // Format keywords and links with more detailed instructions
      const keywordsLinksText = data.keywords_links
        .map((item, index) => `${index + 1}. คำสำคัญ: "${item.keyword}" ใช้ ${item.frequency} ครั้งใน Internal Link: ${item.link}`)
        .join('\n');

      // Calculate total keyword usage for verification
      const totalKeywordUsage = data.keywords_links.reduce((total, item) => total + item.frequency, 0);
      const keywordList = data.keywords_links.map(item => `"${item.keyword}"`).join(', ');

      // Content length mapping with detailed word counts
      const contentLengthMap: Record<string, { description: string, wordCount: string, tokens: number }> = {
        short: { 
          description: 'สั้น (800-1,200 คำ)', 
          wordCount: '800-1,200 คำ',
          tokens: 3000 
        },
        medium: { 
          description: 'ปานกลาง (1,500-2,000 คำ)', 
          wordCount: '1,500-2,000 คำ',
          tokens: 4500 
        },
        long: { 
          description: 'ยาว (2,500-3,500 คำ)', 
          wordCount: '2,500-3,500 คำ',
          tokens: 6000 
        }
      };

      const contentLength = contentLengthMap[data.content_length] || contentLengthMap.medium;
      
      let userPrompt = '';
      
      if (attempts === 1) {
        // First attempt - create new content
        userPrompt = `สร้างเนื้อหา SEO Onpage สำหรับเว็บไซต์: ${data.website_name}

รายละเอียดเว็บไซต์: ${data.website_description}

หัวข้อ: ${data.page_title}

📋 **รายการ Keywords และ Internal Links ที่ต้องใช้ให้ครบถ้วน:**
${keywordsLinksText}

**🚨 ข้อกำหนดสำคัญที่ต้องปฏิบัติ 100%:**
**สรุปการใช้ Keywords:** ต้องใช้ทั้งหมด ${totalKeywordUsage} ครั้ง จากคำสำคัญ ${keywordList}
**จำนวน Internal Links:** ต้องมี ${data.keywords_links.length} ลิงก์

ความยาวของเนื้อหา: ${contentLength.description}
**สำคัญ: เนื้อหาต้องมีความยาวอย่างน้อย ${contentLength.wordCount} จริงๆ**

คำแนะนำเพิ่มเติม: ${data.additional_prompt || 'ไม่มี'}

🎯 **ข้อกำหนดที่ต้องปฏิบัติอย่างเข้มงวด:**

1. **Keywords Usage - บังคับเคร่งครัด:**
${data.keywords_links.map(item => `   • "${item.keyword}" = ใช้เท่ากับ ${item.frequency} ครั้งเท่านั้น (ไม่มากไม่น้อย)`).join('\n')}

2. **Internal Links - บังคับครบทุกลิงก์:**
${data.keywords_links.map(item => `   • สร้างลิงก์ [${item.keyword}](${item.link}) หรือใช้ "${item.keyword}" เป็น anchor text`).join('\n')}

3. **รูปแบบ Internal Links:**
   - ใช้รูปแบบ [ข้อความ](ลิงก์) เท่านั้น
   - ลิงก์ต้องเป็น relative path ขึ้นต้นด้วย /
   - ตัวอย่างถูกต้อง: [${data.keywords_links[0]?.keyword || 'คำสำคัญ'}](${data.keywords_links[0]?.link || '/example'})
   - ห้ามใส่ domain หรือ URL เต็ม

📝 **โครงสร้างเนื้อหาที่ต้องการ:**

1. **Meta Title** (50-60 ตัวอักษร) - ใส่คำสำคัญหลัก

2. **Meta Description** (150-160 ตัวอักษร) - ใส่คำสำคัญหลัก

3. **H1 หัวข้อหลัก** - ใช้หัวข้อที่กำหนด: "${data.page_title}"

4. **เนื้อหาหลัก** ที่มี:
   - H2, H3 หัวข้อย่อย (ใส่คำสำคัญบางส่วน)
   - ย่อหน้าที่มีการกระจาย keywords ตามจำนวนที่กำหนดอย่างเคร่งครัด
   - Internal links ครบทุกลิงก์ที่ระบุ
   - เนื้อหาที่เป็นประโยชน์และอ่านเข้าใจง่าย

5. **FAQ Section** - ใช้คำสำคัญในคำถาม-คำตอบ

6. **สรุป** - ใช้คำสำคัญและมี internal links

✅ **การตรวจสอบก่อนส่ง - บังคับให้ทำ:**
- นับ keywords แต่ละคำให้ตรงตามจำนวนที่กำหนดเป๊ะๆ
- ตรวจสอบ internal links ให้ครบ ${data.keywords_links.length} ลิงก์
- ความยาวเนื้อหาต้องครบ ${contentLength.wordCount}
- รูปแบบ Markdown ถูกต้อง

⚠️ **ข้อห้ามเคร่งครัด:**
- ห้ามใช้ keywords น้อยกว่าหรือมากกว่าที่กำหนดแม้แต่ 1 ครั้ง
- ห้ามข้าม internal links ใดๆ
- ห้ามใช้ลิงก์แบบ absolute URL
- ห้ามเขียนเนื้อหาสั้นกว่าที่กำหนด

🚨 **สำคัญมาก:** หากคุณไม่สามารถปฏิบัติตามข้อกำหนดข้างต้นได้ 100% กรุณาปฏิเสธไม่สร้างเนื้อหา

กรุณาสร้างเนื้อหาตามข้อกำหนดข้างต้นอย่างเคร่งครัด และตรวจสอบให้แน่ใจว่าใช้ keywords และ internal links ครบถ้วนตามที่ระบุ`;
      } else {
        // Retry attempts - fix specific issues
        const prevAnalysis = await analyzeContent(currentContent, data.keywords_links);
        const issues = identifyIssues(prevAnalysis, data.keywords_links);
        
        userPrompt = `แก้ไขเนื้อหาด้านล่างให้ตรงตามข้อกำหนด Keywords และ Internal Links อย่างเคร่งครัด:

**🚨 ปัญหาที่พบในเนื้อหาเดิม:**
${issues.join('\n')}

**📋 ข้อกำหนดที่ต้องแก้ไขให้ถูกต้อง:**
${keywordsLinksText}

**เนื้อหาเดิมที่ต้องแก้ไข:**
${currentContent}

**วิธีการแก้ไข:**
1. แก้ไขจำนวน keywords ให้ตรงตามที่กำหนดเป๊ะๆ
2. เพิ่ม/แก้ไข internal links ให้ครบถ้วน
3. รักษาความยาวและคุณภาพของเนื้อหา
4. ใช้รูปแบบ Markdown ที่ถูกต้อง

**🎯 เป้าหมาย:**
${data.keywords_links.map(item => `• "${item.keyword}" = ${item.frequency} ครั้งเท่านั้น + ลิงก์ ${item.link}`).join('\n')}

กรุณาแก้ไขเนื้อหาให้ตรงตามข้อกำหนดอย่างเคร่งครัด ห้ามเปลี่ยนหัวข้อหลักหรือโครงสร้างหลัก`;
      }

      const maxTokens = contentLength.tokens;

      const requestBody = {
        model: model,
        messages: [
          {
            role: "system",
            content: systemPrompt
          },
          {
            role: "user", 
            content: userPrompt
          }
        ],
        temperature: attempts === 1 ? 0.7 : 0.3, // Lower temperature for corrections
        max_tokens: maxTokens,
        top_p: 0.9,
        frequency_penalty: 0.1,
        presence_penalty: 0.1
      };

      console.log('Making request to OpenRouter...');
      console.log('Max tokens:', maxTokens);
      console.log('Content length target:', contentLength.wordCount);
      console.log('📋 Keywords & Links Summary:');
      data.keywords_links.forEach((item, index) => {
        console.log(`  ${index + 1}. "${item.keyword}" (${item.frequency}x) -> ${item.link}`);
      });
      console.log(`📊 Total keyword usage required: ${totalKeywordUsage} times`);
      console.log(`🔗 Total internal links required: ${data.keywords_links.length} links`);
      
      const response = await axios.post<OpenRouterResponse>(OPENROUTER_API_URL, requestBody, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
          'HTTP-Referer': process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
          'X-Title': 'SEO Onpage Generator'
        },
        timeout: 180000, // 3 minutes for longer content
      });

      console.log('OpenRouter response received successfully');

      // Check if we have a valid response
      if (!response.data.choices || 
          !response.data.choices[0] || 
          !response.data.choices[0].message || 
          !response.data.choices[0].message.content) {
        console.error('Invalid response structure from OpenRouter');
        return {
          success: false,
          message: 'Invalid response from OpenRouter'
        };
      }

      currentContent = response.data.choices[0].message.content;
      
      // Count words in content (approximate)
      const wordCount = currentContent.split(/\s+/).length;
      console.log('Generated content word count:', wordCount);

      // Analyze keywords and internal links usage
      console.log('🔍 Analyzing generated content...');
      validationResult = await analyzeContent(currentContent, data.keywords_links);

      // Check if content meets requirements
      const isValid = validateContent(validationResult, data.keywords_links);
      
      if (isValid) {
        console.log('✅ Content validation passed - all requirements met!');
        break;
      } else {
        console.log('❌ Content validation failed - retrying...');
        const issues = identifyIssues(validationResult, data.keywords_links);
        console.log('Issues found:', issues);
        
        if (attempts === maxAttempts) {
          console.log('⚠️ Max attempts reached, using best available content');
        }
      }
    }

    const wordCount = currentContent.split(/\s+/).length;
    
    // Ensure validationResult is not undefined
    if (!validationResult) {
      validationResult = await analyzeContent(currentContent, data.keywords_links);
    }
    
    // Log final analysis results
    console.log('📊 Final Keywords Analysis:');
    validationResult.keywordAnalysis.forEach(analysis => {
      const status = analysis.actual === analysis.expected ? '✅' : '⚠️';
      console.log(`  ${status} "${analysis.keyword}": ${analysis.actual}/${analysis.expected} times`);
      console.log(`  🔗 Link "${analysis.link}": ${analysis.linkFound ? '✅ Found' : '❌ Missing'}`);
    });

    const totalExpected = data.keywords_links.reduce((sum, item) => sum + item.frequency, 0);
    const totalActual = validationResult.keywordAnalysis.reduce((sum, item) => sum + item.actual, 0);
    const linksExpected = data.keywords_links.length;
    const linksFound = validationResult.keywordAnalysis.filter(item => item.linkFound).length;

    console.log(`📈 Final Summary: Keywords ${totalActual}/${totalExpected}, Links ${linksFound}/${linksExpected}`);

    // Create detailed message with analysis
    let analysisMessage = `เนื้อหาถูกสร้างสำเร็จ (ประมาณ ${wordCount} คำ) - ใช้ ${attempts} ครั้งในการปรับปรุง`;
    
    if (totalActual !== totalExpected || linksFound !== linksExpected) {
      analysisMessage += `\n⚠️ การตรวจสอบ: Keywords ${totalActual}/${totalExpected}, Links ${linksFound}/${linksExpected}`;
    } else {
      analysisMessage += `\n✅ Keywords และ Internal Links ถูกต้องครบถ้วน`;
    }

    return {
      success: true,
      message: analysisMessage,
      content: currentContent,
      original_data: data,
      analysis: {
        wordCount,
        keywordAnalysis: validationResult.keywordAnalysis,
        summary: {
          totalExpected,
          totalActual,
          linksExpected,
          linksFound
        },
        attempts
      }
    };

  } catch (error) {
    console.error('OpenRouter API Error Details:', error);
    
    if (axios.isAxiosError(error)) {
      console.error('Response status:', error.response?.status);
      console.error('Response data:', error.response?.data);
      
      if (error.response?.status === 401) {
        return {
          success: false,
          message: 'OpenRouter API authentication failed. กรุณาตรวจสอบ API Key ในหน้า Settings'
        };
      }
      
      if (error.response?.status === 403) {
        return {
          success: false,
          message: 'OpenRouter API access forbidden. กรุณาตรวจสอบสิทธิ์ API Key'
        };
      }
      
      const errorMessage = error.response?.data?.error?.message || 
                          error.response?.data?.message || 
                          error.message;
      return {
        success: false,
        message: `OpenRouter API Error: ${errorMessage}`
      };
    }

    return {
      success: false,
      message: 'Failed to generate content from OpenRouter API'
    };
  }
}

// Helper function to analyze content
async function analyzeContent(content: string, keywordsLinks: any[]) {
  const keywordAnalysis = keywordsLinks.map(item => {
    // Count keyword occurrences (case insensitive)
    const regex = new RegExp(item.keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
    const matches = content.match(regex) || [];
    const actualCount = matches.length;
    
    // Check for internal links
    const linkRegex = new RegExp(`\\[([^\\]]*(?:${item.keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}[^\\]]*)?)\\]\\(${item.link.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\)`, 'gi');
    const linkMatches = content.match(linkRegex) || [];
    
    return {
      keyword: item.keyword,
      expected: item.frequency,
      actual: actualCount,
      link: item.link,
      linkFound: linkMatches.length > 0,
      linkMatches: linkMatches
    };
  });

  return { keywordAnalysis };
}

// Helper function to validate content
function validateContent(analysis: any, keywordsLinks: any[]): boolean {
  for (const item of analysis.keywordAnalysis) {
    if (item.actual !== item.expected || !item.linkFound) {
      return false;
    }
  }
  return true;
}

// Helper function to identify specific issues
function identifyIssues(analysis: any, keywordsLinks: any[]): string[] {
  const issues: string[] = [];
  
  analysis.keywordAnalysis.forEach((item: any) => {
    if (item.actual !== item.expected) {
      if (item.actual > item.expected) {
        issues.push(`🔴 "${item.keyword}": ใช้มากเกินไป ${item.actual}/${item.expected} ครั้ง (ลดลง ${item.actual - item.expected} ครั้ง)`);
      } else {
        issues.push(`🔴 "${item.keyword}": ใช้น้อยเกินไป ${item.actual}/${item.expected} ครั้ง (เพิ่ม ${item.expected - item.actual} ครั้ง)`);
      }
    }
    
    if (!item.linkFound) {
      issues.push(`🔗 ขาด Internal Link: [${item.keyword}](${item.link})`);
    }
  });
  
  return issues;
} 