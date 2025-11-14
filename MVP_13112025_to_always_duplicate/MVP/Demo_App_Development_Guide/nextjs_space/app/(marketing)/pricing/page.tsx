'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Check, Sparkles, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { Navigation, Footer } from '@/components/homepage';

const pricingPlan = {
  name: 'Startup Platform Access',
  price: '$USD 79',
  period: 'one-time',
  description: 'Everything you need to launch and manage your campaign',
  icon: Sparkles,
  features: [
    'Dashboard metrics',
    'Campaigns',
    'Profile',
    'Explore other campaigns',
    'Find Investors'
  ],
  cta: 'Get Started',
  ctaLink: 'https://buy.stripe.com/test_3cI4gB2QtawY91DcgHasg00',
  variant: 'default' as const,
};

export default function PricingPage() {
  return (
    <>
      <Navigation />
      
      <div className="min-h-screen bg-white">
        {/* Hero Section */}
        <section className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-purple-600 to-blue-700 py-20">
          <div className="absolute inset-0 bg-grid-white/10 [mask-image:linear-gradient(0deg,transparent,black)] pointer-events-none" />
          
          <div className="container mx-auto px-4 relative z-10">
            <div className="text-center max-w-4xl mx-auto">
              <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm border border-white/30 rounded-full px-4 py-2 mb-6">
                <Sparkles className="h-4 w-4 text-yellow-300" />
                <span className="text-sm font-medium text-white">Simple, Transparent Pricing</span>
              </div>
              
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6">
                Launch Your Campaign <br className="hidden sm:block" />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 to-yellow-400">
                  For Just $USD 79
                </span>
              </h1>
              
              <p className="text-xl text-blue-100 max-w-2xl mx-auto">
                One-time payment. Full access to dashboard, campaigns, and investor connections.
              </p>
            </div>
          </div>
        </section>

        {/* Pricing Card */}
        <div className="container mx-auto px-4 py-20">
          <div className="max-w-lg mx-auto">
            <Card className="relative flex flex-col transition-all duration-300 hover:shadow-2xl border-2 border-blue-600 shadow-xl">
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <Badge className="px-4 py-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white border-none">
                  For Startups
                </Badge>
              </div>
              
              <CardHeader>
                <div className="flex items-center justify-between mb-4">
                  <CardTitle className="text-2xl font-bold">{pricingPlan.name}</CardTitle>
                  <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600">
                    <Sparkles className="h-6 w-6 text-white" />
                  </div>
                </div>
                <div className="mb-4">
                  <span className="text-5xl font-bold text-gray-900">{pricingPlan.price}</span>
                  <span className="text-gray-600 ml-2">{pricingPlan.period}</span>
                </div>
                <CardDescription className="text-base">{pricingPlan.description}</CardDescription>
              </CardHeader>

              <CardContent className="flex-1">
                <ul className="space-y-4">
                  {pricingPlan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-3">
                      <div className="flex-shrink-0 w-5 h-5 bg-green-100 rounded-full flex items-center justify-center mt-0.5">
                        <Check className="h-3 w-3 text-green-600" />
                      </div>
                      <span className="text-sm text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>

              <CardFooter>
                <Button 
                  asChild 
                  variant="default"
                  className="w-full group bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                  size="lg"
                >
                  <a href={pricingPlan.ctaLink}>
                    {pricingPlan.cta}
                    <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </a>
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>

        {/* FAQ */}
        <div className="container mx-auto px-4 py-20">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-gray-900">
            Frequently Asked Questions
          </h2>
          <div className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto">
            {[
              {
                question: 'What do I get for $USD 79?',
                answer: 'Full access to create and manage your campaign, connect with investors, track metrics, and explore other campaigns on the platform.'
              },
              {
                question: 'Is this a one-time payment?',
                answer: 'Yes! Pay once and get lifetime access to all platform features including your dashboard, campaign management, and investor connections.'
              },
              {
                question: 'What payment methods do you accept?',
                answer: 'We accept all major credit cards (Visa, Mastercard, Amex) and debit cards through our secure payment processor, Stripe.'
              },
              {
                question: 'Can I get a refund?',
                answer: 'We offer a 7-day money-back guarantee if you haven\'t launched your campaign yet. Contact support for assistance.'
              }
            ].map((faq, index) => (
              <Card key={index} className="border border-gray-200 hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="text-lg text-gray-900">{faq.question}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 leading-relaxed">
                    {faq.answer}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
      
      <Footer />
    </>
  );
}
