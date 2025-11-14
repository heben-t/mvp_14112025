import { CampaignForm } from '@/components/campaigns/campaign-form';
import { Sparkles } from 'lucide-react';

export default function CreateCampaignPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-50">
      <div className="container py-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8 text-center">
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-full px-4 py-2 mb-4">
              <Sparkles className="h-4 w-4" />
              <span className="text-sm font-medium">New Campaign</span>
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 text-transparent bg-clip-text mb-3">
              Create New Campaign
            </h1>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              Set up your fundraising campaign to attract investors and showcase your startup's potential
            </p>
          </div>
          <CampaignForm />
        </div>
      </div>
    </div>
  );
}
