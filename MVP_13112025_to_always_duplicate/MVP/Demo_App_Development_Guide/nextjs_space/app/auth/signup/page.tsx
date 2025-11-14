'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { createClient } from '@/lib/supabase-client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Sparkles, Mail, Lock, User, ArrowRight, Rocket, TrendingUp } from 'lucide-react';

export default function SignUpPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const typeParam = searchParams.get('type');
  const supabase = createClient();
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: typeParam?.toUpperCase() || 'STARTUP',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const handleEmailSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    setLoading(true);

    try {
      // Sign up with Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            name: formData.name,
            role: formData.role,
          },
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (authError) {
        setError(authError.message);
        return;
      }

      if (authData.user) {
        // Check if email confirmation is required
        if (authData.session) {
          // User is auto-confirmed, redirect to onboarding
          const onboardingPath = formData.role === 'STARTUP' 
            ? '/auth/onboarding/startup' 
            : '/auth/onboarding/investor';
          router.push(onboardingPath);
        } else {
          // Email confirmation required
          router.push('/auth/verify-email?email=' + encodeURIComponent(formData.email));
        }
      }
    } catch (err: any) {
      console.error('Sign up error:', err);
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignUp = async () => {
    setGoogleLoading(true);
    setError('');

    try {
      // Store role in session storage for callback
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('signup_role', formData.role);
      }
      
      const { data, error: oauthError } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback?role=${formData.role}`,
          queryParams: {
            access_type: 'offline',
            prompt: 'select_account',
          },
        },
      });

      if (oauthError) {
        setError(oauthError.message);
        setGoogleLoading(false);
      }
      // If successful, user will be redirected to Google
    } catch (err: any) {
      console.error('Google sign up error:', err);
      setError('Failed to sign up with Google. Please try again.');
      setGoogleLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-blue-50">
      {/* Header */}
      <div className="container mx-auto px-4 py-6">
        <Link href="/" className="inline-flex items-center">
          <Image
            src="/logo.png"
            alt="HEBED AI Logo"
            width={32}
            height={32}
            className="object-contain"
            priority
          />
        </Link>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 flex items-center justify-center min-h-[calc(100vh-120px)] py-8">
        <Card className="w-full max-w-md border-none shadow-2xl">
          <CardHeader className="space-y-3 text-center pb-6">
            <div className="mx-auto w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mb-2">
              <Sparkles className="h-8 w-8 text-white" />
            </div>
            <CardTitle className="text-3xl font-bold text-gray-900">
              Join HEBED AI
            </CardTitle>
            <CardDescription className="text-base">
              Create your account and start your journey
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Role Selection */}
            <div className="space-y-3">
              <Label className="text-gray-700 font-semibold">I am a...</Label>
              <RadioGroup
                value={formData.role}
                onValueChange={(value) => setFormData({ ...formData, role: value })}
                className="grid grid-cols-2 gap-3"
              >
                <div>
                  <RadioGroupItem value="STARTUP" id="startup" className="peer sr-only" />
                  <Label
                    htmlFor="startup"
                    className="flex flex-col items-center justify-between rounded-xl border-2 border-gray-200 bg-white p-4 hover:bg-gray-50 peer-data-[state=checked]:border-blue-600 peer-data-[state=checked]:bg-blue-50 cursor-pointer transition-all"
                  >
                    <Rocket className="mb-3 h-6 w-6 text-blue-600" />
                    <span className="text-sm font-semibold text-gray-900">Startup</span>
                    <span className="text-xs text-gray-500 text-center mt-1">Raising funds</span>
                  </Label>
                </div>
                <div>
                  <RadioGroupItem value="INVESTOR" id="investor" className="peer sr-only" />
                  <Label
                    htmlFor="investor"
                    className="flex flex-col items-center justify-between rounded-xl border-2 border-gray-200 bg-white p-4 hover:bg-gray-50 peer-data-[state=checked]:border-purple-600 peer-data-[state=checked]:bg-purple-50 cursor-pointer transition-all"
                  >
                    <TrendingUp className="mb-3 h-6 w-6 text-purple-600" />
                    <span className="text-sm font-semibold text-gray-900">Investor</span>
                    <span className="text-xs text-gray-500 text-center mt-1">Find opportunities</span>
                  </Label>
                </div>
              </RadioGroup>
            </div>

            {/* Google Sign Up */}
            <Button
              type="button"
              variant="outline"
              className="w-full h-12 text-base border-2 hover:bg-gray-50 transition-all"
              onClick={handleGoogleSignUp}
              disabled={googleLoading || loading}
            >
              {googleLoading ? (
                <span>Connecting to Google...</span>
              ) : (
                <>
                  <svg className="mr-2 h-5 w-5" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                  Continue with Google
                </>
              )}
            </Button>

            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="bg-white px-4 text-gray-500">Or continue with email</span>
              </div>
            </div>

            {/* Email Sign Up Form */}
            <form onSubmit={handleEmailSignUp} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-gray-700">Full Name</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <Input
                    id="name"
                    type="text"
                    placeholder="John Doe"
                    className="pl-10 h-11"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    disabled={loading}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-gray-700">Email Address</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    className="pl-10 h-11"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                    disabled={loading}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-gray-700">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    className="pl-10 h-11"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    required
                    disabled={loading}
                    minLength={8}
                  />
                </div>
                <p className="text-xs text-gray-500">Must be at least 8 characters</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-gray-700">Confirm Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="••••••••"
                    className="pl-10 h-11"
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    required
                    disabled={loading}
                  />
                </div>
              </div>

              {error && (
                <Alert variant="destructive" className="bg-red-50 border-red-200">
                  <AlertDescription className="text-red-800">
                    {error}
                  </AlertDescription>
                </Alert>
              )}

              <Button 
                type="submit" 
                className="w-full h-11 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white group"
                disabled={loading || googleLoading}
              >
                {loading ? (
                  'Creating account...'
                ) : (
                  <>
                    Create Account
                    <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </Button>
            </form>

            {/* Terms */}
            <p className="text-xs text-gray-500 text-center">
              By signing up, you agree to our{' '}
              <Link href="/legal/terms" className="text-blue-600 hover:underline">
                Terms of Service
              </Link>{' '}
              and{' '}
              <Link href="/legal/privacy" className="text-blue-600 hover:underline">
                Privacy Policy
              </Link>
            </p>

            {/* Sign In Link */}
            <div className="text-center pt-4 border-t">
              <p className="text-sm text-gray-600">
                Already have an account?{' '}
                <Link 
                  href="/auth/signin" 
                  className="font-semibold text-blue-600 hover:text-blue-700 hover:underline"
                >
                  Sign in
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}


