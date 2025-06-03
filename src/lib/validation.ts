import { z } from 'zod';
import { SEOFormData, ValidationResult } from '@/types';

const KeywordLinkSchema = z.object({
  keyword: z.string().min(1, 'กรุณาใส่ keyword'),
  link: z.string().min(1, 'กรุณาใส่ link').regex(/^\//, 'Link ต้องขึ้นต้นด้วย /'),
  frequency: z.number().min(1, 'จำนวนครั้งต้องมากกว่า 0').max(10, 'จำนวนครั้งไม่ควรเกิน 10')
});

const SEOFormSchema = z.object({
  website_name: z.string().min(1, 'กรุณาใส่ชื่อเว็บไซต์'),
  website_url: z.string().url('กรุณาใส่ URL ที่ถูกต้อง').optional().or(z.literal('')),
  website_description: z.string().min(10, 'กรุณาใส่รายละเอียดเว็บไซต์อย่างน้อย 10 ตัวอักษร'),
  page_title: z.string().min(1, 'กรุณาใส่ชื่อหน้า/ชื่อเรื่อง'),
  keywords_links: z.array(KeywordLinkSchema).min(1, 'กรุณาใส่อย่างน้อย 1 keyword และ link'),
  additional_prompt: z.string().optional(),
  content_length: z.enum(['short', 'medium', 'long'], {
    errorMap: () => ({ message: 'กรุณาเลือกความยาวของเนื้อหา' })
  }),
  recipient_email: z.string().email('กรุณาใส่อีเมลที่ถูกต้อง'),
});

export function validateSEOForm(data: unknown): ValidationResult {
  try {
    const validatedData = SEOFormSchema.parse(data);
    return {
      success: true,
      data: validatedData,
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors = error.errors.map(err => err.message);
      return {
        success: false,
        message: errors[0], // Return first error as main message
        errors: errors,
      };
    }
    
    return {
      success: false,
      message: 'ข้อมูลไม่ถูกต้อง',
    };
  }
} 