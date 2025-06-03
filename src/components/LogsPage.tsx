'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { indexedDBService, LogEntry } from '@/lib/indexeddb';
import { 
  Database, 
  Trash2, 
  CheckCircle, 
  XCircle, 
  Clock,
  RefreshCw,
  FileText,
  Search
} from 'lucide-react';

// Tooltip Component
const Tooltip = ({ children, content }: { children: React.ReactNode; content: string }) => {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <div 
      className="relative inline-block"
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
    >
      {children}
      {isVisible && (
        <div className="absolute z-99999 px-3 py-2 text-sm text-white bg-gray-900 rounded-lg shadow-lg whitespace-normal max-w-xs bottom-full left-1/2 transform -translate-x-1/2 mb-2">
          {content}
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
        </div>
      )}
    </div>
  );
};

export function LogsPage() {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [filteredLogs, setFilteredLogs] = useState<LogEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [message, setMessage] = useState<{
    type: 'success' | 'error' | 'info';
    text: string;
  } | null>(null);

  useEffect(() => {
    loadLogs();
  }, []);

  useEffect(() => {
    // Filter logs when search query changes
    if (searchQuery.trim() === '') {
      setFilteredLogs(logs);
    } else {
      const filtered = logs.filter(log => 
        log.website_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.page_title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.recipient_email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.model.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (log.website_url && log.website_url.toLowerCase().includes(searchQuery.toLowerCase())) ||
        log.keywords_list.some(keyword => 
          keyword.toLowerCase().includes(searchQuery.toLowerCase())
        )
      );
      setFilteredLogs(filtered);
    }
  }, [searchQuery, logs]);

  const loadLogs = async () => {
    setIsLoading(true);
    try {
      const fetchedLogs = await indexedDBService.getLogs(100);
      setLogs(fetchedLogs);
      setFilteredLogs(fetchedLogs);
    } catch (error) {
      setMessage({
        type: 'error',
        text: `เกิดข้อผิดพลาดในการโหลดข้อมูล: ${error instanceof Error ? error.message : 'Unknown error'}`
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = async () => {
    setIsSearching(true);
    // Add small delay for better UX
    setTimeout(() => {
      setIsSearching(false);
    }, 300);
  };

  const handleClearLogs = async () => {
    if (!window.confirm('คุณต้องการลบประวัติทั้งหมดหรือไม่?')) {
      return;
    }

    try {
      await indexedDBService.clearLogs();
      setLogs([]);
      setFilteredLogs([]);
      setMessage({
        type: 'success',
        text: 'ลบประวัติทั้งหมดเรียบร้อยแล้ว!'
      });
    } catch (error) {
      setMessage({
        type: 'error',
        text: `เกิดข้อผิดพลาดในการลบข้อมูล: ${error instanceof Error ? error.message : 'Unknown error'}`
      });
    }
  };

  const truncateText = (text: string, maxLength: number = 50) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('th-TH', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(date));
  };

  const getStatusIcon = (status: 'success' | 'error') => {
    if (status === 'success') {
      return <CheckCircle className="h-5 w-5 text-green-600" />;
    }
    return <XCircle className="h-5 w-5 text-red-600" />;
  };

  const getStatusBadge = (status: 'success' | 'error') => {
    if (status === 'success') {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
          <CheckCircle className="h-3 w-3" />
          สำเร็จ
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
        <XCircle className="h-3 w-3" />
        ล้มเหลว
      </span>
    );
  };

  const getModelDisplayName = (model: string) => {
    const modelMap: Record<string, string> = {
      'deepseek/deepseek-r1-0528-qwen3-8b': 'DeepSeek R1',
      'openai/gpt-4o-mini': 'GPT-4o Mini',
      'openai/gpt-4o': 'GPT-4o',
      'anthropic/claude-3.5-sonnet': 'Claude 3.5 Sonnet',
    };
    return modelMap[model] || model.split('/')[1] || model;
  };

  const formatKeywordsList = (keywords: string[]) => {
    if (!keywords || keywords.length === 0) return 'ไม่มี Keywords';
    return keywords.join(', ');
  };

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 space-y-4 sm:space-y-6 pb-20 sm:pb-6">
      <div className="flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">ประวัติการสร้างเนื้อหา</h1>
            <p className="text-gray-600">ดูประวัติการสร้างเนื้อหา SEO ทั้งหมด</p>
          </div>

          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={loadLogs}
              disabled={isLoading}
              className="flex items-center gap-2"
              size="sm"
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
              รีเฟรช
            </Button>

            <Button
              variant="outline"
              onClick={handleClearLogs}
              disabled={filteredLogs.length === 0}
              className="flex items-center gap-2 text-red-600 hover:text-red-700"
              size="sm"
            >
              <Trash2 className="h-4 w-4" />
              ลบทั้งหมด
            </Button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Input
              type="text"
              placeholder="ค้นหาตามชื่อเว็บไซต์, หัวข้อ, อีเมล, model หรือ keywords..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          </div>
          <Button
            onClick={handleSearch}
            disabled={isSearching}
            className="flex items-center gap-2"
            size="sm"
          >
            {isSearching ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : (
              <Search className="h-4 w-4" />
            )}
            ค้นหา
          </Button>
        </div>

        {/* Search Results Info */}
        {searchQuery && (
          <div className="text-sm text-gray-600">
            พบ {filteredLogs.length} รายการจากการค้นหา "{searchQuery}"
            {filteredLogs.length !== logs.length && (
              <button
                onClick={() => setSearchQuery('')}
                className="ml-2 text-blue-600 hover:text-blue-800 underline"
              >
                ล้างการค้นหา
              </button>
            )}
          </div>
        )}
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
            <Database className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
          )}
          <p className={`text-sm ${
            message.type === 'success' ? 'text-green-700' : 
            message.type === 'error' ? 'text-red-700' : 'text-blue-700'
          }`}>
            {message.text}
          </p>
        </div>
      )}

      <div className="bg-white rounded-lg border shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center">
            <RefreshCw className="h-8 w-8 animate-spin text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">กำลังโหลดข้อมูล...</p>
          </div>
        ) : filteredLogs.length === 0 ? (
          <div className="p-8 text-center">
            <FileText className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {searchQuery ? 'ไม่พบข้อมูลที่ค้นหา' : 'ยังไม่มีประวัติ'}
            </h3>
            <p className="text-gray-500">
              {searchQuery 
                ? 'ลองใช้คำค้นหาอื่น หรือล้างการค้นหาเพื่อดูข้อมูลทั้งหมด'
                : 'เมื่อมีการสร้างเนื้อหา SEO ประวัติจะแสดงที่นี่'
              }
            </p>
          </div>
        ) : (
          <>
            {/* Desktop Table View */}
            <div className="hidden lg:block">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-20">
                        สถานะ
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-52">
                        เว็บไซต์
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-60">
                        หัวข้อ
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-32">
                        Keywords
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-24">
                        ความยาว
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-32">
                        Model
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-52">
                        อีเมลผู้รับ
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-40">
                        วันที่สร้าง
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredLogs.map((log, index) => (
                      <tr key={log.id || index} className="hover:bg-gray-50">
                        <td className="px-4 py-4 whitespace-nowrap">
                          {getStatusBadge(log.status)}
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex flex-col">
                            <Tooltip content={log.website_name}>
                              <div className="text-sm font-medium text-gray-900 cursor-help">
                                {truncateText(log.website_name, 20)}
                              </div>
                            </Tooltip>
                            {log.website_url && (
                              <Tooltip content={log.website_url}>
                                <div className="text-xs text-gray-500 cursor-help">
                                  {truncateText(log.website_url, 25)}
                                </div>
                              </Tooltip>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <Tooltip content={log.page_title}>
                            <div className="text-sm text-gray-900 cursor-help">
                              {truncateText(log.page_title, 30)}
                            </div>
                          </Tooltip>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <Tooltip content={`Keywords: ${formatKeywordsList(log.keywords_list || [])}`}>
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 cursor-help">
                              {log.keywords_count} คำ
                            </span>
                          </Tooltip>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <Tooltip content={
                            log.content_length === 'short' ? 'เนื้อหาสั้น (800-1,200 คำ)' :
                            log.content_length === 'medium' ? 'เนื้อหาปานกลาง (1,500-2,000 คำ)' :
                            'เนื้อหายาว (2,500-3,500 คำ)'
                          }>
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium cursor-help ${
                              log.content_length === 'short' ? 'bg-yellow-100 text-yellow-800' :
                              log.content_length === 'medium' ? 'bg-green-100 text-green-800' :
                              'bg-purple-100 text-purple-800'
                            }`}>
                              {log.content_length === 'short' ? 'สั้น' :
                               log.content_length === 'medium' ? 'ปานกลาง' : 'ยาว'}
                            </span>
                          </Tooltip>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <Tooltip content={log.model || 'ไม่ระบุ Model'}>
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800 cursor-help">
                              {getModelDisplayName(log.model || '')}
                            </span>
                          </Tooltip>
                        </td>
                        <td className="px-4 py-4">
                          <Tooltip content={log.recipient_email}>
                            <div className="text-sm text-gray-900 cursor-help">
                              {truncateText(log.recipient_email, 25)}
                            </div>
                          </Tooltip>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <Tooltip content={`สร้างเมื่อ ${formatDate(log.created_at)}`}>
                            <div className="flex items-center text-sm text-gray-500 cursor-help">
                              <Clock className="h-4 w-4 mr-1" />
                              {formatDate(log.created_at)}
                            </div>
                          </Tooltip>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Tablet Card View */}
            <div className="hidden md:block lg:hidden divide-y divide-gray-200">
              {filteredLogs.map((log, index) => (
                <div key={log.id || index} className="p-4 space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        {getStatusBadge(log.status)}
                        <Tooltip content={
                          log.content_length === 'short' ? 'เนื้อหาสั้น (800-1,200 คำ)' :
                          log.content_length === 'medium' ? 'เนื้อหาปานกลาง (1,500-2,000 คำ)' :
                          'เนื้อหายาว (2,500-3,500 คำ)'
                        }>
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium cursor-help ${
                            log.content_length === 'short' ? 'bg-yellow-100 text-yellow-800' :
                            log.content_length === 'medium' ? 'bg-green-100 text-green-800' :
                            'bg-purple-100 text-purple-800'
                          }`}>
                            {log.content_length === 'short' ? 'สั้น' :
                             log.content_length === 'medium' ? 'ปานกลาง' : 'ยาว'}
                          </span>
                        </Tooltip>
                        <Tooltip content={log.model || 'ไม่ระบุ Model'}>
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800 cursor-help">
                            {getModelDisplayName(log.model || '')}
                          </span>
                        </Tooltip>
                      </div>
                      <Tooltip content={log.website_name}>
                        <h3 className="font-medium text-gray-900 text-sm cursor-help">
                          {log.website_name}
                        </h3>
                      </Tooltip>
                      {log.website_url && (
                        <Tooltip content={log.website_url}>
                          <p className="text-xs text-gray-500 truncate cursor-help">
                            {log.website_url}
                          </p>
                        </Tooltip>
                      )}
                    </div>
                    <Tooltip content={`Keywords: ${formatKeywordsList(log.keywords_list || [])}`}>
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 ml-2 cursor-help">
                        {log.keywords_count} คำ
                      </span>
                    </Tooltip>
                  </div>
                  
                  <div>
                    <Tooltip content={log.page_title}>
                      <p className="text-sm text-gray-900 font-medium cursor-help">
                        {log.page_title}
                      </p>
                    </Tooltip>
                    <Tooltip content={log.recipient_email}>
                      <p className="text-xs text-gray-500 mt-1 cursor-help">
                        ส่งไปยัง: {log.recipient_email}
                      </p>
                    </Tooltip>
                  </div>
                  
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <Tooltip content={`สร้างเมื่อ ${formatDate(log.created_at)}`}>
                      <div className="flex items-center cursor-help">
                        <Clock className="h-3 w-3 mr-1" />
                        {formatDate(log.created_at)}
                      </div>
                    </Tooltip>
                  </div>
                </div>
              ))}
            </div>

            {/* Mobile Card View */}
            <div className="md:hidden divide-y divide-gray-200">
              {filteredLogs.map((log, index) => (
                <div key={log.id || index} className="p-4 space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-1 mb-1 flex-wrap">
                        {getStatusBadge(log.status)}
                        <Tooltip content={
                          log.content_length === 'short' ? 'เนื้อหาสั้น (800-1,200 คำ)' :
                          log.content_length === 'medium' ? 'เนื้อหาปานกลาง (1,500-2,000 คำ)' :
                          'เนื้อหายาว (2,500-3,500 คำ)'
                        }>
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium cursor-help ${
                            log.content_length === 'short' ? 'bg-yellow-100 text-yellow-800' :
                            log.content_length === 'medium' ? 'bg-green-100 text-green-800' :
                            'bg-purple-100 text-purple-800'
                          }`}>
                            {log.content_length === 'short' ? 'สั้น' :
                             log.content_length === 'medium' ? 'ปานกลาง' : 'ยาว'}
                          </span>
                        </Tooltip>
                      </div>
                      <div className="flex items-center gap-1 mb-2 flex-wrap">
                        <Tooltip content={log.model || 'ไม่ระบุ Model'}>
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800 cursor-help">
                            {getModelDisplayName(log.model || '')}
                          </span>
                        </Tooltip>
                        <Tooltip content={`Keywords: ${formatKeywordsList(log.keywords_list || [])}`}>
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 cursor-help">
                            {log.keywords_count} คำ
                          </span>
                        </Tooltip>
                      </div>
                      <Tooltip content={log.website_name}>
                        <h3 className="font-medium text-gray-900 text-sm cursor-help">
                          {log.website_name}
                        </h3>
                      </Tooltip>
                      {log.website_url && (
                        <Tooltip content={log.website_url}>
                          <p className="text-xs text-gray-500 truncate cursor-help">
                            {log.website_url}
                          </p>
                        </Tooltip>
                      )}
                    </div>
                  </div>
                  
                  <div>
                    <Tooltip content={log.page_title}>
                      <p className="text-sm text-gray-900 font-medium cursor-help">
                        {log.page_title}
                      </p>
                    </Tooltip>
                    <Tooltip content={log.recipient_email}>
                      <p className="text-xs text-gray-500 mt-1 cursor-help">
                        ส่งไปยัง: {log.recipient_email}
                      </p>
                    </Tooltip>
                  </div>
                  
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <Tooltip content={`สร้างเมื่อ ${formatDate(log.created_at)}`}>
                      <div className="flex items-center cursor-help">
                        <Clock className="h-3 w-3 mr-1" />
                        {formatDate(log.created_at)}
                      </div>
                    </Tooltip>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {!isLoading && filteredLogs.length > 0 && (
          <div className="px-4 sm:px-6 py-3 bg-gray-50 border-t">
            <p className="text-sm text-gray-500">
              แสดง {filteredLogs.length} รายการ{logs.length !== filteredLogs.length && ` (กรองจาก ${logs.length} รายการ)`} (เรียงตามวันที่ล่าสุด)
            </p>
          </div>
        )}
      </div>
    </div>
  );
} 