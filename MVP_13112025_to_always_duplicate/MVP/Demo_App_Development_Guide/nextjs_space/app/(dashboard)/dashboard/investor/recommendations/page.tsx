'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Loader2, Sparkles, TrendingUp, Target, ThumbsUp, ThumbsDown, Eye, Building2 } from 'lucide-react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

interface Recommendation {
  score: number;
  reasons: string[];
  campaigns: {
    id: string;
    title: string;
    description: string;
    industry: string;
    stage: string;
    fundraisingGoal: number;
    currentAmount: number;
    minInvestment: number;
    equityOffered: number;
    startup_profiles: {
      companyName: string;
      logo?: string;
    };
  };
}

export default function RecommendationsPage() {
  const router = useRouter();
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRecommendations();
  }, []);

  const fetchRecommendations = async () => {
    try {
      const response = await fetch('/api/recommendations');
      if (!response.ok) throw new Error('Failed to fetch recommendations');
      
      const data = await response.json();
      setRecommendations(data.recommendations);
    } catch (error) {
      console.error('Error fetching recommendations:', error);
      toast.error('Failed to load recommendations');
    } finally {
      setLoading(false);
    }
  };

  const trackEngagement = async (campaignId: string, action: string) => {
    try {
      const response = await fetch('/api/recommendations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ campaignId, action }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error tracking engagement:', error);
      // Don't throw - tracking failures shouldn't disrupt UX
      if (process.env.NODE_ENV === 'production') {
        // In production, you'd send this to monitoring service
      }
    }
  };

  const handleView = (campaignId: string) => {
    trackEngagement(campaignId, 'VIEW');
    router.push(`/campaigns/${campaignId}`);
  };

  const handleLike = async (campaignId: string) => {
    await trackEngagement(campaignId, 'LIKE');
    toast.success('Added to your interests');
  };

  const handleDislike = async (campaignId: string) => {
    await trackEngagement(campaignId, 'DISLIKE');
    setRecommendations(recs => recs.filter(r => r.campaigns.id !== campaignId));
    toast.success('Removed from recommendations');
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-100 dark:bg-green-950';
    if (score >= 60) return 'text-blue-600 bg-blue-100 dark:bg-blue-950';
    return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-950';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 80) return 'Excellent Match';
    if (score >= 60) return 'Good Match';
    return 'Potential Match';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <Sparkles className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold">AI-Powered Recommendations</h1>
        </div>
        <p className="text-muted-foreground">
          Personalized startup matches based on your investment preferences
        </p>
      </div>

      {recommendations.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Target className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-lg font-medium mb-2">No recommendations available</p>
            <p className="text-muted-foreground mb-4">
              Complete your investor profile to get personalized recommendations
            </p>
            <Button onClick={() => router.push('/dashboard/investor/profile')}>
              Update Profile
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {recommendations.map((rec, index) => {
            const progress = (rec.campaigns.currentAmount / rec.campaigns.fundraisingGoal) * 100;
            
            return (
              <Card key={rec.campaigns.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-3 flex-1">
                      {rec.campaigns.startup_profiles.logo ? (
                        <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-muted">
                          <Image
                            src={rec.campaigns.startup_profiles.logo}
                            alt={rec.campaigns.startup_profiles.companyName}
                            fill
                            className="object-cover"
                          />
                        </div>
                      ) : (
                        <div className="w-16 h-16 rounded-lg bg-primary/10 flex items-center justify-center">
                          <Building2 className="h-8 w-8 text-primary" />
                        </div>
                      )}
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant="outline" className="text-xs">
                            #{index + 1}
                          </Badge>
                          <Badge className={getScoreColor(rec.score)}>
                            {rec.score}% {getScoreLabel(rec.score)}
                          </Badge>
                        </div>
                        <CardTitle className="text-xl mb-1">
                          {rec.campaigns.startup_profiles.companyName}
                        </CardTitle>
                        <p className="text-sm text-muted-foreground">
                          {rec.campaigns.title}
                        </p>
                      </div>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  <div className="flex gap-2">
                    <Badge variant="secondary">{rec.campaigns.industry}</Badge>
                    <Badge variant="outline">{rec.campaigns.stage}</Badge>
                  </div>

                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {rec.campaigns.description}
                  </p>

                  <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                    <h4 className="font-semibold text-sm mb-2 flex items-center gap-2 text-blue-900 dark:text-blue-100">
                      <Target className="h-4 w-4" />
                      Why this matches you:
                    </h4>
                    <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
                      {rec.reasons.map((reason, i) => (
                        <li key={i}>• {reason}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Funding Progress</span>
                      <span className="font-medium">{progress.toFixed(0)}%</span>
                    </div>
                    <Progress value={progress} className="h-2" />
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">
                        ${rec.campaigns.currentAmount.toLocaleString()} raised
                      </span>
                      <span className="font-medium">
                        ${rec.campaigns.fundraisingGoal.toLocaleString()} goal
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 pt-2 border-t">
                    <div>
                      <p className="text-xs text-muted-foreground">Min Investment</p>
                      <p className="font-semibold">${rec.campaigns.minInvestment.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Equity Offered</p>
                      <p className="font-semibold">{rec.campaigns.equityOffered}%</p>
                    </div>
                  </div>

                  <div className="flex gap-2 pt-2">
                    <Button
                      className="flex-1"
                      onClick={() => handleView(rec.campaigns.id)}
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      View Details
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handleLike(rec.campaigns.id)}
                    >
                      <ThumbsUp className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handleDislike(rec.campaigns.id)}
                    >
                      <ThumbsDown className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
