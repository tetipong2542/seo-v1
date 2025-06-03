'use client';

import { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { Button } from './button';
import { Input } from './input';
import { KeywordLink } from '@/types';

interface KeywordsLinksInputProps {
  value: KeywordLink[];
  onChange: (value: KeywordLink[]) => void;
  error?: string;
}

export function KeywordsLinksInput({ value, onChange, error }: KeywordsLinksInputProps) {
  const addItem = () => {
    onChange([...value, { keyword: '', link: '', frequency: 2 }]);
  };

  const removeItem = (index: number) => {
    const newValue = value.filter((_, i) => i !== index);
    onChange(newValue);
  };

  const updateItem = (index: number, field: 'keyword' | 'link' | 'frequency', newValue: string | number) => {
    const updated = value.map((item, i) => 
      i === index ? { ...item, [field]: newValue } : item
    );
    onChange(updated);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="block text-sm font-medium text-gray-700">
          Keywords & Internal Links
        </label>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={addItem}
          className="flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          เพิ่ม
        </Button>
      </div>

      {value.length === 0 && (
        <div className="text-sm text-gray-500 bg-gray-50 p-4 rounded-lg border-2 border-dashed border-gray-300">
          <p className="text-center">ยังไม่มี Keywords & Links</p>
          <p className="text-center text-xs mt-1">คลิก "เพิ่ม" เพื่อเริ่มต้น</p>
        </div>
      )}

      <div className="space-y-3">
        {value.map((item, index) => (
          <div key={index} className="flex gap-3 items-start p-4 bg-gray-50 rounded-lg border">
            <div className="flex-1 space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Keyword
                  </label>
                  <Input
                    type="text"
                    placeholder="เช่น SEO, การทำบัญชี"
                    value={item.keyword}
                    onChange={(e) => updateItem(index, 'keyword', e.target.value)}
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    จำนวนครั้งที่ใช้
                  </label>
                  <Input
                    type="number"
                    min="1"
                    max="10"
                    placeholder="2"
                    value={item.frequency || 2}
                    onChange={(e) => updateItem(index, 'frequency', parseInt(e.target.value) || 2)}
                    className="w-full"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Internal Link
                </label>
                <Input
                  type="text"
                  placeholder="เช่น /products/seo, /services/accounting"
                  value={item.link}
                  onChange={(e) => updateItem(index, 'link', e.target.value)}
                  className="w-full"
                />
              </div>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => removeItem(index)}
              className="mt-6 text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </div>

      {error && (
        <p className="text-sm text-red-600 bg-red-50 p-2 rounded border border-red-200">
          {error}
        </p>
      )}

      <div className="text-xs text-gray-500 bg-blue-50 p-3 rounded border border-blue-200">
        <p className="font-medium text-blue-700 mb-1">💡 คำแนะนำ:</p>
        <ul className="space-y-1 text-blue-600">
          <li>• <strong>Keyword:</strong> คำสำคัญที่ต้องการใช้ในเนื้อหา</li>
          <li>• <strong>จำนวนครั้ง:</strong> ความถี่ที่ต้องการให้ keyword ปรากฏในเนื้อหา (1-10 ครั้ง)</li>
          <li>• <strong>Link:</strong> ลิงก์ภายในเว็บไซต์ที่เกี่ยวข้อง (ขึ้นต้นด้วย /)</li>
          <li>• ระบบจะสร้างเนื้อหาให้มี internal links ตามจำนวนที่กำหนด</li>
        </ul>
      </div>
    </div>
  );
} 