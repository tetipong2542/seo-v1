'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { KeywordsLinksInput } from '@/components/ui/KeywordsLinksInput';
import { SEOFormData, KeywordLink } from '@/types';
import { validateSEOForm } from '@/lib/validation';
import { indexedDBService } from '@/lib/indexeddb';
import { Loader2, Send, CheckCircle, XCircle } from 'lucide-react';

interface FormState {
  isSubmitting: boolean;
  message: string;
  isSuccess: boolean;
}

export function SEOForm() {
  const [formData, setFormData] = useState<SEOFormData>({
    website_name: '',
    website_url: '',
    website_description: '',
    page_title: '',
    keywords_links: [{ keyword: '', link: '', frequency: 2 }],
    additional_prompt: '',
    content_length: 'medium',
    recipient_email: '',
  });

  const [formState, setFormState] = useState<FormState>({
    isSubmitting: false,
    message: '',
    isSuccess: false,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Function to save log to IndexedDB
  const saveLog = async (data: SEOFormData, success: boolean, errorMessage?: string) => {
    try {
      // Get model from settings
      const settings = await indexedDBService.getSettings();
      const model = settings?.openrouter_model || 'deepseek/deepseek-r1-0528-qwen3-8b';
      
      // Extract keywords from keywords_links
      const keywords_list = data.keywords_links.map(item => item.keyword).filter(keyword => keyword.trim());
      
      await indexedDBService.addLog({
        website_name: data.website_name,
        website_url: data.website_url,
        page_title: data.page_title,
        keywords_count: data.keywords_links.length,
        keywords_list: keywords_list,
        content_length: data.content_length,
        model: model,
        recipient_email: data.recipient_email,
        status: success ? 'success' : 'error',
        error_message: errorMessage,
      });
      console.log('✅ Log saved to IndexedDB');
    } catch (error) {
      console.error('❌ Failed to save log:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormState({ isSubmitting: true, message: '', isSuccess: false });
    setErrors({});

    // Validate form
    const validation = validateSEOForm(formData);
    if (!validation.success) {
      setFormState({ 
        isSubmitting: false, 
        message: validation.message || 'กรุณาตรวจสอบข้อมูลที่กรอก', 
        isSuccess: false 
      });
      
      // Set field-specific errors
      if (validation.errors) {
        const newErrors: Record<string, string> = {};
        validation.errors.forEach(error => {
          if (error.includes('ชื่อเว็บไซต์')) newErrors.website_name = error;
          if (error.includes('URL')) newErrors.website_url = error;
          if (error.includes('รายละเอียด')) newErrors.website_description = error;
          if (error.includes('ชื่อหน้า')) newErrors.page_title = error;
          if (error.includes('keyword') || error.includes('จำนวน')) newErrors.keywords_links = error;
          if (error.includes('ความยาว')) newErrors.content_length = error;
          if (error.includes('อีเมล')) newErrors.recipient_email = error;
        });
        setErrors(newErrors);
      }
      
      // Save failed validation log
      await saveLog(formData, false, validation.message || 'Validation failed');
      return;
    }

    try {
      // Get OpenRouter settings from IndexedDB before sending request
      console.log('🔧 Getting OpenRouter settings from IndexedDB...');
      const settings = await indexedDBService.getSettings();
      
      // Prepare request body with settings
      const requestBody = {
        ...formData,
        _openrouter_settings: settings ? {
          api_key: settings.openrouter_api_key,
          model: settings.openrouter_model
        } : null
      };

      console.log('📤 Sending request with settings:', {
        hasSettings: !!settings,
        model: settings?.openrouter_model || 'not found',
        apiKeyExists: !!settings?.openrouter_api_key
      });

      const response = await fetch('/api/seo-onpage-form', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        setFormState({
          isSubmitting: false,
          message: 'เนื้อหา SEO ถูกสร้างและส่งไปยังอีเมลเรียบร้อยแล้ว! กรุณาตรวจสอบอีเมลของคุณ',
          isSuccess: true,
        });
        
        // Save success log
        await saveLog(formData, true);
        
        // Reset form
        setFormData({
          website_name: '',
          website_url: '',
          website_description: '',
          page_title: '',
          keywords_links: [{ keyword: '', link: '', frequency: 2 }],
          additional_prompt: '',
          content_length: 'medium',
          recipient_email: '',
        });
      } else {
        const errorMessage = result.message || 'เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง';
        setFormState({
          isSubmitting: false,
          message: errorMessage,
          isSuccess: false,
        });
        
        // Save error log
        await saveLog(formData, false, errorMessage);
      }
    } catch (error) {
      const errorMessage = 'เกิดข้อผิดพลาดในการเชื่อมต่อ กรุณาลองใหม่อีกครั้ง';
      setFormState({
        isSubmitting: false,
        message: errorMessage,
        isSuccess: false,
      });
      
      // Save network error log
      await saveLog(formData, false, errorMessage);
    } finally {
      setFormState(prev => ({ ...prev, isSubmitting: false }));
    }
  };

  const handleInputChange = (field: keyof SEOFormData, value: string | KeywordLink[]) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const contentLengthOptions = [
    { value: 'short', label: 'สั้น (800-1,200 คำ)', description: 'เหมาะสำหรับบทความสั้นๆ' },
    { value: 'medium', label: 'ปานกลาง (1,500-2,000 คำ)', description: 'เหมาะสำหรับบทความทั่วไป' },
    { value: 'long', label: 'ยาว (2,500-3,500 คำ)', description: 'เหมาะสำหรับบทความเชิงลึก' }
  ];

  return (
    <div className="max-w-2xl mx-auto p-4 sm:p-6 bg-white rounded-lg shadow-lg mb-4 sm:mb-0">
      <div className="text-center mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
          SEO Onpage Automate
        </h1>
        <p className="text-gray-600">
          สร้างเนื้อหา SEO คุณภาพสูงด้วย AI และส่งไปยังอีเมลของคุณ
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
        <div>
          <label htmlFor="website_name" className="block text-sm font-medium text-gray-700 mb-2">
            ชื่อเว็บไซต์
          </label>
          <Input
            id="website_name"
            type="text"
            placeholder="ชื่อเว็บไซต์หรือธุรกิจของคุณ"
            value={formData.website_name}
            onChange={(e) => handleInputChange('website_name', e.target.value)}
            className={errors.website_name ? 'border-red-500' : ''}
          />
          {errors.website_name && (
            <p className="mt-1 text-sm text-red-600">{errors.website_name}</p>
          )}
        </div>

        <div>
          <label htmlFor="website_url" className="block text-sm font-medium text-gray-700 mb-2">
            URL เว็บไซต์ (ไม่บังคับ)
          </label>
          <Input
            id="website_url"
            type="url"
            placeholder="https://www.example.com"
            value={formData.website_url}
            onChange={(e) => handleInputChange('website_url', e.target.value)}
            className={errors.website_url ? 'border-red-500' : ''}
          />
          {errors.website_url && (
            <p className="mt-1 text-sm text-red-600">{errors.website_url}</p>
          )}
        </div>

        <div>
          <label htmlFor="website_description" className="block text-sm font-medium text-gray-700 mb-2">
            รายละเอียดเว็บไซต์
          </label>
          <Textarea
            id="website_description"
            placeholder="อธิบายเกี่ยวกับเว็บไซต์ ผลิตภัณฑ์ หรือบริการของคุณ"
            value={formData.website_description}
            onChange={(e) => handleInputChange('website_description', e.target.value)}
            rows={4}
            className={errors.website_description ? 'border-red-500' : ''}
          />
          {errors.website_description && (
            <p className="mt-1 text-sm text-red-600">{errors.website_description}</p>
          )}
        </div>

        <div>
          <label htmlFor="page_title" className="block text-sm font-medium text-gray-700 mb-2">
            ชื่อหน้า/ชื่อเรื่อง
          </label>
          <Input
            id="page_title"
            type="text"
            placeholder="หัวข้อสำหรับเนื้อหา SEO ที่ต้องการสร้าง"
            value={formData.page_title}
            onChange={(e) => handleInputChange('page_title', e.target.value)}
            className={errors.page_title ? 'border-red-500' : ''}
          />
          {errors.page_title && (
            <p className="mt-1 text-sm text-red-600">{errors.page_title}</p>
          )}
        </div>

        <KeywordsLinksInput
          value={formData.keywords_links}
          onChange={(value) => handleInputChange('keywords_links', value)}
          error={errors.keywords_links}
        />

        <div>
          <label htmlFor="additional_prompt" className="block text-sm font-medium text-gray-700 mb-2">
            คำแนะนำเพิ่มเติม (ไม่บังคับ)
          </label>
          <Textarea
            id="additional_prompt"
            placeholder="คำแนะนำหรือข้อกำหนดเพิ่มเติมสำหรับการสร้างเนื้อหา"
            value={formData.additional_prompt}
            onChange={(e) => handleInputChange('additional_prompt', e.target.value)}
            rows={3}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            ความยาวของเนื้อหา
          </label>
          <div className="space-y-3">
            {contentLengthOptions.map((option) => (
              <div key={option.value} className="flex items-start">
                <input
                  type="radio"
                  id={`content_length_${option.value}`}
                  name="content_length"
                  value={option.value}
                  checked={formData.content_length === option.value}
                  onChange={(e) => handleInputChange('content_length', e.target.value)}
                  className="mt-1 h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                />
                <div className="ml-3">
                  <label 
                    htmlFor={`content_length_${option.value}`}
                    className="text-sm font-medium text-gray-700 cursor-pointer"
                  >
                    {option.label}
                  </label>
                  <p className="text-xs text-gray-500 mt-1">{option.description}</p>
                </div>
              </div>
            ))}
          </div>
          {errors.content_length && (
            <p className="mt-2 text-sm text-red-600">{errors.content_length}</p>
          )}
        </div>

        <div>
          <label htmlFor="recipient_email" className="block text-sm font-medium text-gray-700 mb-2">
            อีเมลผู้รับ
          </label>
          <Input
            id="recipient_email"
            type="email"
            placeholder="อีเมลที่ต้องการให้ส่งเนื้อหา SEO ไป"
            value={formData.recipient_email}
            onChange={(e) => handleInputChange('recipient_email', e.target.value)}
            className={errors.recipient_email ? 'border-red-500' : ''}
          />
          {errors.recipient_email && (
            <p className="mt-1 text-sm text-red-600">{errors.recipient_email}</p>
          )}
        </div>

        <Button
          type="submit"
          disabled={formState.isSubmitting}
          className="w-full py-3 text-lg"
        >
          {formState.isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              กำลังสร้างเนื้อหา SEO...
            </>
          ) : (
            <>
              <Send className="mr-2 h-5 w-5" />
              สร้างเนื้อหา SEO
            </>
          )}
        </Button>

        {formState.message && (
          <div className={`p-4 rounded-lg flex items-start gap-3 ${
            formState.isSuccess 
              ? 'bg-green-50 border border-green-200' 
              : 'bg-red-50 border border-red-200'
          }`}>
            {formState.isSuccess ? (
              <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
            ) : (
              <XCircle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
            )}
            <p className={`text-sm ${
              formState.isSuccess ? 'text-green-700' : 'text-red-700'
            }`}>
              {formState.message}
            </p>
          </div>
        )}
      </form>
    </div>
  );
} 