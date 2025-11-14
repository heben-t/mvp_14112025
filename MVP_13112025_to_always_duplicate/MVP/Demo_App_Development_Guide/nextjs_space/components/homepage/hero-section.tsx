'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowRight, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

export function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-purple-600 to-blue-700 py-20 sm:py-32">
      {/* Animated background grid */}
      <div className="absolute inset-0 bg-grid-white/10 [mask-image:linear-gradient(0deg,transparent,black)] pointer-events-none" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm border border-white/30 rounded-full px-4 py-2 mb-8"
          >
            <Sparkles className="h-4 w-4 text-yellow-300" />
            <span className="text-sm font-medium text-white">The ROI Copilot Marketplace for AI Startups and Investors</span>
          </motion.div>

          {/* Main Headline */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
            Turning AI Innovation Into <br className="hidden sm:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 to-yellow-400">
              Measurable Investment
            </span>
          </h1>

          {/* Subheadline */}
          <p className="text-xl sm:text-2xl text-blue-100 mb-6 max-w-4xl mx-auto leading-relaxed">
            Hebed AI is the UAE's first ROI Copilot Marketplace where verified AI startups 
            and global investors connect through transparency, trust, and real performance.
          </p>
          
          <p className="text-lg text-blue-100/90 mb-10 max-w-3xl mx-auto">
            Built in the UAE, Hebed AI empowers the next generation of AI founders to demonstrate 
            measurable impact and helps investors discover verified opportunities aligned with UAE Vision 2031.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link href="/auth/signup?role=STARTUP">
              <Button 
                size="lg" 
                className="bg-white text-blue-600 hover:bg-blue-50 text-lg px-8 py-6 h-auto shadow-xl hover:shadow-2xl transition-all group"
              >
                Join as an AI Startup
                <span className="ml-2 text-sm bg-blue-600 text-white px-2 py-1 rounded">$USD 79 Early Access</span>
              </Button>
            </Link>
            <Link href="/auth/signup?role=INVESTOR">
              <Button 
                size="lg" 
                variant="outline" 
                className="bg-transparent border-2 border-white text-white hover:bg-white/10 text-lg px-8 py-6 h-auto backdrop-blur-sm"
              >
                Request Free Investor Access
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>

          {/* Social Proof - UAE Stats */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8, duration: 0.6 }}
            className="mt-12 text-blue-100"
          >
            <p className="text-sm mb-4 text-blue-200">Powered by UAE Vision 2031</p>
            <div className="flex flex-wrap justify-center items-center gap-6">
              <span className="text-sm font-medium">$30B+ UAE AI Investment</span>
              <div className="h-4 w-px bg-white/30" />
              <span className="text-sm font-medium">14% Target GDP by 2031</span>
              <div className="h-4 w-px bg-white/30" />
              <span className="text-sm font-medium">$4.5B MENA AI Funding (2025)</span>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
