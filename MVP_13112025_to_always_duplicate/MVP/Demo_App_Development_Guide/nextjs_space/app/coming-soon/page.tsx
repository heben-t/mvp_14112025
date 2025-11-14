'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Sparkles, ArrowLeft, Bell, Rocket } from 'lucide-react';

export default function ComingSoonPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-blue-50">
      {/* Header */}
      <div className="container mx-auto px-4 py-6">
        <Link href="/" className="inline-flex items-center gap-2 text-2xl font-bold">
          <span className="bg-gradient-to-r from-blue-600 to-purple-600 text-transparent bg-clip-text">
            HEBED AI
          </span>
        </Link>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 flex items-center justify-center min-h-[calc(100vh-120px)]">
        <Card className="w-full max-w-2xl border-none shadow-2xl">
          <CardContent className="p-12 text-center space-y-8">
            {/* Icon */}
            <div className="mx-auto w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-3xl flex items-center justify-center">
              <Rocket className="h-12 w-12 text-white" />
            </div>

            {/* Heading */}
            <div className="space-y-3">
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900">
                Coming Soon
              </h1>
              <p className="text-xl text-gray-600">
                Public Campaigns Marketplace
              </p>
            </div>

            {/* Description */}
            <div className="space-y-4 max-w-md mx-auto">
              <p className="text-base text-gray-700">
                We're building something amazing! Our public campaigns marketplace will 
                launch soon, featuring:
              </p>
              
              <ul className="text-left space-y-2 text-gray-600">
                <li className="flex items-start gap-2">
                  <Sparkles className="h-5 w-5 text-purple-600 mt-0.5 flex-shrink-0" />
                  <span>Verified AI startups from the UAE ecosystem</span>
                </li>
                <li className="flex items-start gap-2">
                  <Sparkles className="h-5 w-5 text-purple-600 mt-0.5 flex-shrink-0" />
                  <span>Transparent ROI metrics and data-driven insights</span>
                </li>
                <li className="flex items-start gap-2">
                  <Sparkles className="h-5 w-5 text-purple-600 mt-0.5 flex-shrink-0" />
                  <span>Secure investment opportunities in early-stage AI ventures</span>
                </li>
              </ul>
            </div>

            {/* Notify Button */}
            <div className="pt-4">
              <Button
                size="lg"
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white gap-2"
                disabled
              >
                <Bell className="h-5 w-5" />
                Notify Me When Live
              </Button>
              <p className="text-xs text-gray-500 mt-2">
                We'll send you an email when the marketplace launches
              </p>
            </div>

            {/* Back Button */}
            <div className="pt-6 border-t">
              <Link href="/dashboard">
                <Button variant="outline" className="gap-2">
                  <ArrowLeft className="h-4 w-4" />
                  Back to Dashboard
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Footer Note */}
      <div className="container mx-auto px-4 pb-8 text-center">
        <p className="text-sm text-gray-500">
          In the meantime, complete your onboarding to get early access
        </p>
      </div>
    </div>
  );
}
