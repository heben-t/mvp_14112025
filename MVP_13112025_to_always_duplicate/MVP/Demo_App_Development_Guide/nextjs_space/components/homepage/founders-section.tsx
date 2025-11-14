'use client';

import Image from 'next/image';
import { Linkedin, Mail } from 'lucide-react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { Button } from '@/components/ui/button';

const founders = [
  {
    name: 'Heben Tekleab',
    role: 'Co-Founder',
    education: 'Master in Information Systems - HES Lausanne, Switzerland',
    bio: 'Specialist in AI change management and organizational transformation. Developed frameworks for responsible AI adoption (e.g., intergenerational learning). Leads strategic direction and product vision, ensuring measurable trust.',
    image: '/images/heben-tekleab.png',
    linkedin: 'https://www.linkedin.com/in/heben-tekleab-009423158',
    email: 'contact.hebedai@gmail.com',
  },
  {
    name: 'Edward Tandia',
    role: 'Co-Founder',
    education: 'Master in Business Analytics - HEC Lausanne, Switzerland',
    bio: 'Expert in data science, analytics, and data protection. Bridges business strategy with technical execution for secure data systems. Leads product and data architecture, ensuring transparent, verifiable ROI.',
    image: '/images/edward-tandia.png',
    linkedin: 'https://www.linkedin.com/in/edward-tandia',
    email: 'contact.hebedai@gmail.com',
  },
];

function FounderCard({ founder, index }: { founder: typeof founders[0]; index: number }) {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay: index * 0.2 }}
      className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100 hover:shadow-2xl transition-all duration-300 group"
    >
      <div className="md:flex">
        {/* Photo */}
        <div className="md:w-1/3 relative h-64 md:h-auto bg-gradient-to-br from-blue-100 to-purple-100 overflow-hidden">
          <Image
            src={founder.image}
            alt={founder.name}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 33vw"
          />
        </div>

        {/* Content */}
        <div className="md:w-2/3 p-8">
          <h3 className="text-2xl font-bold text-gray-900 mb-2">
            {founder.name}
          </h3>
          <p className="text-blue-600 font-semibold mb-2">
            {founder.role}
          </p>
          <p className="text-sm text-gray-500 mb-4">
            {founder.education}
          </p>
          <p className="text-gray-600 leading-relaxed mb-6">
            {founder.bio}
          </p>

          {/* Social Links */}
          <div className="flex gap-3">
            <a
              href={founder.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Linkedin className="h-4 w-4" />
              <span className="text-sm font-medium">LinkedIn</span>
            </a>
            <a
              href={`mailto:${founder.email}`}
              className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              <Mail className="h-4 w-4" />
              <span className="text-sm font-medium">Email</span>
            </a>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export function FoundersSection() {
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
            The Founders
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Built by experts in AI transformation and data analytics
          </p>
        </motion.div>

        <div className="space-y-8 max-w-5xl mx-auto">
          {founders.map((founder, index) => (
            <FounderCard key={founder.name} founder={founder} index={index} />
          ))}
        </div>

        {/* Company LinkedIn */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="text-center mt-12"
        >
          <a
            href="https://www.linkedin.com/company/hebedai"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium text-lg group"
          >
            Follow HEBED AI on LinkedIn
            <Linkedin className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
          </a>
        </motion.div>
      </div>
    </section>
  );
}
