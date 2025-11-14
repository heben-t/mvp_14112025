'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase-client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Sparkles, CheckCircle2, Download, ArrowRight, Rocket, CreditCard, Check } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

const INDUSTRIES = [
  'AI SaaS',
  'Fintech / Data Intelligence',
  'PropTech / Real Estate AI',
  'HealthTech',
  'EdTech',
  'AI Infrastructure / Tools',
  'Other AI Applications'
];

const STAGES = [
  { value: 'Pre-Seed', label: 'Pre-Seed', description: 'concept or prototype stage, limited traction, preparing for MVP validation' },
  { value: 'Seed', label: 'Seed', description: 'MVP ready or early revenue, raising for market expansion and growth' }
];

const GEO_PRESENCE = [
  'Based in the UAE',
  'Expanding into the UAE'
];

export default function StartupOnboardingPage() {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState<'plugin' | 'manual' | null>(null);
  
  const [formData, setFormData] = useState({
    companyName: '',
    industry: '',
    stage: '',
    description: '',
    geo: '',
    dataMigrationMethod: '' as 'plugin' | 'manual' | '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    async function checkAuth() {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session?.user) {
          router.push('/auth/signin');
          return;
        }

        const { data: user } = await supabase
          .from('users')
          .select('id, role')
          .eq('id', session.user.id)
          .single();

        if (!user || user.role !== 'STARTUP') {
          router.push('/auth/signin');
          return;
        }

        setUserId(user.id);

        // Check if already completed onboarding
        const { data: profile } = await supabase
          .from('startup_profiles')
          .select('onboardingComplete')
          .eq('userId', user.id)
          .single();

        if (profile?.onboardingComplete) {
          router.push('/dashboard/startup');
        } else {
          setCheckingAuth(false);
        }
      } catch (error) {
        console.error('Error checking auth:', error);
        setCheckingAuth(false);
      }
    }

    checkAuth();
  }, [router]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.companyName || formData.companyName.length < 2 || formData.companyName.length > 80) {
      newErrors.companyName = 'Company name must be between 2-80 characters';
    }

    if (!formData.industry) {
      newErrors.industry = 'Please select an industry';
    }

    if (!formData.stage) {
      newErrors.stage = 'Please select a stage';
    }

    if (!formData.description || formData.description.length < 30 || formData.description.length > 400) {
      newErrors.description = 'Description must be between 30-400 characters';
    }

    if (!formData.geo) {
      newErrors.geo = 'Please select your geographic presence';
    }

    if (!formData.dataMigrationMethod) {
      newErrors.dataMigrationMethod = 'Please select a data migration method';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      // Save to database
      const { error } = await supabase
        .from('startup_profiles')
        .upsert({
          userId: userId,
          companyName: formData.companyName,
          industry: formData.industry,
          stage: formData.stage,
          description: formData.description,
          geographicPresence: formData.geo,
          dataMigrationMethod: formData.dataMigrationMethod,
          onboardingComplete: false, // Will be completed after payment
          updatedAt: new Date().toISOString(),
        });

      if (error) throw error;

      setSelectedMethod(formData.dataMigrationMethod);
      setShowPayment(true);
    } catch (error: any) {
      console.error('Onboarding error:', error);
      setErrors({ submit: error.message || 'Failed to complete onboarding' });
    } finally {
      setLoading(false);
    }
  };

  if (checkingAuth) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (showPayment) {
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

        {/* Payment Content */}
        <div className="container mx-auto px-4 flex items-center justify-center min-h-[calc(100vh-120px)]">
          <Card className="w-full max-w-2xl border-none shadow-2xl">
            <CardHeader className="text-center pb-6">
              <div className="mx-auto w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mb-4">
                <CreditCard className="h-10 w-10 text-white" />
              </div>
              <CardTitle className="text-3xl font-bold text-gray-900">
                Complete Your Registration
              </CardTitle>
              <CardDescription className="text-base mt-2">
                One final step to unlock your startup dashboard
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-6">
              <Card className="bg-gradient-to-br from-blue-50 to-purple-50 border-2 border-blue-200">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-xl">Platform Access</CardTitle>
                    <div className="text-right">
                      <div className="text-3xl font-bold text-gray-900">$USD 79</div>
                      <div className="text-sm text-gray-600">one-time</div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 mb-4">Features included:</p>
                  <ul className="space-y-2">
                    {[
                      'Dashboard metrics',
                      'Campaigns',
                      'Profile',
                      'Explore other campaigns',
                      'Find Investors'
                    ].map((feature) => (
                      <li key={feature} className="flex items-center gap-2">
                        <div className="flex-shrink-0 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                          <Check className="h-3 w-3 text-white" />
                        </div>
                        <span className="text-sm text-gray-700">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              <Button
                className="w-full h-14 text-lg bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                onClick={() => {
                  window.location.href = 'https://buy.stripe.com/test_3cI4gB2QtawY91DcgHasg00';
                }}
              >
                <CreditCard className="mr-2 h-5 w-5" />
                Proceed to Payment
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>

              <p className="text-center text-sm text-gray-500">
                Secure payment powered by Stripe. You'll be redirected back after payment.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (showSuccess) {
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

        {/* Success Content */}
        <div className="container mx-auto px-4 flex items-center justify-center min-h-[calc(100vh-120px)]">
          <Card className="w-full max-w-3xl border-none shadow-2xl">
            <CardHeader className="text-center pb-6">
              <div className="mx-auto w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center mb-4">
                <CheckCircle2 className="h-10 w-10 text-white" />
              </div>
              <CardTitle className="text-3xl font-bold text-gray-900">
                Thanks for submitting — we'll schedule your onboarding call
              </CardTitle>
            </CardHeader>

            <CardContent className="space-y-6">
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
                <p className="text-gray-800 font-semibold mb-4">
                  Please {selectedMethod === 'plugin' ? 'make sure to have the requirements below ready before the call' : 'prepare a .csv file containing the following metrics'}:
                </p>

                {selectedMethod === 'manual' && (
                  <div className="mb-4">
                    <Button
                      variant="outline"
                      className="w-full justify-between"
                      asChild
                    >
                      <a href="/hebed_ai_manual_metrics_template.csv" download>
                        <span className="flex items-center gap-2">
                          <Download className="h-5 w-5" />
                          Download Template CSV
                        </span>
                        <ArrowRight className="h-5 w-5" />
                      </a>
                    </Button>
                  </div>
                )}

                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Finance</h4>
                    <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
                      <li><code className="bg-white px-2 py-0.5 rounded">MRR_now</code>, <code className="bg-white px-2 py-0.5 rounded">MRR_prev</code>, <code className="bg-white px-2 py-0.5 rounded">ARR = 12 × MRR_now</code></li>
                      <li><code className="bg-white px-2 py-0.5 rounded">churn_rate</code>, <code className="bg-white px-2 py-0.5 rounded">active_customers</code></li>
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Technology <span className="text-sm font-normal text-gray-600">(answered manually on the call)</span></h4>
                    <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
                      <li>Use of AI: <strong>HR, FINANCE, LAW, COMPLIANCE, ALL, OPERATIONS, OTHER</strong></li>
                      <li>What does AI improve the most? <strong>Speed/Productivity, Accuracy, Cost Reduction, Decision-Making</strong></li>
                      <li>AI/ML model in production or accessible via API? <strong>Yes / No</strong></li>
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Industry</h4>
                    <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
                      <li><code className="bg-white px-2 py-0.5 rounded">activeUsers_now</code>, <code className="bg-white px-2 py-0.5 rounded">activeUsers_prev</code></li>
                      <li><code className="bg-white px-2 py-0.5 rounded">engagementRate</code>, <code className="bg-white px-2 py-0.5 rounded">returningUsers</code></li>
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Community & Engagement (Social)</h4>
                    <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
                      <li><code className="bg-white px-2 py-0.5 rounded">followers_count</code>, <code className="bg-white px-2 py-0.5 rounded">team_years_experience</code></li>
                      <li><code className="bg-white px-2 py-0.5 rounded">mentions_count</code> <span className="text-gray-600">(funded / incubated / featured)</span></li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t">
                <p className="text-center text-gray-600 mb-4">
                  In the meantime, you can explore the public campaigns
                </p>
                <Button
                  className="w-full h-12 text-base bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                  onClick={() => router.push('/coming-soon')}
                >
                  Explore Campaigns
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

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
        <Card className="w-full max-w-2xl border-none shadow-2xl">
          <CardHeader className="space-y-3 text-center pb-6">
            <div className="mx-auto w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mb-2">
              <Rocket className="h-8 w-8 text-white" />
            </div>
            <CardTitle className="text-3xl font-bold text-gray-900">
              Startup Onboarding
            </CardTitle>
            <CardDescription className="text-base">
              Welcome to Hebed AI<br />
              Let's set up your startup profile to start connecting with AI-focused investors in the UAE
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Company Name */}
              <div className="space-y-2">
                <Label htmlFor="companyName" className="text-gray-700 font-semibold">
                  Company Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="companyName"
                  type="text"
                  placeholder="Enter your company name"
                  value={formData.companyName}
                  onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                  className="h-11"
                  maxLength={80}
                />
                {errors.companyName && (
                  <p className="text-sm text-red-600">{errors.companyName}</p>
                )}
              </div>

              {/* Industry */}
              <div className="space-y-2">
                <Label htmlFor="industry" className="text-gray-700 font-semibold">
                  Industry <span className="text-red-500">*</span>
                </Label>
                <Select value={formData.industry} onValueChange={(value) => setFormData({ ...formData, industry: value })}>
                  <SelectTrigger className="h-11">
                    <SelectValue placeholder="Select your industry" />
                  </SelectTrigger>
                  <SelectContent>
                    {INDUSTRIES.map((industry) => (
                      <SelectItem key={industry} value={industry}>
                        {industry}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.industry && (
                  <p className="text-sm text-red-600">{errors.industry}</p>
                )}
              </div>

              {/* Stage */}
              <div className="space-y-2">
                <Label className="text-gray-700 font-semibold">
                  Stage <span className="text-red-500">*</span>
                </Label>
                <Select value={formData.stage} onValueChange={(value) => setFormData({ ...formData, stage: value })}>
                  <SelectTrigger className="h-11">
                    <SelectValue placeholder="Select your stage" />
                  </SelectTrigger>
                  <SelectContent>
                    {STAGES.map((stage) => (
                      <SelectItem key={stage.value} value={stage.value}>
                        <div className="flex flex-col">
                          <span className="font-semibold">{stage.label}</span>
                          <span className="text-xs text-gray-600">{stage.description}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.stage && (
                  <p className="text-sm text-red-600">{errors.stage}</p>
                )}
              </div>

              {/* Company Description */}
              <div className="space-y-2">
                <Label htmlFor="description" className="text-gray-700 font-semibold">
                  Company Description <span className="text-red-500">*</span>
                </Label>
                <Textarea
                  id="description"
                  placeholder="Describe your product, traction, and value proposition in 2–3 sentences."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="min-h-[120px] resize-none"
                  maxLength={400}
                />
                <div className="flex justify-between text-xs text-gray-500">
                  <span>30-400 characters required</span>
                  <span>{formData.description.length}/400</span>
                </div>
                {errors.description && (
                  <p className="text-sm text-red-600">{errors.description}</p>
                )}
              </div>

              {/* Geographic Presence */}
              <div className="space-y-2">
                <Label className="text-gray-700 font-semibold">
                  Geographic Presence <span className="text-red-500">*</span>
                </Label>
                <Select value={formData.geo} onValueChange={(value) => setFormData({ ...formData, geo: value })}>
                  <SelectTrigger className="h-11">
                    <SelectValue placeholder="Select your geographic presence" />
                  </SelectTrigger>
                  <SelectContent>
                    {GEO_PRESENCE.map((geo) => (
                      <SelectItem key={geo} value={geo}>
                        {geo}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.geo && (
                  <p className="text-sm text-red-600">{errors.geo}</p>
                )}
              </div>

              {/* Data Migration Method */}
              <div className="space-y-3">
                <Label className="text-gray-700 font-semibold">
                  Data Migration Method <span className="text-red-500">*</span>
                </Label>
                <RadioGroup
                  value={formData.dataMigrationMethod}
                  onValueChange={(value: 'plugin' | 'manual') => setFormData({ ...formData, dataMigrationMethod: value })}
                  className="grid grid-cols-2 gap-4"
                >
                  <div>
                    <RadioGroupItem value="plugin" id="plugin" className="peer sr-only" />
                    <Label
                      htmlFor="plugin"
                      className="flex flex-col items-center justify-center rounded-xl border-2 border-gray-200 bg-white p-6 hover:bg-gray-50 peer-data-[state=checked]:border-blue-600 peer-data-[state=checked]:bg-blue-50 cursor-pointer transition-all h-full"
                    >
                      <Sparkles className="mb-3 h-8 w-8 text-blue-600" />
                      <span className="text-base font-semibold text-gray-900">Plugin</span>
                      <span className="text-sm text-gray-600 text-center mt-1">Add-ons & API</span>
                    </Label>
                  </div>
                  <div>
                    <RadioGroupItem value="manual" id="manual" className="peer sr-only" />
                    <Label
                      htmlFor="manual"
                      className="flex flex-col items-center justify-center rounded-xl border-2 border-gray-200 bg-white p-6 hover:bg-gray-50 peer-data-[state=checked]:border-purple-600 peer-data-[state=checked]:bg-purple-50 cursor-pointer transition-all h-full"
                    >
                      <Download className="mb-3 h-8 w-8 text-purple-600" />
                      <span className="text-base font-semibold text-gray-900">Manual</span>
                      <span className="text-sm text-gray-600 text-center mt-1">CSV Upload</span>
                    </Label>
                  </div>
                </RadioGroup>
                {errors.dataMigrationMethod && (
                  <p className="text-sm text-red-600">{errors.dataMigrationMethod}</p>
                )}
              </div>

              {/* Submit Error */}
              {errors.submit && (
                <Alert variant="destructive">
                  <AlertDescription>{errors.submit}</AlertDescription>
                </Alert>
              )}

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full h-12 text-base bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Submitting...
                  </>
                ) : (
                  <>
                    Submit
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

