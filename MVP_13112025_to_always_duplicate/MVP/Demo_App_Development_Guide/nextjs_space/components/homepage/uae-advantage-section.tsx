'use client';

import { TrendingUp, Target, Shield, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';

export function UAEAdvantageSection() {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  const stats = [
    { value: '$30B+', label: 'UAE AI Investment', description: 'Since launching national AI strategy' },
    { value: '14%', label: 'Target GDP by 2031', description: 'Highest ratio in the Middle East' },
    { value: '$4.5B', label: 'MENA AI Funding (2025)', description: 'UAE leading with 20% of total' },
  ];

  return (
    <section ref={ref} className="py-20 bg-gradient-to-br from-blue-900 via-purple-900 to-blue-900 text-white overflow-hidden relative">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-grid-white/5 [mask-image:linear-gradient(0deg,transparent,black,transparent)] pointer-events-none" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-2 mb-6">
            <Sparkles className="h-4 w-4 text-yellow-300" />
            <span className="text-sm font-medium">UAE Launch Offer</span>
          </div>
          
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6">
            The UAE Advantage
          </h2>
          <p className="text-xl text-blue-100 max-w-4xl mx-auto leading-relaxed">
            The UAE is shaping the future of AI and Hebed AI is building its trust infrastructure.
          </p>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 text-center"
            >
              <div className="text-4xl lg:text-5xl font-bold text-yellow-300 mb-2">
                {stat.value}
              </div>
              <div className="text-lg font-semibold text-white mb-1">
                {stat.label}
              </div>
              <p className="text-sm text-blue-200">
                {stat.description}
              </p>
            </motion.div>
          ))}
        </div>

        {/* Content Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="grid md:grid-cols-2 gap-8"
        >
          {/* Left Column */}
          <div className="space-y-6">
            <p className="text-lg text-blue-100 leading-relaxed">
              The UAE is rapidly becoming the global capital for AI-driven entrepreneurship. 
              The country has invested more than <span className="font-semibold text-white">$30 billion</span> in 
              artificial intelligence initiatives since launching its national AI strategy, and aims to make 
              AI contribute <span className="font-semibold text-white">14 percent of its GDP by 2031</span>, the highest ratio in the Middle East.
            </p>
            <p className="text-lg text-blue-100 leading-relaxed">
              In 2025 alone, AI startups in the MENA region attracted over <span className="font-semibold text-white">$4.5 billion in funding</span>, 
              with the UAE leading the charge and accounting for nearly <span className="font-semibold text-white">20 percent of total investments</span>. 
              The government's initiatives, including <span className="font-semibold text-white">UAE Vision 2031</span>, are driving a new era of responsible innovation, 
              data transparency, and measurable impact.
            </p>
          </div>

          {/* Right Column */}
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20">
            <h3 className="text-2xl font-bold mb-6 text-white">Hebed AI Supports UAE Vision</h3>
            <p className="text-lg text-blue-100 leading-relaxed mb-6">
              Hebed AI supports this vision by providing the trust, data, and transparency that power 
              responsible AI investment across the UAE. Our marketplace makes ROI measurable, AI funding 
              verifiable, and investor confidence real.
            </p>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <Target className="h-6 w-6 text-yellow-300 flex-shrink-0 mt-1" />
                <p className="text-blue-100">Built for founders who prove value through innovation</p>
              </div>
              <div className="flex items-start gap-3">
                <Shield className="h-6 w-6 text-yellow-300 flex-shrink-0 mt-1" />
                <p className="text-blue-100">Built for investors who create impact through intelligence</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Launch Offer CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="mt-12 text-center"
        >
          <div className="inline-block bg-gradient-to-r from-yellow-400 to-yellow-500 text-blue-900 rounded-2xl p-8">
            <p className="text-lg font-semibold mb-2">Join the First 100 Verified AI Startups</p>
            <p className="text-sm">Secure your position among the next generation of UAE innovation</p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
