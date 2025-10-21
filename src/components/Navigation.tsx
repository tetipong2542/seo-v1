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
      <div className="hidden sm:block bg-white/80 backdrop-blur-lg shadow-sm border-b border-gray-100/50 sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-6">
          <div className="flex items-center justify-between py-5 bg-white/60 rounded-2xl shadow-sm border border-gray-100/50 px-8 my-3">
            <div className="flex items-center space-x-3 group">
              <div className="p-2 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-sm group-hover:shadow-md transition-all duration-200">
                <FileText className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                  ระบบ SEO Automate
                </h1>
                <p className="text-xs text-gray-500 mt-0.5">สร้างเนื้อหา SEO คุณภาพสูงอัตโนมัติ</p>
              </div>
            </div>

            <nav className="flex space-x-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = currentPage === item.id;

                return (
                  <Button
                    key={item.id}
                    variant={isActive ? "default" : "ghost"}
                    onClick={() => onPageChange(item.id)}
                    className={`flex items-center gap-2 px-5 py-2.5 rounded-xl transition-all duration-200 ${
                      isActive
                        ? 'shadow-sm'
                        : 'hover:bg-gray-50/80'
                    }`}
                    title={item.description}
                  >
                    <Icon className="h-4 w-4" />
                    <span className="font-medium">{item.label}</span>
                  </Button>
                );
              })}
            </nav>
          </div>
        </div>
      </div>

      {/* Mobile Header - Simple brand only */}
      <div className="sm:hidden bg-white/90 backdrop-blur-lg shadow-sm border-b border-gray-100/50 sticky top-0 z-50">
        <div className="px-4 py-3">
          <div className="flex items-center justify-center space-x-2.5 bg-white/60 rounded-2xl shadow-sm border border-gray-100/50 py-3 mx-2">
            <div className="p-1.5 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow-sm">
              <FileText className="h-5 w-5 text-white" />
            </div>
            <h1 className="text-lg font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
              SEO OnPage Automate
            </h1>
          </div>
        </div>
      </div>

      {/* Mobile Bottom Navigation - Sticky */}
      <div className="sm:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-lg border-t border-gray-100 shadow-2xl z-50 rounded-t-3xl">
        <nav className="flex safe-bottom">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPage === item.id;

            return (
              <button
                key={item.id}
                onClick={() => onPageChange(item.id)}
                className={`flex-1 flex flex-col items-center justify-center py-3.5 px-2 text-xs font-medium transition-all duration-200 relative ${
                  isActive
                    ? 'text-blue-600'
                    : 'text-gray-500 hover:text-gray-700 active:scale-95'
                }`}
                title={item.description}
              >
                {isActive && (
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-12 h-1 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full" />
                )}
                <Icon className={`h-6 w-6 mb-1.5 transition-colors ${isActive ? 'text-blue-600' : 'text-gray-400'}`} />
                <span className={`${isActive ? 'text-blue-600 font-semibold' : 'text-gray-600'}`}>
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