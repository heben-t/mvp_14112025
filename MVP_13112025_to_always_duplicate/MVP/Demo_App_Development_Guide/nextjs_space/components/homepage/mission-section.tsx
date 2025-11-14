'use client';

import { CheckCircle, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';

export function MissionSection() {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  const startupFeatures = [
    'Build trust with verified ROI data',
    'Gain visibility among UAE and international investors',
    'Get matched based on measurable performance',
  ];

  const investorFeatures = [
    'Discover verified AI startups across the UAE',
    'Access clear ROI insights and performance benchmarks',
    'Invest with transparency, confidence, and impact',
  ];

  return (
    <section ref={ref} className="py-20 bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
            Why Hebed AI
          </h2>
          <p className="text-xl text-gray-700 mb-4 max-w-3xl mx-auto font-medium">
            AI is transforming industries, but trust still determines who gets funded.
          </p>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Founders talk about potential while investors seek proof. Hebed AI bridges that gap.
          </p>
        </motion.div>

        {/* Value Proposition */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl p-8 md:p-12 border border-blue-100 mb-16"
        >
          <p className="text-lg text-gray-700 leading-relaxed text-center max-w-4xl mx-auto">
            Our platform verifies startup performance through a multidimensional ROI framework 
            that transforms complex data into clarity and investor confidence.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-12">
          {/* For AI Startups */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900">For AI Startups</h3>
            </div>
            <ul className="space-y-4">
              {startupFeatures.map((feature, index) => (
                <motion.li
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={inView ? { opacity: 1, x: 0 } : {}}
                  transition={{ duration: 0.4, delay: 0.4 + index * 0.1 }}
                  className="flex items-start gap-3"
                >
                  <CheckCircle className="h-6 w-6 text-blue-600 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700 text-lg">{feature}</span>
                </motion.li>
              ))}
            </ul>
          </motion.div>

          {/* For Investors */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-purple-600 rounded-xl flex items-center justify-center">
                <CheckCircle className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900">For Investors</h3>
            </div>
            <ul className="space-y-4">
              {investorFeatures.map((feature, index) => (
                <motion.li
                  key={index}
                  initial={{ opacity: 0, x: 20 }}
                  animate={inView ? { opacity: 1, x: 0 } : {}}
                  transition={{ duration: 0.4, delay: 0.4 + index * 0.1 }}
                  className="flex items-start gap-3"
                >
                  <CheckCircle className="h-6 w-6 text-purple-600 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700 text-lg">{feature}</span>
                </motion.li>
              ))}
            </ul>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
