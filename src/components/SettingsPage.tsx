'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { indexedDBService, AppSettings } from '@/lib/indexeddb';
import { 
  Save, 
  Download, 
  Upload, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  Key,
  Mail,
  Cloud,
  TestTube,
  Loader2
} from 'lucide-react';

export function SettingsPage() {
  const [settings, setSettings] = useState<Partial<AppSettings>>({});
  const [isLoadingSettings, setIsLoadingSettings] = useState(true);

  const [message, setMessage] = useState<{
    type: 'success' | 'error' | 'info';
    text: string;
  } | null>(null);

  const [isLoading, setIsLoading] = useState(false);
  const [testingStates, setTestingStates] = useState({
    openrouter: false,
    email: false,
    google: false
  });

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    setIsLoadingSettings(true);
    try {
      console.log('🔄 Loading settings from IndexedDB...');
      const savedSettings = await indexedDBService.getSettings();
      
      if (savedSettings) {
        console.log('✅ Settings found:', {
          hasApiKey: !!savedSettings.openrouter_api_key,
          model: savedSettings.openrouter_model,
          hasSmtpUser: !!savedSettings.smtp_user
        });
        setSettings(savedSettings);
      } else {
        console.log('ℹ️ No saved settings found, using defaults');
        // Set default values if no settings exist
        setSettings({
          openrouter_api_key: '',
          openrouter_model: 'deepseek/deepseek-r1-0528-qwen3-8b',
          smtp_host: 'smtp.gmail.com',
          smtp_port: 587,
          smtp_user: '',
          smtp_password: '',
          from_email: '',
          from_name: 'SEO Content Generator',
          google_client_email: '',
          google_private_key: '',
          google_project_id: '',
        });
      }
    } catch (error) {
      console.error('❌ Error loading settings:', error);
      setMessage({
        type: 'error',
        text: 'ไม่สามารถโหลดการตั้งค่าได้'
      });
    } finally {
      setIsLoadingSettings(false);
    }
  };

  const handleSave = async () => {
    setIsLoading(true);
    setMessage(null);

    try {
      // Validate required fields
      if (!settings.openrouter_api_key || !settings.smtp_user || !settings.smtp_password || !settings.from_email) {
        setMessage({
          type: 'error',
          text: 'กรุณากรอกข้อมูลที่จำเป็นให้ครบถ้วน (OpenRouter API Key, SMTP User, SMTP Password, From Email)'
        });
        return;
      }

      await indexedDBService.saveSettings(settings as Omit<AppSettings, 'id'>);
      setMessage({
        type: 'success',
        text: 'บันทึกการตั้งค่าเรียบร้อยแล้ว!'
      });
    } catch (error) {
      setMessage({
        type: 'error',
        text: `เกิดข้อผิดพลาดในการบันทึก: ${error instanceof Error ? error.message : 'Unknown error'}`
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleExport = async () => {
    try {
      const exportData = await indexedDBService.exportSettings();
      const blob = new Blob([exportData], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `seo-generator-settings-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      setMessage({
        type: 'success',
        text: 'ส่งออกการตั้งค่าเรียบร้อยแล้ว!'
      });
    } catch (error) {
      setMessage({
        type: 'error',
        text: `เกิดข้อผิดพลาดในการส่งออก: ${error instanceof Error ? error.message : 'Unknown error'}`
      });
    }
  };

  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      await indexedDBService.importSettings(text);
      await loadSettings(); // Reload settings
      
      setMessage({
        type: 'success',
        text: 'นำเข้าการตั้งค่าเรียบร้อยแล้ว!'
      });
    } catch (error) {
      setMessage({
        type: 'error',
        text: `เกิดข้อผิดพลาดในการนำเข้า: ${error instanceof Error ? error.message : 'Unknown error'}`
      });
    }

    // Clear file input
    event.target.value = '';
  };

  const updateSettings = (field: keyof AppSettings, value: string | number) => {
    setSettings(prev => ({ ...prev, [field]: value }));
  };

  // Test functions
  const testOpenRouter = async () => {
    if (!settings.openrouter_api_key) {
      setMessage({
        type: 'error',
        text: 'กรุณาใส่ OpenRouter API Key ก่อนทดสอบ'
      });
      return;
    }

    setTestingStates(prev => ({ ...prev, openrouter: true }));
    setMessage(null);

    try {
      const response = await fetch('/api/test-openrouter', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          api_key: settings.openrouter_api_key,
          model: settings.openrouter_model
        }),
      });

      const result = await response.json();

      if (result.success) {
        setMessage({
          type: 'success',
          text: '✅ OpenRouter API ทำงานปกติ!'
        });
      } else {
        setMessage({
          type: 'error',
          text: `❌ OpenRouter API ผิดพลาด: ${result.message}`
        });
      }
    } catch (error) {
      setMessage({
        type: 'error',
        text: `❌ เกิดข้อผิดพลาดในการทดสอบ OpenRouter: ${error instanceof Error ? error.message : 'Unknown error'}`
      });
    } finally {
      setTestingStates(prev => ({ ...prev, openrouter: false }));
    }
  };

  const testEmail = async () => {
    if (!settings.smtp_user || !settings.smtp_password || !settings.from_email) {
      setMessage({
        type: 'error',
        text: 'กรุณาใส่ข้อมูล Email Configuration ให้ครบก่อนทดสอบ'
      });
      return;
    }

    setTestingStates(prev => ({ ...prev, email: true }));
    setMessage(null);

    try {
      const response = await fetch('/api/test-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          smtp_host: settings.smtp_host,
          smtp_port: settings.smtp_port,
          smtp_user: settings.smtp_user,
          smtp_password: settings.smtp_password,
          from_email: settings.from_email,
          from_name: settings.from_name,
          test_email: settings.smtp_user // Send test email to same address
        }),
      });

      const result = await response.json();

      if (result.success) {
        setMessage({
          type: 'success',
          text: '✅ อีเมลส่งได้สำเร็จ! ตรวจสอบกล่องจดหมายของคุณ'
        });
      } else {
        setMessage({
          type: 'error',
          text: `❌ ส่งอีเมลไม่ได้: ${result.message}`
        });
      }
    } catch (error) {
      setMessage({
        type: 'error',
        text: `❌ เกิดข้อผิดพลาดในการทดสอบอีเมล: ${error instanceof Error ? error.message : 'Unknown error'}`
      });
    } finally {
      setTestingStates(prev => ({ ...prev, email: false }));
    }
  };

  const testGoogleApis = async () => {
    if (!settings.google_client_email || !settings.google_private_key || !settings.google_project_id) {
      setMessage({
        type: 'error',
        text: 'กรุณาใส่ข้อมูล Google APIs ให้ครบก่อนทดสอบ'
      });
      return;
    }

    setTestingStates(prev => ({ ...prev, google: true }));
    setMessage(null);

    try {
      const response = await fetch('/api/test-google-apis', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          google_client_email: settings.google_client_email,
          google_private_key: settings.google_private_key,
          google_project_id: settings.google_project_id
        }),
      });

      const result = await response.json();

      if (result.success) {
        setMessage({
          type: 'success',
          text: '✅ Google APIs ทำงานปกติ!'
        });
      } else {
        setMessage({
          type: 'error',
          text: `❌ Google APIs ผิดพลาด: ${result.message}`
        });
      }
    } catch (error) {
      setMessage({
        type: 'error',
        text: `❌ เกิดข้อผิดพลาดในการทดสอบ Google APIs: ${error instanceof Error ? error.message : 'Unknown error'}`
      });
    } finally {
      setTestingStates(prev => ({ ...prev, google: false }));
    }
  };

  const fillDefaultSettings = () => {
    setSettings({
      openrouter_api_key: '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',
      openrouter_model: 'deepseek/deepseek-r1-0528-qwen3-8b',
      smtp_host: 'smtp.gmail.com',
      smtp_port: 587,
      smtp_user: '',
      smtp_password: '',
      from_email: '',
      from_name: 'SEO Content Generator',
      google_client_email: '',
      google_private_key: '',
      google_project_id: '',
    });
    
    setMessage({
      type: 'info',
      text: '✅ เติมค่าเริ่มต้นเรียบร้อยแล้ว! OpenRouter API Key พร้อมใช้งาน กรุณากรอกข้อมูลอีเมลของคุณเอง แล้วบันทึกการตั้งค่า'
    });
  };

  const openRouterModels = [
    'deepseek/deepseek-r1-0528-qwen3-8b',
    'openai/gpt-4o-mini',
    'openai/gpt-4o',
    'anthropic/claude-3.5-sonnet',
    'google/gemini-pro',
    'meta-llama/llama-3.1-8b-instruct',
  ];

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 space-y-6 sm:space-y-8 pb-20 sm:pb-6">
      <div className="text-center">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">ตั้งค่าระบบ</h1>
        <p className="text-gray-600">จัดการการตั้งค่าสำหรับ SEO Content Generator</p>
      </div>

      {message && (
        <div className={`p-4 rounded-lg flex items-start gap-3 ${
          message.type === 'success' 
            ? 'bg-green-50 border border-green-200' 
            : message.type === 'error'
            ? 'bg-red-50 border border-red-200'
            : 'bg-blue-50 border border-blue-200'
        }`}>
          {message.type === 'success' ? (
            <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
          ) : message.type === 'error' ? (
            <XCircle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
          ) : (
            <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
          )}
          <p className={`text-sm ${
            message.type === 'success' ? 'text-green-700' : 
            message.type === 'error' ? 'text-red-700' : 'text-blue-700'
          }`}>
            {message.text}
          </p>
        </div>
      )}

      {isLoadingSettings ? (
        <div className="text-center py-12">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-blue-600 mb-4" />
          <p className="text-gray-600">กำลังโหลดการตั้งค่า...</p>
        </div>
      ) : (
        <div className="space-y-6 sm:space-y-8">
          {/* Important Notice */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-blue-700">
                <p className="font-medium mb-1">📝 สำคัญ: การตั้งค่าสำหรับ Production</p>
                <p>ระบบจะใช้การตั้งค่าจากหน้านี้เป็นหลัก หากไม่มีการตั้งค่าจะไม่สามารถสร้างเนื้อหา SEO ได้</p>
                <p className="mt-2">✅ <strong>ขั้นตอนการใช้งาน:</strong></p>
                <ol className="list-decimal list-inside mt-1 space-y-1">
                  <li>กรอก OpenRouter API Key (จำเป็น)</li>
                  <li>กรอกข้อมูล Email Configuration (จำเป็น)</li>
                  <li>กดปุ่ม "บันทึกการตั้งค่า"</li>
                  <li>ทดสอบแต่ละส่วนด้วยปุ่ม "ทดสอบ"</li>
                </ol>
              </div>
            </div>
          </div>

          {/* OpenRouter API Section */}
          <div className="bg-white rounded-lg border p-4 sm:p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <Key className="h-6 w-6 text-blue-600" />
                <h2 className="text-lg sm:text-xl font-semibold text-gray-900">
                  OpenRouter API <span className="text-red-500">*จำเป็น</span>
                </h2>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={testOpenRouter}
                disabled={testingStates.openrouter}
                className="flex items-center gap-2"
              >
                {testingStates.openrouter ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <TestTube className="h-4 w-4" />
                )}
                ทดสอบ
              </Button>
            </div>
            
            <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm text-yellow-800">
                <strong>🔑 วิธีรับ OpenRouter API Key:</strong><br />
                1. ไปที่ <a href="https://openrouter.ai" target="_blank" className="text-blue-600 hover:underline">OpenRouter.ai</a><br />
                2. สมัครสมาชิกหรือเข้าสู่ระบบ<br />
                3. ไปที่ หน้า API Keys<br />
                4. สร้าง API Key ใหม่<br />
                5. คัดลอกมาใส่ในช่องด้านล่าง<br /><br />
                <strong className="text-red-700">⚠️ สำคัญ:</strong> ต้องใช้ API Key ของคุณเอง ห้ามใช้ demo key หรือ key ของคนอื่น!
              </p>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  API Key <span className="text-red-500">*</span>
                </label>
                <Input
                  type="password"
                  placeholder="sk-or-v1-..."
                  value={settings.openrouter_api_key}
                  onChange={(e) => updateSettings('openrouter_api_key', e.target.value)}
                />
                <p className="mt-1 text-xs text-gray-500">
                  API Key ต้องขึ้นต้นด้วย "sk-or-v1-"
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Model
                </label>
                <select
                  value={settings.openrouter_model}
                  onChange={(e) => updateSettings('openrouter_model', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {openRouterModels.map((model) => (
                    <option key={model} value={model}>
                      {model}
                    </option>
                  ))}
                </select>
                <p className="mt-1 text-xs text-gray-500">
                  แนะนำ: deepseek/deepseek-r1-0528-qwen3-8b (ราคาถูก, คุณภาพดี)
                </p>
              </div>
            </div>
          </div>

          {/* Email Configuration Section */}
          <div className="bg-white rounded-lg border p-4 sm:p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <Mail className="h-6 w-6 text-green-600" />
                <h2 className="text-lg sm:text-xl font-semibold text-gray-900">
                  Email Configuration <span className="text-red-500">*จำเป็น</span>
                </h2>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={testEmail}
                disabled={testingStates.email}
                className="flex items-center gap-2"
              >
                {testingStates.email ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <TestTube className="h-4 w-4" />
                )}
                ทดสอบ
              </Button>
            </div>

            <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-sm text-green-800">
                <strong>📧 วิธีตั้งค่า Gmail App Password:</strong><br />
                1. เปิด 2-Factor Authentication ใน Google Account<br />
                2. ไปที่ <a href="https://myaccount.google.com/apppasswords" target="_blank" className="text-blue-600 hover:underline">Google App Passwords</a><br />
                3. สร้าง App Password สำหรับ "Mail"<br />
                4. คัดลอก 16-character password มาใส่ในช่อง App Password
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  SMTP Host
                </label>
                <Input
                  value={settings.smtp_host}
                  onChange={(e) => updateSettings('smtp_host', e.target.value)}
                  placeholder="smtp.gmail.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  SMTP Port
                </label>
                <Input
                  type="number"
                  value={settings.smtp_port}
                  onChange={(e) => updateSettings('smtp_port', parseInt(e.target.value) || 587)}
                  placeholder="587"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Gmail Address <span className="text-red-500">*</span>
                </label>
                <Input
                  type="email"
                  value={settings.smtp_user}
                  onChange={(e) => updateSettings('smtp_user', e.target.value)}
                  placeholder="your-email@gmail.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  App Password <span className="text-red-500">*</span>
                </label>
                <Input
                  type="password"
                  value={settings.smtp_password}
                  onChange={(e) => updateSettings('smtp_password', e.target.value)}
                  placeholder="16-character app password"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  From Email <span className="text-red-500">*</span>
                </label>
                <Input
                  type="email"
                  value={settings.from_email}
                  onChange={(e) => updateSettings('from_email', e.target.value)}
                  placeholder="sender@gmail.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  From Name
                </label>
                <Input
                  value={settings.from_name}
                  onChange={(e) => updateSettings('from_name', e.target.value)}
                  placeholder="SEO Content Generator"
                />
              </div>
            </div>
          </div>

          {/* Google APIs Section */}
          <div className="bg-white rounded-lg border p-4 sm:p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <Cloud className="h-6 w-6 text-orange-600" />
                <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Google APIs</h2>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={testGoogleApis}
                disabled={testingStates.google}
                className="flex items-center gap-2"
              >
                {testingStates.google ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <TestTube className="h-4 w-4" />
                )}
                ทดสอบ
              </Button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Google Client Email
                </label>
                <Input
                  value={settings.google_client_email}
                  onChange={(e) => updateSettings('google_client_email', e.target.value)}
                  placeholder="service-account@project.iam.gserviceaccount.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Google Private Key
                </label>
                <Textarea
                  value={settings.google_private_key}
                  onChange={(e) => updateSettings('google_private_key', e.target.value)}
                  placeholder="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----"
                  rows={4}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Google Project ID
                </label>
                <Input
                  value={settings.google_project_id}
                  onChange={(e) => updateSettings('google_project_id', e.target.value)}
                  placeholder="your-project-id"
                />
              </div>
            </div>

            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded">
              <p className="text-sm text-blue-800">
                <strong>หมายเหตุ:</strong> Google APIs เป็นทางเลือก สำหรับสร้าง Google Docs และ PDF หากไม่ตั้งค่า ระบบจะส่งไฟล์ text และ HTML แทน
              </p>
            </div>

            <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded">
              <h4 className="text-sm font-semibold text-yellow-800 mb-2">📋 วิธีตั้งค่า Google APIs:</h4>
              <ol className="text-sm text-yellow-700 space-y-1 list-decimal list-inside">
                <li>ไปที่ <a href={`https://console.cloud.google.com/apis/library?project=${settings.google_project_id}`} target="_blank" className="text-blue-600 hover:underline">Google Cloud Console</a></li>
                <li>เลือก Project: <code className="bg-yellow-100 px-1 rounded">{settings.google_project_id}</code></li>
                <li>ไปที่ "APIs & Services" → "Library"</li>
                <li>เปิดใช้งาน "Google Docs API"</li>
                <li>เปิดใช้งาน "Google Drive API"</li>
                <li>ตรวจสอบ Service Account มี Role Editor หรือ Owner</li>
              </ol>
            </div>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-4 justify-center pt-6">
        <Button
          onClick={handleSave}
          disabled={isLoading}
          className="flex items-center gap-2"
        >
          <Save className="h-4 w-4" />
          {isLoading ? 'กำลังบันทึก...' : 'บันทึกการตั้งค่า'}
        </Button>

        <Button
          variant="outline"
          onClick={handleExport}
          className="flex items-center gap-2"
        >
          <Download className="h-4 w-4" />
          ส่งออกการตั้งค่า
        </Button>

        <div className="relative">
          <input
            type="file"
            accept=".json"
            onChange={handleImport}
            className="absolute inset-0 opacity-0 cursor-pointer"
          />
          <Button
            variant="outline"
            className="flex items-center gap-2 pointer-events-none"
          >
            <Upload className="h-4 w-4" />
            นำเข้าการตั้งค่า
          </Button>
        </div>

        <Button
          variant="outline"
          onClick={fillDefaultSettings}
          className="flex items-center gap-2"
        >
          <Save className="h-4 w-4" />
          เติมข้อมูลเริ่มต้น
        </Button>
      </div>
    </div>
  );
} 