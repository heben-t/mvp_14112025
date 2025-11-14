import { LegalLayout } from '@/components/legal/legal-layout';
import { Shield } from 'lucide-react';

export default function PrivacyPolicyPage() {
  return (
    <LegalLayout 
      title="Privacy Policy" 
      lastUpdated="January 2024"
      icon={<Shield className="h-10 w-10 text-white" />}
    >
      <section className="mb-8">
        <h2>1. Information We Collect</h2>
        <p>
          We collect several types of information to provide and improve our Service:
        </p>
        <h3>Personal Information</h3>
        <ul>
          <li>Name, email address, and contact information</li>
          <li>Account credentials and authentication data</li>
          <li>Profile information (investor preferences, startup details)</li>
          <li>Payment information (processed securely through Stripe)</li>
        </ul>
        <h3>Usage Information</h3>
        <ul>
          <li>Pages visited and features used</li>
          <li>Investment activity and portfolio data</li>
          <li>Device information and IP address</li>
          <li>Cookies and similar tracking technologies</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2>2. How We Use Your Information</h2>
        <p>
          We use collected information for:
        </p>
        <ul>
          <li>Providing and maintaining the Service</li>
          <li>Processing investments and transactions</li>
          <li>Sending notifications and updates</li>
          <li>Personalizing recommendations and content</li>
          <li>Analyzing usage patterns and improving our Service</li>
          <li>Detecting and preventing fraud and security issues</li>
          <li>Complying with legal obligations</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2>3. Information Sharing</h2>
        <p>
          We do not sell your personal information. We may share information with:
        </p>
        <ul>
          <li><strong>Service Providers:</strong> Payment processors (Stripe), email services, analytics providers</li>
          <li><strong>Other Users:</strong> Public profile information visible to other platform users</li>
          <li><strong>Legal Requirements:</strong> When required by law or to protect our rights</li>
          <li><strong>Business Transfers:</strong> In connection with a merger, sale, or acquisition</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2>4. Data Security</h2>
        <p>
          We implement industry-standard security measures to protect your information:
        </p>
        <ul>
          <li>Encryption of data in transit and at rest</li>
          <li>Regular security audits and monitoring</li>
          <li>Access controls and authentication</li>
          <li>Secure cloud infrastructure (Supabase)</li>
        </ul>
        <p>
          However, no method of transmission over the Internet is 100% secure. 
          We cannot guarantee absolute security.
        </p>
      </section>

      <section className="mb-8">
        <h2>5. Your Rights</h2>
        <p>
          You have the right to:
        </p>
        <ul>
          <li><strong>Access:</strong> Request a copy of your personal data</li>
          <li><strong>Correction:</strong> Update or correct inaccurate information</li>
          <li><strong>Deletion:</strong> Request deletion of your account and data</li>
          <li><strong>Portability:</strong> Export your data in a machine-readable format</li>
          <li><strong>Opt-out:</strong> Unsubscribe from marketing communications</li>
        </ul>
        <p>
          To exercise these rights, contact us at contact.hebedai@gmail.com
        </p>
      </section>

      <section className="mb-8">
        <h2>6. Cookies and Tracking</h2>
        <p>
          We use cookies and similar technologies to:
        </p>
        <ul>
          <li>Maintain your session and preferences</li>
          <li>Analyze site traffic and usage</li>
          <li>Provide personalized content</li>
        </ul>
        <p>
          You can control cookies through your browser settings.
        </p>
      </section>

      <section className="mb-8">
        <h2>7. Third-Party Services</h2>
        <p>
          Our Service integrates with:
        </p>
        <ul>
          <li><strong>Stripe:</strong> Payment processing</li>
          <li><strong>Supabase:</strong> Database and authentication</li>
          <li><strong>Analytics:</strong> Usage tracking (anonymized)</li>
        </ul>
        <p>
          These services have their own privacy policies governing their use of your information.
        </p>
      </section>

      <section className="mb-8">
        <h2>8. International Data Transfers</h2>
        <p>
          Your information may be transferred to and processed in countries other than your own. 
          We ensure appropriate safeguards are in place to protect your data in accordance with 
          this Privacy Policy.
        </p>
      </section>

      <section className="mb-8">
        <h2>9. Children Privacy</h2>
        <p>
          Our Service is not intended for users under 18 years of age. We do not knowingly 
          collect personal information from children. If you become aware that a child has 
          provided us with personal data, please contact us.
        </p>
      </section>

      <section className="mb-8">
        <h2>10. Changes to This Policy</h2>
        <p>
          We may update this Privacy Policy from time to time. We will notify you of any 
          changes by posting the new Privacy Policy on this page and updating the 
          Last updated date.
        </p>
        <p>
          We encourage you to review this Privacy Policy periodically for any changes.
        </p>
      </section>

      <section>
        <h2>11. Contact Us</h2>
        <p>
          If you have any questions about this Privacy Policy, please contact us:
        </p>
        <ul>
          <li><strong>Email:</strong> contact.hebedai@gmail.com</li>
          <li><strong>LinkedIn:</strong> HEBED AI Company Page</li>
        </ul>
      </section>
    </LegalLayout>
  );
}
