'use client';

import React, { ReactNode } from 'react';
import { Sidebar } from '@/app/components/Sidebar';

interface MainLayoutProps {
  children: ReactNode;
}

/**
 * MainLayout - Wraps the sidebar and main content
 * 
 * Provides a two-column layout with:
 * - Fixed sidebar on the left
 * - Responsive main content on the right
 */
export function MainLayout({ children }: MainLayoutProps) {
  return (
    <div className="flex h-screen bg-slate-50">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Inner container for scrollable content */}
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-7xl mx-auto">{children}</div>
        </main>
      </div>
    </div>
  );
}
