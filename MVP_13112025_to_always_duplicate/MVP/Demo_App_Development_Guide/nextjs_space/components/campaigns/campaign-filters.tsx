'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Filter, X } from 'lucide-react';

const INDUSTRIES = [
  'All Industries',
  'Technology',
  'Healthcare',
  'Finance',
  'E-commerce',
  'Education',
  'Real Estate',
  'Manufacturing',
  'Other',
];

const STAGES = [
  'All Stages',
  'Idea',
  'MVP',
  'Pre-seed',
  'Seed',
  'Series A',
  'Series B+',
];

const FUNDING_RANGES = [
  { label: 'Any Amount', min: '', max: '' },
  { label: 'Under $100K', min: '', max: '100000' },
  { label: '$100K - $500K', min: '100000', max: '500000' },
  { label: '$500K - $1M', min: '500000', max: '1000000' },
  { label: '$1M - $5M', min: '1000000', max: '5000000' },
  { label: 'Over $5M', min: '5000000', max: '' },
];

export function CampaignFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isOpen, setIsOpen] = useState(false);

  const [filters, setFilters] = useState({
    search: searchParams.get('search') || '',
    industry: searchParams.get('industry') || 'all',
    stage: searchParams.get('stage') || 'all',
    fundingRange: '0',
  });

  const applyFilters = () => {
    const params = new URLSearchParams();

    if (filters.search) params.set('search', filters.search);
    if (filters.industry !== 'all') params.set('industry', filters.industry);
    if (filters.stage !== 'all') params.set('stage', filters.stage);

    const range = FUNDING_RANGES[parseInt(filters.fundingRange)];
    if (range.min) params.set('minGoal', range.min);
    if (range.max) params.set('maxGoal', range.max);

    router.push(`/discover?${params.toString()}`);
    setIsOpen(false);
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      industry: 'all',
      stage: 'all',
      fundingRange: '0',
    });
    router.push('/discover');
  };

  const hasActiveFilters = 
    filters.search || 
    filters.industry !== 'all' || 
    filters.stage !== 'all' || 
    filters.fundingRange !== '0';

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filter Campaigns
          </CardTitle>
          {hasActiveFilters && (
            <Button variant="ghost" size="sm" onClick={clearFilters}>
              <X className="h-4 w-4 mr-2" />
              Clear Filters
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="search">Search</Label>
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              id="search"
              placeholder="Search campaigns or companies..."
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              className="pl-9"
              onKeyDown={(e) => e.key === 'Enter' && applyFilters()}
            />
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="industry">Industry</Label>
            <Select
              value={filters.industry}
              onValueChange={(value) => setFilters({ ...filters, industry: value })}
            >
              <SelectTrigger id="industry">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {INDUSTRIES.map((industry) => (
                  <SelectItem 
                    key={industry} 
                    value={industry === 'All Industries' ? 'all' : industry}
                  >
                    {industry}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="stage">Stage</Label>
            <Select
              value={filters.stage}
              onValueChange={(value) => setFilters({ ...filters, stage: value })}
            >
              <SelectTrigger id="stage">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {STAGES.map((stage) => (
                  <SelectItem 
                    key={stage} 
                    value={stage === 'All Stages' ? 'all' : stage}
                  >
                    {stage}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="fundingRange">Funding Goal</Label>
            <Select
              value={filters.fundingRange}
              onValueChange={(value) => setFilters({ ...filters, fundingRange: value })}
            >
              <SelectTrigger id="fundingRange">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {FUNDING_RANGES.map((range, index) => (
                  <SelectItem key={index} value={index.toString()}>
                    {range.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <Button onClick={applyFilters} className="w-full">
          Apply Filters
        </Button>
      </CardContent>
    </Card>
  );
}
