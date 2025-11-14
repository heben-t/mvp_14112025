import { LegalLayout } from '@/components/legal/legal-layout';
import { FileText } from 'lucide-react';

export default function TermsPage() {
  return (
    <LegalLayout 
      title="Terms of Service" 
      lastUpdated="January 2024"
      icon={<FileText className="h-10 w-10 text-white" />}
    >
      <section className="mb-8">
        <h2>1. Acceptance of Terms</h2>
        <p>
          By accessing and using HEBED AI, you accept and agree to be bound by these terms. 
          If you do not agree, please do not use the Service.
        </p>
      </section>

      <section className="mb-8">
        <h2>2. Description of Service</h2>
        <p>
          HEBED AI is a marketplace platform connecting AI startups with investors, providing:
        </p>
        <ul>
          <li>Campaign creation and management tools</li>
          <li>Investment opportunity discovery</li>
          <li>Verified metrics and ROI tracking</li>
          <li>Secure payment processing</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2>3. User Accounts</h2>
        <p>You must be at least 18 years old and provide accurate information.</p>
      </section>

      <section className="mb-8">
        <h2>4. Investment Risks</h2>
        <p>
          Investing in startups involves significant risk. You may lose your entire investment.
        </p>
      </section>

      <section className="mb-8">
        <h2>5. Fees</h2>
        <p>
          Startups pay 5% success fee on funds raised. Investors may incur subscription fees.
        </p>
      </section>

      <section className="mb-8">
        <h2>6. Contact Us</h2>
        <p>Email: contact.hebedai@gmail.com</p>
      </section>
    </LegalLayout>
  );
}
