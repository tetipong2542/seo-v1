'use client';

import { useState } from 'react';
import { SEOForm } from '@/components/SEOForm';
import { Navigation } from '@/components/Navigation';
import { SettingsPage } from '@/components/SettingsPage';
import { LogsPage } from '@/components/LogsPage';

export default function Home() {
  const [currentPage, setCurrentPage] = useState<'home' | 'settings' | 'logs'>('home');

  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'settings':
        return <SettingsPage />;
      case 'logs':
        return <LogsPage />;
      default:
        return (
          <div className="min-h-screen bg-gray-50 py-4 sm:py-8 pb-20 sm:pb-8">
            <SEOForm />
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation currentPage={currentPage} onPageChange={setCurrentPage} />
      <div className="pb-16 sm:pb-0">
        {renderCurrentPage()}
      </div>
    </div>
  );
}
