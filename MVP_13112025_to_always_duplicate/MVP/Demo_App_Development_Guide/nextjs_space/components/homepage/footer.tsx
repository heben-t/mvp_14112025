'use client';

import Link from 'next/link';
import { Linkedin, Mail, Twitter } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-gray-900 text-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div className="col-span-1">
            <h3 className="text-2xl font-bold text-white mb-4">HEBED AI</h3>
            <p className="text-gray-400 text-sm leading-relaxed">
              Connecting AI startups with transparent metrics to smart investors worldwide.
            </p>
          </div>

          {/* Product */}
          <div>
            <h4 className="font-semibold text-white mb-4">Product</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/discover" className="text-gray-400 hover:text-white transition-colors">
                  Discover Startups
                </Link>
              </li>
              <li>
                <Link href="/pricing" className="text-gray-400 hover:text-white transition-colors">
                  Pricing
                </Link>
              </li>
              <li>
                <Link href="/#features" className="text-gray-400 hover:text-white transition-colors">
                  Features
                </Link>
              </li>
              <li>
                <Link href="/#how-it-works" className="text-gray-400 hover:text-white transition-colors">
                  How It Works
                </Link>
              </li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="font-semibold text-white mb-4">Company</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/#team" className="text-gray-400 hover:text-white transition-colors">
                  Team
                </Link>
              </li>
              <li>
                <a 
                  href="https://www.linkedin.com/company/hebedai" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  LinkedIn
                </a>
              </li>
              <li>
                <Link href="/legal/privacy" className="text-gray-400 hover:text-white transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/legal/terms" className="text-gray-400 hover:text-white transition-colors">
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-semibold text-white mb-4">Contact</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a 
                  href="mailto:contact.hebedai@gmail.com" 
                  className="text-gray-400 hover:text-white transition-colors inline-flex items-center gap-2"
                >
                  <Mail className="h-4 w-4" />
                  contact.hebedai@gmail.com
                </a>
              </li>
              <li className="pt-4">
                <div className="flex gap-3">
                  <a
                    href="https://www.linkedin.com/company/hebedai"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-blue-600 transition-colors"
                  >
                    <Linkedin className="h-5 w-5" />
                  </a>
                </div>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-gray-400 text-sm text-center md:text-left">
            © {new Date().getFullYear()} HEBED AI. All rights reserved.
          </p>
          <div className="flex gap-6 text-sm text-gray-400">
            <Link href="/legal/privacy" className="hover:text-white transition-colors">
              Privacy
            </Link>
            <Link href="/legal/terms" className="hover:text-white transition-colors">
              Terms
            </Link>
            <Link href="/legal/cookies" className="hover:text-white transition-colors">
              Cookies
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
