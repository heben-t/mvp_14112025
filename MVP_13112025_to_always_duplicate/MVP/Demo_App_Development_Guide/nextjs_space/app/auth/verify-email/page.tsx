'use client';

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Mail, ArrowRight } from 'lucide-react';

export default function VerifyEmailPage() {
  const searchParams = useSearchParams();
  const email = searchParams.get('email');

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
        <Card className="w-full max-w-md border-none shadow-2xl">
          <CardHeader className="space-y-3 text-center pb-6">
            <div className="mx-auto w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mb-2">
              <Mail className="h-8 w-8 text-white" />
            </div>
            <CardTitle className="text-3xl font-bold text-gray-900">
              Check Your Email
            </CardTitle>
            <CardDescription className="text-base">
              We've sent a verification link to
            </CardDescription>
            {email && (
              <p className="text-lg font-semibold text-blue-600">{email}</p>
            )}
          </CardHeader>

          <CardContent className="space-y-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-gray-700 text-center">
                Click the link in the email to verify your account and complete your registration.
              </p>
            </div>

            <div className="space-y-3">
              <p className="text-sm text-gray-600 text-center">
                Didn't receive the email?
              </p>
              <ul className="text-sm text-gray-600 space-y-2 list-disc list-inside">
                <li>Check your spam or junk folder</li>
                <li>Make sure you entered the correct email address</li>
                <li>Wait a few minutes and check again</li>
              </ul>
            </div>

            <div className="pt-4 border-t">
              <Link href="/auth/signin">
                <Button className="w-full h-11 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white group">
                  Back to Sign In
                  <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
