'use client';

import { useState } from 'react';
import { Settings, FileText, Home, Database } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface NavigationProps {
  currentPage: 'home' | 'settings' | 'logs';
  onPageChange: (page: 'home' | 'settings' | 'logs') => void;
}

export function Navigation({ currentPage, onPageChange }: NavigationProps) {
  const navItems = [
    {
      id: 'home' as const,
      label: 'สร้างเนื้อหา',
      shortLabel: 'หน้าหลัก',
      icon: Home,
      description: 'สร้างเนื้อหา SEO คุณภาพสูง'
    },
    {
      id: 'settings' as const,
      label: 'ตั้งค่า',
      shortLabel: 'ตั้งค่า',
      icon: Settings,
      description: 'จัดการการตั้งค่าระบบ'
    },
    {
      id: 'logs' as const,
      label: 'ประวัติ',
      shortLabel: 'ประวัติ',
      icon: Database,
      description: 'ดูประวัติการสร้างเนื้อหา'
    }
  ];

  return (
    <>
      {/* Desktop Header - Hidden on mobile */}
      <div className="hidden sm:block bg-white shadow-sm border-b">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center space-x-2">
              <FileText className="h-8 w-8 text-blue-600" />
              <h1 className="text-2xl font-bold text-gray-900">ระบบ SEO Automate</h1>
            </div>

            <nav className="flex space-x-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = currentPage === item.id;

                return (
                  <Button
                    key={item.id}
                    variant={isActive ? "default" : "ghost"}
                    onClick={() => onPageChange(item.id)}
                    className="flex items-center gap-2 px-4 py-2"
                    title={item.description}
                  >
                    <Icon className="h-4 w-4" />
                    {item.label}
                  </Button>
                );
              })}
            </nav>
          </div>
        </div>
      </div>

      {/* Mobile Header - Simple brand only */}
      <div className="sm:hidden bg-white shadow-sm border-b">
        <div className="px-4 py-3">
          <div className="flex items-center justify-center space-x-2">
            <FileText className="h-6 w-6 text-blue-600" />
            <h1 className="text-xl font-bold text-gray-900">SEO OnPage Automate</h1>
          </div>
        </div>
      </div>

      {/* Mobile Bottom Navigation - Sticky */}
      <div className="sm:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-50">
        <nav className="flex">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPage === item.id;

            return (
              <button
                key={item.id}
                onClick={() => onPageChange(item.id)}
                className={`flex-1 flex flex-col items-center justify-center py-3 px-2 text-xs font-medium transition-colors ${
                  isActive
                    ? 'text-blue-600 bg-blue-50'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
                title={item.description}
              >
                <Icon className={`h-6 w-6 mb-1 ${isActive ? 'text-blue-600' : 'text-gray-400'}`} />
                <span className={isActive ? 'text-blue-600' : 'text-gray-600'}>
                  {item.shortLabel}
                </span>
              </button>
            );
          })}
        </nav>
      </div>
    </>
  );
} 