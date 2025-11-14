import { LegalLayout } from '@/components/legal/legal-layout';
import { AlertTriangle } from 'lucide-react';

export default function RiskDisclosurePage() {
  return (
    <LegalLayout 
      title="Risk Disclosure" 
      lastUpdated="January 2024"
      icon={<AlertTriangle className="h-10 w-10 text-white" />}
    >
      <div className="bg-red-50 border-l-4 border-red-600 p-6 mb-8 rounded-r-lg">
        <p className="font-bold text-red-900 mb-2">Important Notice</p>
        <p className="text-red-800">
          Investing in early-stage startups involves substantial risk and may not be suitable for all investors. 
          You should carefully consider whether such investing is appropriate for you in light of your financial 
          condition and ability to bear the risk of loss.
        </p>
      </div>

      <section className="mb-8">
        <h2>1. Risk of Loss</h2>
        <p>
          You may lose your entire investment. Early-stage companies have a high failure rate, and even successful 
          startups may take years to provide returns.
        </p>
      </section>

      <section className="mb-8">
        <h2>2. Illiquidity</h2>
        <p>
          Investments in startups are highly illiquid. There is no public market for shares, and you may not be 
          able to sell your investment when you want or need to.
        </p>
      </section>

      <section className="mb-8">
        <h2>3. Dilution</h2>
        <p>
          Your ownership stake may be diluted in future financing rounds. Startups often raise multiple rounds 
          of funding, which can significantly reduce your percentage ownership.
        </p>
      </section>

      <section className="mb-8">
        <h2>4. Limited Information</h2>
        <p>
          Unlike public companies, startups are not required to make regular disclosures. You may have limited 
          information about company performance and may not receive regular updates.
        </p>
      </section>

      <section className="mb-8">
        <h2>5. No Guarantee of Returns</h2>
        <p>
          There is no guarantee that you will receive any return on your investment. Many startups fail, 
          and even successful ones may not provide returns to early investors.
        </p>
      </section>

      <section className="mb-8">
        <h2>6. Platform Risk</h2>
        <p>
          HEBED AI does not guarantee the accuracy of information provided by startups. While we perform 
          verification of metrics, we do not conduct full due diligence on behalf of investors.
        </p>
      </section>

      <section className="mb-8">
        <h2>7. Regulatory Risk</h2>
        <p>
          The regulatory environment for crowdfunding and startup investing may change, potentially 
          affecting your investment or ability to invest.
        </p>
      </section>

      <section className="mb-8">
        <h2>8. No Investment Advice</h2>
        <p>
          HEBED AI does not provide investment, legal, or tax advice. You should consult with qualified 
          professionals before making investment decisions.
        </p>
      </section>

      <section className="mb-8">
        <h2>9. Accreditation Requirements</h2>
        <p>
          Certain investments may only be available to accredited investors. You are responsible for 
          understanding and complying with applicable investment restrictions.
        </p>
      </section>

      <section>
        <h2>10. Acknowledgment</h2>
        <p>
          By investing through HEBED AI, you acknowledge that you have read and understood this risk disclosure 
          and that you are able to bear the economic risk of losing your entire investment.
        </p>
        <p className="mt-4">
          For questions, contact: <strong>contact.hebedai@gmail.com</strong>
        </p>
      </section>
    </LegalLayout>
  );
}
