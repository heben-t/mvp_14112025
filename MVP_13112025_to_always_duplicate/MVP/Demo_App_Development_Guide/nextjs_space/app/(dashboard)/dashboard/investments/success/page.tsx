import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle2, ArrowRight, FileText, TrendingUp } from 'lucide-react';

export default function InvestmentSuccessPage({
  searchParams,
}: {
  searchParams: { amount?: string; campaign?: string };
}) {
  const amount = searchParams.amount || '0';
  const campaignName = searchParams.campaign || 'this startup';

  return (
    <div className="container mx-auto py-16 px-4 max-w-3xl">
      <div className="text-center mb-8">
        <div className="mx-auto w-20 h-20 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mb-6">
          <CheckCircle2 className="h-12 w-12 text-green-600 dark:text-green-400" />
        </div>
        <h1 className="text-4xl font-bold mb-4">Investment Successful!</h1>
        <p className="text-xl text-muted-foreground">
          Thank you for investing ${parseFloat(amount).toLocaleString()} in {campaignName}
        </p>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>What Happens Next?</CardTitle>
          <CardDescription>Here's what to expect after your investment</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4">
            <div className="flex-shrink-0 w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center text-primary font-bold">
              1
            </div>
            <div>
              <h3 className="font-semibold mb-1">Startup Review</h3>
              <p className="text-sm text-muted-foreground">
                The startup will review your investment within 2-3 business days. You'll receive an email notification once they respond.
              </p>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="flex-shrink-0 w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center text-primary font-bold">
              2
            </div>
            <div>
              <h3 className="font-semibold mb-1">Escrow Protection</h3>
              <p className="text-sm text-muted-foreground">
                Your funds are held securely in escrow until the startup accepts your investment and completes the legal documentation.
              </p>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="flex-shrink-0 w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center text-primary font-bold">
              3
            </div>
            <div>
              <h3 className="font-semibold mb-1">Legal Documentation</h3>
              <p className="text-sm text-muted-foreground">
                Once accepted, you'll receive investment agreements and documentation to review and sign electronically.
              </p>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="flex-shrink-0 w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center text-primary font-bold">
              4
            </div>
            <div>
              <h3 className="font-semibold mb-1">Funds Transfer</h3>
              <p className="text-sm text-muted-foreground">
                After all documentation is signed, your investment will be transferred from escrow to the startup's account.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-3 gap-4 mb-8">
        <Card>
          <CardContent className="pt-6 text-center">
            <FileText className="h-8 w-8 mx-auto mb-3 text-primary" />
            <h3 className="font-semibold mb-2">Check Your Email</h3>
            <p className="text-sm text-muted-foreground">
              We've sent a confirmation email with investment details
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6 text-center">
            <TrendingUp className="h-8 w-8 mx-auto mb-3 text-primary" />
            <h3 className="font-semibold mb-2">Track Progress</h3>
            <p className="text-sm text-muted-foreground">
              Monitor your investment in your portfolio dashboard
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6 text-center">
            <CheckCircle2 className="h-8 w-8 mx-auto mb-3 text-primary" />
            <h3 className="font-semibold mb-2">Stay Updated</h3>
            <p className="text-sm text-muted-foreground">
              Receive updates on the startup's progress and milestones
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Button asChild size="lg">
          <Link href="/dashboard/investor/portfolio">
            <TrendingUp className="h-4 w-4 mr-2" />
            View Portfolio
          </Link>
        </Button>
        <Button asChild variant="outline" size="lg">
          <Link href="/campaigns">
            Explore More Campaigns
            <ArrowRight className="h-4 w-4 ml-2" />
          </Link>
        </Button>
      </div>

      <Card className="mt-8 bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
        <CardContent className="pt-6">
          <h3 className="font-semibold mb-2">Important Information</h3>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>• Your investment is subject to startup approval</li>
            <li>• Funds remain in escrow until all documentation is completed</li>
            <li>• You can cancel your investment before it's accepted by the startup</li>
            <li>• All investments are subject to our <Link href="/terms" className="text-primary hover:underline">Terms of Service</Link> and <Link href="/risk-disclosure" className="text-primary hover:underline">Risk Disclosure</Link></li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
