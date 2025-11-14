'use client';

import { Navigation, Footer } from '@/components/homepage';
import { ReactNode } from 'react';

interface LegalLayoutProps {
  children: ReactNode;
  title: string;
  lastUpdated: string;
  icon: ReactNode;
}

export function LegalLayout({ children, title, lastUpdated, icon }: LegalLayoutProps) {
  return (
    <>
      <Navigation />
      
      <div className="min-h-screen bg-white">
        {/* Hero Section */}
        <section className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-purple-600 to-blue-700 py-16">
          <div className="absolute inset-0 bg-grid-white/10 [mask-image:linear-gradient(0deg,transparent,black)] pointer-events-none" />
          
          <div className="container mx-auto px-4 relative z-10">
            <div className="max-w-4xl mx-auto text-center">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-white/20 backdrop-blur-sm border border-white/30 rounded-2xl mb-6">
                {icon}
              </div>
              
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
                {title}
              </h1>
              
              <p className="text-blue-100">
                Last updated: {lastUpdated}
              </p>
            </div>
          </div>
        </section>

        {/* Content */}
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 md:p-12">
              <div className="prose prose-lg max-w-none prose-headings:text-gray-900 prose-p:text-gray-600 prose-strong:text-gray-900 prose-ul:text-gray-600">
                {children}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <Footer />
    </>
  );
}
