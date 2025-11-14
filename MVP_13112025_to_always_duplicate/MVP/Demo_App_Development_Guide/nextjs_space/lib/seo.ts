import type { Metadata } from 'next';

export const siteConfig = {
  name: 'HEBED AI',
  description: 'The marketplace connecting AI startups with transparent metrics to VCs, business angels, and individual investors',
  url: 'https://HEBEDai.com',
  ogImage: 'https://HEBEDai.com/og-image.jpg',
  links: {
    linkedin: 'https://www.linkedin.com/company/hebedai'
  },
};

export const defaultMetadata: Metadata = {
  title: {
    default: 'HEBED AI - Transparent AI Startup Funding Marketplace',
    template: '%s | HEBED AI',
  },
  description: 'Discover AI startups with verified ROI metrics. Connect with VCs, business angels, and individual investors. Transparent funding marketplace for AI innovation.',
  keywords: [
    'AI startups',
    'startup funding',
    'venture capital',
    'investment marketplace',
    'ROI metrics',
    'business angels',
    'crowdfunding',
    'AI investment',
    'transparent funding',
    'verified metrics',
  ],
  authors: [
    {
      name: 'HEBED AI',
      url: 'https://HEBEDai.com',
    },
  ],
  creator: 'HEBED AI',
  metadataBase: new URL(siteConfig.url),
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: siteConfig.url,
    title: 'HEBED AI - Where AI Startups Meet Verified ROI & Smart Investors',
    description: siteConfig.description,
    siteName: siteConfig.name,
    images: [
      {
        url: siteConfig.ogImage,
        width: 1200,
        height: 630,
        alt: 'HEBED AI - AI Startup Funding Marketplace',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'HEBED AI - Transparent AI Startup Funding',
    description: siteConfig.description,
    images: [siteConfig.ogImage],
    creator: '@hebedai',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon-16x16.png',
    apple: '/apple-touch-icon.png',
  },
  manifest: '/site.webmanifest',
};
