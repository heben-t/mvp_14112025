'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowRight, Rocket, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';

export function CTASection() {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  return (
    <section ref={ref} className="py-20 bg-gradient-to-br from-blue-600 via-purple-600 to-blue-700 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-grid-white/10 [mask-image:radial-gradient(white,transparent_70%)]" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-6">
            Join the Future of Verified AI Investment
          </h2>
          <p className="text-xl text-blue-100 mb-12 max-w-3xl mx-auto">
            Hebed AI is where innovation meets measurable impact.
          </p>

          {/* Dual CTA Boxes */}
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto mb-12">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={inView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="bg-white rounded-2xl p-8 shadow-2xl"
            >
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Rocket className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                AI Startups
              </h3>
              <div className="inline-block bg-blue-600 text-white px-4 py-1 rounded-full text-sm font-semibold mb-4">
                $USD 79 Launch Offer
              </div>
              <p className="text-gray-600 mb-6">
                Get verified, gain visibility, and connect with investors who believe in measurable performance.
              </p>
              <Link href="/auth/signup?role=STARTUP">
                <Button size="lg" className="w-full bg-blue-600 hover:bg-blue-700 group">
                  Join as AI Startup
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={inView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="bg-white rounded-2xl p-8 shadow-2xl"
            >
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                Investors
              </h3>
              <div className="inline-block bg-green-600 text-white px-4 py-1 rounded-full text-sm font-semibold mb-4">
                Free Early Access
              </div>
              <p className="text-gray-600 mb-6">
                Discover verified AI startups shaping the UAE's innovation landscape.
              </p>
              <Link href="/auth/signup?role=INVESTOR">
                <Button size="lg" variant="outline" className="w-full border-2 group hover:bg-gray-50">
                  Request Investor Access
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            </motion.div>
          </div>

          {/* Tagline */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="space-y-3"
          >
            <p className="text-xl text-white font-semibold">
              Hebed AI — Building the trust layer of the UAE's AI economy.
            </p>
            <p className="text-blue-200 italic">
              Because the future of AI investment must be measurable.
            </p>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
