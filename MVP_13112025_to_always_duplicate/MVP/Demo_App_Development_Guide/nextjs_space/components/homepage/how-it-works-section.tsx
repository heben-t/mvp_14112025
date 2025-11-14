'use client';

import { Search, TrendingUp, Handshake } from 'lucide-react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';

const steps = [
  {
    number: '01',
    icon: Search,
    title: 'Discover AI Startups or Launch Your Campaign',
    description: 'Browse verified AI startups filtered by industry and use case with real performance metrics. Or launch your own AI startup funding campaign on our platform.',
    color: 'blue',
  },
  {
    number: '02',
    icon: TrendingUp,
    title: 'Discover Robust and Verified ROI',
    description: 'Based on key metrics, we provide reliable and measurable ROI. Get personalized recommendations and track real-time ROI with our analytics dashboard.',
    color: 'purple',
  },
  {
    number: '03',
    icon: Handshake,
    title: 'Get Connected with Diverse Investors',
    description: 'Access VCs, business angels, and individual investors. Connect B2B and B2C investment opportunities and build relationships aligned to your vision.',
    color: 'green',
  },
];

export function HowItWorksSection() {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  return (
    <section ref={ref} className="py-20 bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            How <span className="text-blue-600">HEBED AI</span> Works
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Three simple steps to connect AI innovation with smart capital
          </p>
        </motion.div>

        <div className="relative">
          {/* Connection Line (Desktop) */}
          <div className="hidden lg:block absolute top-24 left-[16.666%] right-[16.666%] h-1 bg-gradient-to-r from-blue-200 via-purple-200 to-green-200 z-0" />

          <div className="grid md:grid-cols-3 gap-8 lg:gap-12 relative z-10">
            {steps.map((step, index) => (
              <motion.div
                key={step.number}
                initial={{ opacity: 0, y: 30 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                className="relative"
              >
                {/* Step Card */}
                <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100 hover:shadow-2xl transition-all duration-300">
                  {/* Number Badge */}
                  <div className={`
                    w-16 h-16 rounded-full flex items-center justify-center mb-6 mx-auto
                    ${step.color === 'blue' ? 'bg-gradient-to-br from-blue-500 to-blue-600' : ''}
                    ${step.color === 'purple' ? 'bg-gradient-to-br from-purple-500 to-purple-600' : ''}
                    ${step.color === 'green' ? 'bg-gradient-to-br from-green-500 to-green-600' : ''}
                  `}>
                    <step.icon className="h-8 w-8 text-white" />
                  </div>

                  {/* Step Number */}
                  <div className={`
                    text-6xl font-bold text-center mb-4 opacity-10
                    ${step.color === 'blue' ? 'text-blue-600' : ''}
                    ${step.color === 'purple' ? 'text-purple-600' : ''}
                    ${step.color === 'green' ? 'text-green-600' : ''}
                  `}>
                    {step.number}
                  </div>

                  {/* Content */}
                  <h3 className="text-xl font-semibold text-gray-900 mb-4 text-center">
                    {step.title}
                  </h3>
                  <p className="text-gray-600 text-center leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
