'use client';

import { BarChart3, Search, Users, Rocket } from 'lucide-react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';

const features = [
  {
    icon: BarChart3,
    title: 'Transparent Performance Data',
    description: 'AI startups showcase verified ROI metrics based on key performance indicators, providing investors with reliable, measurable data.',
    color: 'blue',
    gradient: 'from-blue-500 to-blue-600',
    bgColor: 'bg-blue-50',
    iconColor: 'text-blue-600',
  },
  {
    icon: Search,
    title: 'Browse AI Startups by Industry',
    description: 'Filter verified AI startups by use case, industry, and performance metrics. Find the right investment opportunity.',
    color: 'green',
    gradient: 'from-green-500 to-green-600',
    bgColor: 'bg-green-50',
    iconColor: 'text-green-600',
  },
  {
    icon: Users,
    title: 'Connect with VCs, Angels & Individuals',
    description: 'Access a diverse pool of investors—from venture capital firms to business angels and individual B2B/B2C backers.',
    color: 'purple',
    gradient: 'from-purple-500 to-purple-600',
    bgColor: 'bg-purple-50',
    iconColor: 'text-purple-600',
  },
  {
    icon: Rocket,
    title: 'Launch Your Funding Campaign',
    description: 'AI startups can create campaigns with transparent metrics, track investor interest, and manage funding rounds in one platform.',
    color: 'orange',
    gradient: 'from-orange-500 to-orange-600',
    bgColor: 'bg-orange-50',
    iconColor: 'text-orange-600',
  },
];

export function FeaturesSection() {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  return (
    <section ref={ref} className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            Everything You Need to <span className="text-blue-600">Invest with Confidence</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Powerful features designed for both AI startups and investors
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 30 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="group relative"
            >
              <div className="h-full bg-white border border-gray-200 rounded-2xl p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                {/* Icon */}
                <div className={`${feature.bgColor} w-14 h-14 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  <feature.icon className={`h-7 w-7 ${feature.iconColor}`} />
                </div>

                {/* Content */}
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {feature.description}
                </p>

                {/* Hover gradient border effect */}
                <div className={`absolute inset-0 rounded-2xl bg-gradient-to-r ${feature.gradient} opacity-0 group-hover:opacity-10 transition-opacity -z-10`} />
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
