'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase-client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Sparkles, CheckCircle2, ArrowRight, TrendingUp, ChevronLeft } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

const INVESTOR_TYPES = [
  'Individual Investor',
  'Angel Investor',
  'VC Partner',
  'Family Office'
];

const INVESTMENT_TYPES = [
  'Equity',
  'Convertible Note / SAFE',
  'Crowdfunding participation (via pooled round)',
  'Strategic / Advisory'
];

const TICKET_RANGES = [
  '≤$50k',
  '$50k–$250k',
  '$250k–$1M',
  '$1M+'
];

const STAGES = ['Pre-Seed', 'Seed'];

const SECTORS = [
  'AI SaaS / Infrastructure',
  'Fintech / Data Intelligence',
  'PropTech / Real Estate AI',
  'HealthTech',
  'EdTech',
  'Enterprise AI Tools',
  'Other emerging AI applications (specify below)'
];

const GEO_FOCUS = [
  'UAE',
  'Expanding into the UAE'
];

const ROI_PRIORITIES = [
  'Financial',
  'Operational',
  'Innovation',
  'Social/Sustainability'
];

export default function InvestorOnboardingPage() {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [showSuccess, setShowSuccess] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  
  const [formData, setFormData] = useState({
    investorType: '',
    investmentTypes: [] as string[],
    ticketRange: '',
    stages: [] as string[],
    sectors: [] as string[],
    otherSector: '',
    geoFocus: ['UAE'] as string[], // Pre-checked
    roiPriorities: [] as string[],
    visibility: '' as 'visible' | 'after_interest' | '',
    accredited: false,
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

        if (!user || user.role !== 'INVESTOR') {
          router.push('/auth/signin');
          return;
        }

        setUserId(user.id);

        const { data: profile } = await supabase
          .from('investor_profiles')
          .select('onboardingComplete')
          .eq('userId', user.id)
          .single();

        if (profile?.onboardingComplete) {
          router.push('/dashboard');
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

  const validateStep = (step: number) => {
    const newErrors: Record<string, string> = {};

    if (step === 1) {
      if (!formData.investorType) newErrors.investorType = 'Please select investor type';
      if (formData.investmentTypes.length === 0) newErrors.investmentTypes = 'Select at least one investment type';
      if (!formData.ticketRange) newErrors.ticketRange = 'Please select ticket range';
    }

    if (step === 2) {
      if (formData.stages.length === 0) newErrors.stages = 'Select at least one stage';
      if (formData.sectors.length === 0) newErrors.sectors = 'Select at least one sector';
      if (formData.sectors.includes('Other emerging AI applications (specify below)') && !formData.otherSector.trim()) {
        newErrors.otherSector = 'Please specify other sector';
      }
      if (formData.geoFocus.length === 0) newErrors.geoFocus = 'Select at least one geographic focus';
    }

    if (step === 3) {
      if (formData.roiPriorities.length === 0) newErrors.roiPriorities = 'Select at least one ROI priority';
      if (!formData.visibility) newErrors.visibility = 'Please select visibility preference';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(currentStep + 1);
      window.scrollTo(0, 0);
    }
  };

  const handleBack = () => {
    setCurrentStep(currentStep - 1);
    window.scrollTo(0, 0);
  };

  const handleSubmit = async () => {
    if (!validateStep(3)) return;

    setLoading(true);

    try {
      const { error } = await supabase
        .from('investor_profiles')
        .upsert({
          userId: userId,
          investorType: formData.investorType,
          investmentTypes: formData.investmentTypes,
          ticketRange: formData.ticketRange,
          preferredStages: formData.stages,
          preferredSectors: formData.sectors.includes('Other emerging AI applications (specify below)') 
            ? [...formData.sectors.filter(s => s !== 'Other emerging AI applications (specify below)'), formData.otherSector]
            : formData.sectors,
          geoFocus: formData.geoFocus,
          roiPriorities: formData.roiPriorities,
          profileVisibility: formData.visibility,
          isAccredited: formData.accredited,
          onboardingComplete: true,
          updatedAt: new Date().toISOString(),
        });

      if (error) throw error;

      setShowSuccess(true);
    } catch (error: any) {
      console.error('Onboarding error:', error);
      setErrors({ submit: error.message || 'Failed to complete onboarding' });
    } finally {
      setLoading(false);
    }
  };

  const toggleArrayValue = (array: string[], value: string) => {
    if (array.includes(value)) {
      return array.filter(v => v !== value);
    } else {
      return [...array, value];
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

  if (showSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-blue-50">
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

        <div className="container mx-auto px-4 flex items-center justify-center min-h-[calc(100vh-120px)]">
          <Card className="w-full max-w-2xl border-none shadow-2xl">
            <CardHeader className="text-center pb-6">
              <div className="mx-auto w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center mb-4">
                <CheckCircle2 className="h-10 w-10 text-white" />
              </div>
              <CardTitle className="text-3xl font-bold text-gray-900">
                Profile Created Successfully!
              </CardTitle>
              <CardDescription className="text-base mt-2">
                Your investor profile is now active. Start discovering AI opportunities.
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-6">
              <div className="bg-gradient-to-br from-blue-50 to-purple-50 border border-blue-200 rounded-xl p-6 text-center">
                <p className="text-gray-700 mb-4">
                  In the meantime, you can explore the public campaigns
                </p>
                <Button
                  className="w-full h-12 text-base bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                  onClick={() => router.push('/dashboard')}
                >
                  Go to Dashboard
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
        <Card className="w-full max-w-3xl border-none shadow-2xl">
          <CardHeader className="space-y-3 text-center pb-6">
            <div className="mx-auto w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mb-2">
              <TrendingUp className="h-8 w-8 text-white" />
            </div>
            <CardTitle className="text-3xl font-bold text-gray-900">
              Investor Onboarding
            </CardTitle>
            <CardDescription className="text-base">
              Welcome to Hebed AI<br />
              Set up your profile to discover AI opportunities in the UAE
            </CardDescription>

            {/* Progress Steps */}
            <div className="flex items-center justify-center gap-4 pt-6">
              {[1, 2, 3].map((step) => (
                <div key={step} className="flex items-center">
                  <div className={`flex items-center justify-center w-10 h-10 rounded-full font-semibold ${
                    currentStep === step 
                      ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white'
                      : currentStep > step
                      ? 'bg-green-500 text-white'
                      : 'bg-gray-200 text-gray-600'
                  }`}>
                    {currentStep > step ? <CheckCircle2 className="h-6 w-6" /> : step}
                  </div>
                  {step < 3 && (
                    <div className={`w-16 h-1 mx-2 ${currentStep > step ? 'bg-green-500' : 'bg-gray-200'}`} />
                  )}
                </div>
              ))}
            </div>
          </CardHeader>

          <CardContent>
            {/* Step 1: Investor Profile */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">Step 1: Investor Profile</h3>
                </div>

                {/* Investor Type */}
                <div className="space-y-2">
                  <Label className="text-gray-700 font-semibold">
                    Investor Type <span className="text-red-500">*</span>
                  </Label>
                  <Select value={formData.investorType} onValueChange={(value) => setFormData({ ...formData, investorType: value })}>
                    <SelectTrigger className="h-11">
                      <SelectValue placeholder="Select investor type" />
                    </SelectTrigger>
                    <SelectContent>
                      {INVESTOR_TYPES.map((type) => (
                        <SelectItem key={type} value={type}>{type}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.investorType && <p className="text-sm text-red-600">{errors.investorType}</p>}
                </div>

                {/* Investment Types */}
                <div className="space-y-3">
                  <Label className="text-gray-700 font-semibold">
                    Investment Types <span className="text-red-500">*</span>
                  </Label>
                  <div className="space-y-3">
                    {INVESTMENT_TYPES.map((type) => (
                      <div key={type} className="flex items-start space-x-3">
                        <Checkbox
                          id={`investment-${type}`}
                          checked={formData.investmentTypes.includes(type)}
                          onCheckedChange={() => setFormData({
                            ...formData,
                            investmentTypes: toggleArrayValue(formData.investmentTypes, type)
                          })}
                        />
                        <Label htmlFor={`investment-${type}`} className="text-sm font-normal cursor-pointer leading-relaxed">
                          {type}
                        </Label>
                      </div>
                    ))}
                  </div>
                  {errors.investmentTypes && <p className="text-sm text-red-600">{errors.investmentTypes}</p>}
                </div>

                {/* Ticket Range */}
                <div className="space-y-2">
                  <Label className="text-gray-700 font-semibold">
                    Typical Ticket Range <span className="text-red-500">*</span>
                  </Label>
                  <Select value={formData.ticketRange} onValueChange={(value) => setFormData({ ...formData, ticketRange: value })}>
                    <SelectTrigger className="h-11">
                      <SelectValue placeholder="Select ticket range" />
                    </SelectTrigger>
                    <SelectContent>
                      {TICKET_RANGES.map((range) => (
                        <SelectItem key={range} value={range}>{range}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.ticketRange && <p className="text-sm text-red-600">{errors.ticketRange}</p>}
                </div>

                <Button
                  onClick={handleNext}
                  className="w-full h-12 text-base bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                >
                  Continue to Step 2
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </div>
            )}

            {/* Step 2: Investment Preferences */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">Step 2: Investment Preferences</h3>
                </div>

                {/* Stages */}
                <div className="space-y-3">
                  <Label className="text-gray-700 font-semibold">
                    Preferred Stages <span className="text-red-500">*</span>
                  </Label>
                  <div className="grid grid-cols-2 gap-3">
                    {STAGES.map((stage) => (
                      <div key={stage} className="flex items-center space-x-3">
                        <Checkbox
                          id={`stage-${stage}`}
                          checked={formData.stages.includes(stage)}
                          onCheckedChange={() => setFormData({
                            ...formData,
                            stages: toggleArrayValue(formData.stages, stage)
                          })}
                        />
                        <Label htmlFor={`stage-${stage}`} className="text-sm font-normal cursor-pointer">
                          {stage}
                        </Label>
                      </div>
                    ))}
                  </div>
                  {errors.stages && <p className="text-sm text-red-600">{errors.stages}</p>}
                </div>

                {/* Sectors */}
                <div className="space-y-3">
                  <Label className="text-gray-700 font-semibold">
                    Preferred Sectors <span className="text-red-500">*</span>
                  </Label>
                  <div className="space-y-3">
                    {SECTORS.map((sector) => (
                      <div key={sector} className="flex items-start space-x-3">
                        <Checkbox
                          id={`sector-${sector}`}
                          checked={formData.sectors.includes(sector)}
                          onCheckedChange={() => setFormData({
                            ...formData,
                            sectors: toggleArrayValue(formData.sectors, sector)
                          })}
                        />
                        <Label htmlFor={`sector-${sector}`} className="text-sm font-normal cursor-pointer leading-relaxed">
                          {sector}
                        </Label>
                      </div>
                    ))}
                  </div>
                  {errors.sectors && <p className="text-sm text-red-600">{errors.sectors}</p>}
                  
                  {/* Other Sector Input */}
                  {formData.sectors.includes('Other emerging AI applications (specify below)') && (
                    <div className="mt-3">
                      <Input
                        placeholder="Specify other sector"
                        value={formData.otherSector}
                        onChange={(e) => setFormData({ ...formData, otherSector: e.target.value })}
                        className="h-11"
                      />
                      {errors.otherSector && <p className="text-sm text-red-600 mt-1">{errors.otherSector}</p>}
                    </div>
                  )}
                </div>

                {/* Geographic Focus */}
                <div className="space-y-3">
                  <Label className="text-gray-700 font-semibold">
                    Geographic Focus <span className="text-red-500">*</span>
                  </Label>
                  <div className="space-y-3">
                    {GEO_FOCUS.map((geo) => (
                      <div key={geo} className="flex items-center space-x-3">
                        <Checkbox
                          id={`geo-${geo}`}
                          checked={formData.geoFocus.includes(geo)}
                          onCheckedChange={() => setFormData({
                            ...formData,
                            geoFocus: toggleArrayValue(formData.geoFocus, geo)
                          })}
                        />
                        <Label htmlFor={`geo-${geo}`} className="text-sm font-normal cursor-pointer">
                          {geo}
                        </Label>
                      </div>
                    ))}
                  </div>
                  {errors.geoFocus && <p className="text-sm text-red-600">{errors.geoFocus}</p>}
                </div>

                <div className="flex gap-3">
                  <Button
                    onClick={handleBack}
                    variant="outline"
                    className="flex-1 h-12 text-base"
                  >
                    <ChevronLeft className="mr-2 h-5 w-5" />
                    Back
                  </Button>
                  <Button
                    onClick={handleNext}
                    className="flex-1 h-12 text-base bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                  >
                    Continue to Step 3
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </div>
              </div>
            )}

            {/* Step 3: Profile Settings */}
            {currentStep === 3 && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">Step 3: Profile Settings</h3>
                </div>

                {/* ROI Priorities */}
                <div className="space-y-3">
                  <Label className="text-gray-700 font-semibold">
                    ROI Priorities <span className="text-red-500">*</span>
                  </Label>
                  <div className="grid grid-cols-2 gap-3">
                    {ROI_PRIORITIES.map((priority) => (
                      <div key={priority} className="flex items-center space-x-3">
                        <Checkbox
                          id={`roi-${priority}`}
                          checked={formData.roiPriorities.includes(priority)}
                          onCheckedChange={() => setFormData({
                            ...formData,
                            roiPriorities: toggleArrayValue(formData.roiPriorities, priority)
                          })}
                        />
                        <Label htmlFor={`roi-${priority}`} className="text-sm font-normal cursor-pointer">
                          {priority}
                        </Label>
                      </div>
                    ))}
                  </div>
                  {errors.roiPriorities && <p className="text-sm text-red-600">{errors.roiPriorities}</p>}
                </div>

                {/* Visibility */}
                <div className="space-y-3">
                  <Label className="text-gray-700 font-semibold">
                    Profile Visibility <span className="text-red-500">*</span>
                  </Label>
                  <RadioGroup
                    value={formData.visibility}
                    onValueChange={(value: 'visible' | 'after_interest') => setFormData({ ...formData, visibility: value })}
                  >
                    <div className="flex items-start space-x-3 p-4 border rounded-lg">
                      <RadioGroupItem value="visible" id="visible" />
                      <Label htmlFor="visible" className="text-sm cursor-pointer flex-1">
                        <span className="font-semibold">Visible to all startups</span>
                        <p className="text-gray-600 mt-1">Your profile is public</p>
                      </Label>
                    </div>
                    <div className="flex items-start space-x-3 p-4 border rounded-lg">
                      <RadioGroupItem value="after_interest" id="after_interest" />
                      <Label htmlFor="after_interest" className="text-sm cursor-pointer flex-1">
                        <span className="font-semibold">Visible after expressing interest</span>
                        <p className="text-gray-600 mt-1">Only visible to startups you're interested in</p>
                      </Label>
                    </div>
                  </RadioGroup>
                  {errors.visibility && <p className="text-sm text-red-600">{errors.visibility}</p>}
                </div>

                {/* Accredited */}
                <div className="flex items-start space-x-3 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <Checkbox
                    id="accredited"
                    checked={formData.accredited}
                    onCheckedChange={(checked) => setFormData({ ...formData, accredited: checked as boolean })}
                  />
                  <Label htmlFor="accredited" className="text-sm cursor-pointer leading-relaxed">
                    I am an <strong>accredited investor</strong> (optional)
                    <p className="text-gray-600 mt-1 text-xs">Accredited status may unlock additional opportunities</p>
                  </Label>
                </div>

                {errors.submit && (
                  <Alert variant="destructive">
                    <AlertDescription>{errors.submit}</AlertDescription>
                  </Alert>
                )}

                <div className="flex gap-3">
                  <Button
                    onClick={handleBack}
                    variant="outline"
                    className="flex-1 h-12 text-base"
                  >
                    <ChevronLeft className="mr-2 h-5 w-5" />
                    Back
                  </Button>
                  <Button
                    onClick={handleSubmit}
                    className="flex-1 h-12 text-base bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                        Submitting...
                      </>
                    ) : (
                      <>
                        Complete Profile
                        <ArrowRight className="ml-2 h-5 w-5" />
                      </>
                    )}
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
