import { createServerSupabaseClient, getCurrentUser } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { 
  Navigation,
  HeroSection, 
  MissionSection, 
  FeaturesSection, 
  HowItWorksSection,
  UAEAdvantageSection,
  FoundersSection, 
  CTASection, 
  Footer 
} from '@/components/homepage';

export const metadata = {
  title: 'Hebed AI - The ROI Copilot Marketplace for AI Startups and Investors | UAE Vision 2031',
  description: 'The UAE\'s first ROI Copilot Marketplace where verified AI startups and global investors connect through transparency, trust, and real performance. Supporting UAE Vision 2031.',
  keywords: 'AI startups, UAE AI, ROI metrics, verified investment, AI funding, UAE Vision 2031, AI marketplace, transparent funding',
  openGraph: {
    title: 'Hebed AI - Turning AI Innovation Into Measurable Investment',
    description: 'The UAE\'s first ROI Copilot Marketplace connecting verified AI startups with global investors through measurable performance.',
    type: 'website',
    url: 'https://HEBEDai.com',
  },
};

export default async function Home() {
  const user = await getCurrentUser();

  if (user) {
    redirect('/dashboard');
  }

  return (
    <div className="min-h-screen bg-white">
      <Navigation />
      
      <main>
        <HeroSection />
        
        <section id="mission">
          <MissionSection />
        </section>
        
        <section id="features">
          <FeaturesSection />
        </section>
        
        <section id="how-it-works">
          <HowItWorksSection />
        </section>
        
        <section id="uae-advantage">
          <UAEAdvantageSection />
        </section>
        
        <section id="team">
          <FoundersSection />
        </section>
        
        <CTASection />
      </main>
      
      <Footer />
    </div>
  );
}
