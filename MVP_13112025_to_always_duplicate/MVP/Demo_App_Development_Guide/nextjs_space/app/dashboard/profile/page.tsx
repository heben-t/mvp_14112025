'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Building2, 
  Mail, 
  Globe, 
  Calendar,
  CheckCircle2,
  XCircle,
  Clock,
  Save,
  Edit2,
  User,
  Briefcase,
  MapPin,
  DollarSign,
  Shield,
  FileText,
  TrendingUp,
} from 'lucide-react';
import { toast } from 'sonner';

interface UserProfile {
  id: string;
  email: string;
  name: string | null;
  role: 'STARTUP' | 'INVESTOR';
  image: string | null;
  emailVerified: string | null;
  createdAt: Date;
  startupProfile?: {
    id: string;
    companyName: string;
    logo: string | null;
    industry: string;
    stage: string;
    description: string | null;
    website: string | null;
    geographicPresence: string | null;
    kyc_status: string;
    profile_completion_score: number;
    business_license: string | null;
    founder_id_document: string | null;
  };
  investorProfile?: {
    id: string;
    professional_title: string | null;
    investment_focus: string | null;
    ticket_size: string | null;
    accreditation_status: string;
    accreditation_document: string | null;
    investorType: string | null;
  };
}

export default function ProfilePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [formData, setFormData] = useState<any>({});

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await fetch('/api/profile');
      
      if (response.ok) {
        const data = await response.json();
        setProfile(data.profile);
        initializeFormData(data.profile);
      } else if (response.status === 404) {
        toast.error('Profile not found');
        router.push('/dashboard');
      } else {
        toast.error('Failed to load profile');
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      toast.error('An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const initializeFormData = (profileData: UserProfile) => {
    if (profileData.role === 'STARTUP' && profileData.startupProfile) {
      setFormData({
        name: profileData.name || '',
        companyName: profileData.startupProfile.companyName || '',
        industry: profileData.startupProfile.industry || '',
        stage: profileData.startupProfile.stage || '',
        description: profileData.startupProfile.description || '',
        website: profileData.startupProfile.website || '',
        location: profileData.startupProfile.geographicPresence || '',
      });
    } else if (profileData.role === 'INVESTOR' && profileData.investorProfile) {
      setFormData({
        name: profileData.name || '',
        professionalTitle: profileData.investorProfile.professional_title || '',
        investmentFocus: profileData.investorProfile.investment_focus || '',
        ticketSize: profileData.investorProfile.ticket_size || '',
      });
    }
  };

  // Calculate profile completion for startup
  const calculateStartupCompletion = (startupProfile: any) => {
    const fields = [
      startupProfile.companyName,
      startupProfile.industry,
      startupProfile.stage,
      startupProfile.description,
      startupProfile.website,
      startupProfile.geographicPresence,
      profile?.name, // User's name
    ];
    
    const filledFields = fields.filter(field => field && field.trim() !== '').length;
    const totalFields = fields.length;
    
    return Math.round((filledFields / totalFields) * 100);
  };

  // Calculate profile completion for investor
  const calculateInvestorCompletion = (investorProfile: any) => {
    const fields = [
      profile?.name,
      investorProfile.professional_title,
      investorProfile.investment_focus,
      investorProfile.ticket_size,
    ];
    
    const filledFields = fields.filter(field => field && field.trim() !== '').length;
    const totalFields = fields.length;
    
    return Math.round((filledFields / totalFields) * 100);
  };

  // Get missing fields for startup
  const getMissingStartupFields = (startupProfile: any) => {
    const fieldLabels: Record<string, string> = {
      companyName: 'Company Name',
      industry: 'Industry',
      stage: 'Stage',
      description: 'Company Description',
      website: 'Website',
      geographicPresence: 'Location',
      name: 'Your Name',
    };

    const fields = {
      companyName: startupProfile.companyName,
      industry: startupProfile.industry,
      stage: startupProfile.stage,
      description: startupProfile.description,
      website: startupProfile.website,
      geographicPresence: startupProfile.geographicPresence,
      name: profile?.name,
    };

    return Object.entries(fields)
      .filter(([_, value]) => !value || (typeof value === 'string' && value.trim() === ''))
      .map(([key, _]) => fieldLabels[key]);
  };

  // Get missing fields for investor
  const getMissingInvestorFields = (investorProfile: any) => {
    const fieldLabels: Record<string, string> = {
      name: 'Your Name',
      professional_title: 'Professional Title',
      investment_focus: 'Investment Focus',
      ticket_size: 'Typical Ticket Size',
    };

    const fields = {
      name: profile?.name,
      professional_title: investorProfile.professional_title,
      investment_focus: investorProfile.investment_focus,
      ticket_size: investorProfile.ticket_size,
    };

    return Object.entries(fields)
      .filter(([_, value]) => !value || (typeof value === 'string' && value.trim() === ''))
      .map(([key, _]) => fieldLabels[key]);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const response = await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        toast.success('Profile updated successfully');
        setEditing(false);
        fetchProfile();
      } else {
        toast.error('Failed to update profile');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('An error occurred');
    } finally {
      setSaving(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' }> = {
      VERIFIED: { label: 'Verified', variant: 'default' },
      PENDING: { label: 'Pending', variant: 'secondary' },
      REJECTED: { label: 'Rejected', variant: 'destructive' },
    };
    const statusInfo = statusMap[status] || { label: status, variant: 'secondary' };
    return (
      <Badge variant={statusInfo.variant} className="ml-2">
        {statusInfo.variant === 'default' && <CheckCircle2 className="h-3 w-3 mr-1" />}
        {statusInfo.variant === 'secondary' && <Clock className="h-3 w-3 mr-1" />}
        {statusInfo.variant === 'destructive' && <XCircle className="h-3 w-3 mr-1" />}
        {statusInfo.label}
      </Badge>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-slate-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return null;
  }

  const isStartup = profile.role === 'STARTUP';
  const isInvestor = profile.role === 'INVESTOR';

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="container py-8">
        <div className="max-w-5xl mx-auto space-y-6">
          
          {/* Header Card */}
          <Card className="border-0 shadow-lg overflow-hidden">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 h-32"></div>
            <CardContent className="relative px-8 pb-8">
              <div className="flex flex-col md:flex-row items-start md:items-end gap-6 -mt-16">
                <Avatar className="h-32 w-32 border-4 border-white shadow-xl">
                  <AvatarImage src={profile.image || undefined} />
                  <AvatarFallback className="bg-gradient-to-br from-blue-100 to-indigo-100 text-3xl font-bold text-blue-600">
                    {profile.name?.charAt(0) || profile.email.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h1 className="text-3xl font-bold text-slate-900">
                      {isStartup ? profile.startupProfile?.companyName : profile.name || 'Investor'}
                    </h1>
                    <Badge variant={isStartup ? 'default' : 'secondary'} className="px-3 py-1">
                      {profile.role}
                    </Badge>
                  </div>
                  <div className="flex flex-wrap gap-4 text-sm text-slate-600">
                    <div className="flex items-center gap-1">
                      <Mail className="h-4 w-4" />
                      <span>{profile.email}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      <span>Joined {new Date(profile.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
                <Button
                  size="lg"
                  onClick={() => editing ? handleSave() : setEditing(true)}
                  disabled={saving}
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                >
                  {saving ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                      Saving...
                    </>
                  ) : editing ? (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Save Changes
                    </>
                  ) : (
                    <>
                      <Edit2 className="h-4 w-4 mr-2" />
                      Edit Profile
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Startup Profile */}
          {isStartup && profile.startupProfile && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Main Profile Info */}
              <div className="lg:col-span-2 space-y-6">
                <Card className="border-0 shadow-lg">
                  <CardHeader className="bg-gradient-to-r from-slate-50 to-slate-100 border-b">
                    <CardTitle className="flex items-center gap-2">
                      <Building2 className="h-5 w-5 text-blue-600" />
                      Company Information
                    </CardTitle>
                    <CardDescription>Manage your startup's public profile</CardDescription>
                  </CardHeader>
                  <CardContent className="p-6 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="companyName">Company Name</Label>
                        {editing ? (
                          <Input
                            id="companyName"
                            value={formData.companyName}
                            onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                          />
                        ) : (
                          <p className="text-slate-900 font-medium">{profile.startupProfile.companyName}</p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="industry">Industry</Label>
                        {editing ? (
                          <Input
                            id="industry"
                            value={formData.industry}
                            onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                          />
                        ) : (
                          <p className="text-slate-900 font-medium">{profile.startupProfile.industry}</p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="stage">Stage</Label>
                        {editing ? (
                          <Input
                            id="stage"
                            value={formData.stage}
                            onChange={(e) => setFormData({ ...formData, stage: e.target.value })}
                          />
                        ) : (
                          <p className="text-slate-900 font-medium">{profile.startupProfile.stage}</p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="location">Location</Label>
                        {editing ? (
                          <Input
                            id="location"
                            value={formData.location}
                            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                            placeholder="City, Country"
                          />
                        ) : (
                          <p className="text-slate-900 font-medium">{profile.startupProfile.geographicPresence || 'Not specified'}</p>
                        )}
                      </div>

                      <div className="space-y-2 md:col-span-2">
                        <Label htmlFor="website">Website</Label>
                        {editing ? (
                          <Input
                            id="website"
                            type="url"
                            value={formData.website}
                            onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                            placeholder="https://yourcompany.com"
                          />
                        ) : (
                          profile.startupProfile.website ? (
                            <a
                              href={profile.startupProfile.website}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:underline flex items-center gap-1"
                            >
                              <Globe className="h-4 w-4" />
                              {profile.startupProfile.website}
                            </a>
                          ) : (
                            <p className="text-slate-500">Not specified</p>
                          )
                        )}
                      </div>

                      <div className="space-y-2 md:col-span-2">
                        <Label htmlFor="description">Company Description</Label>
                        {editing ? (
                          <Textarea
                            id="description"
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            rows={4}
                            placeholder="Tell us about your company..."
                          />
                        ) : (
                          <p className="text-slate-700 whitespace-pre-wrap">
                            {profile.startupProfile.description || 'No description provided'}
                          </p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* KYC Status */}
                <Card className="border-0 shadow-lg bg-gradient-to-br from-slate-50 to-slate-100">
                  <CardHeader className="border-b bg-white/50">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Shield className="h-5 w-5 text-blue-600" />
                      Verification Status
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="flex flex-col items-center justify-center py-8">
                      <div className="h-16 w-16 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center mb-4">
                        <Shield className="h-8 w-8 text-blue-600" />
                      </div>
                      <h3 className="text-lg font-semibold text-slate-900 mb-2">Feature Coming Soon</h3>
                      <p className="text-sm text-slate-600 text-center max-w-xs">
                        KYC verification system will be available soon. You can create campaigns without verification for now.
                      </p>
                    </div>
                  </CardContent>
                </Card>

                {/* Profile Completion */}
                <Card className="border-0 shadow-lg">
                  <CardHeader className="border-b">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <TrendingUp className="h-5 w-5 text-blue-600" />
                      Profile Completion
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    {(() => {
                      const completionScore = calculateStartupCompletion(profile.startupProfile);
                      const missingFields = getMissingStartupFields(profile.startupProfile);
                      
                      return (
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span className="text-slate-600">Progress</span>
                              <span className="font-semibold text-slate-900">
                                {completionScore}%
                              </span>
                            </div>
                            <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-gradient-to-r from-blue-600 to-indigo-600 transition-all duration-500"
                                style={{ width: `${completionScore}%` }}
                              />
                            </div>
                          </div>
                          
                          {missingFields.length > 0 && (
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                              <p className="text-sm font-semibold text-blue-900 mb-2">
                                Complete your profile
                              </p>
                              <ul className="space-y-1">
                                {missingFields.map((field, idx) => (
                                  <li key={idx} className="text-xs text-blue-700 flex items-center gap-2">
                                    <div className="h-1.5 w-1.5 bg-blue-600 rounded-full"></div>
                                    {field}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}

                          {completionScore === 100 && (
                            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                              <p className="text-sm text-green-800 flex items-center gap-2">
                                <CheckCircle2 className="h-4 w-4" />
                                Your profile is complete!
                              </p>
                            </div>
                          )}
                        </div>
                      );
                    })()}
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {/* Investor Profile */}
          {isInvestor && profile.investorProfile && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Main Profile Info */}
              <div className="lg:col-span-2 space-y-6">
                <Card className="border-0 shadow-lg">
                  <CardHeader className="bg-gradient-to-r from-slate-50 to-slate-100 border-b">
                    <CardTitle className="flex items-center gap-2">
                      <Briefcase className="h-5 w-5 text-blue-600" />
                      Investor Information
                    </CardTitle>
                    <CardDescription>Manage your investor profile</CardDescription>
                  </CardHeader>
                  <CardContent className="p-6 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2 md:col-span-2">
                        <Label htmlFor="name">Full Name</Label>
                        {editing ? (
                          <Input
                            id="name"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          />
                        ) : (
                          <p className="text-slate-900 font-medium">{profile.name || 'Not specified'}</p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="professionalTitle">Professional Title</Label>
                        {editing ? (
                          <Input
                            id="professionalTitle"
                            value={formData.professionalTitle}
                            onChange={(e) => setFormData({ ...formData, professionalTitle: e.target.value })}
                            placeholder="e.g., Angel Investor, VC Partner"
                          />
                        ) : (
                          <p className="text-slate-900 font-medium">
                            {profile.investorProfile.professional_title || 'Not specified'}
                          </p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="ticketSize">Typical Ticket Size</Label>
                        {editing ? (
                          <Input
                            id="ticketSize"
                            value={formData.ticketSize}
                            onChange={(e) => setFormData({ ...formData, ticketSize: e.target.value })}
                            placeholder="e.g., $10K - $50K"
                          />
                        ) : (
                          <p className="text-slate-900 font-medium">
                            {profile.investorProfile.ticket_size || 'Not specified'}
                          </p>
                        )}
                      </div>

                      <div className="space-y-2 md:col-span-2">
                        <Label htmlFor="investmentFocus">Investment Focus</Label>
                        {editing ? (
                          <Textarea
                            id="investmentFocus"
                            value={formData.investmentFocus}
                            onChange={(e) => setFormData({ ...formData, investmentFocus: e.target.value })}
                            rows={3}
                            placeholder="Describe your investment interests and focus areas..."
                          />
                        ) : (
                          <p className="text-slate-700 whitespace-pre-wrap">
                            {profile.investorProfile.investment_focus || 'No investment focus specified'}
                          </p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Accreditation Status */}
                <Card className="border-0 shadow-lg bg-gradient-to-br from-slate-50 to-slate-100">
                  <CardHeader className="border-b bg-white/50">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Shield className="h-5 w-5 text-blue-600" />
                      Accreditation
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="flex flex-col items-center justify-center py-8">
                      <div className="h-16 w-16 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center mb-4">
                        <Shield className="h-8 w-8 text-blue-600" />
                      </div>
                      <h3 className="text-lg font-semibold text-slate-900 mb-2">Feature Coming Soon</h3>
                      <p className="text-sm text-slate-600 text-center max-w-xs">
                        Accreditation verification system will be available soon.
                      </p>
                    </div>
                  </CardContent>
                </Card>

                {/* Investor Type */}
                {profile.investorProfile.investorType && (
                  <Card className="border-0 shadow-lg">
                    <CardHeader className="border-b">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <User className="h-5 w-5 text-blue-600" />
                        Investor Type
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6">
                      <Badge variant="secondary" className="px-3 py-1.5 text-base">
                        {profile.investorProfile.investorType}
                      </Badge>
                    </CardContent>
                  </Card>
                )}

                {/* Investor Profile Completion */}
                <Card className="border-0 shadow-lg">
                  <CardHeader className="border-b">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <TrendingUp className="h-5 w-5 text-blue-600" />
                      Profile Completion
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    {(() => {
                      const completionScore = calculateInvestorCompletion(profile.investorProfile);
                      const missingFields = getMissingInvestorFields(profile.investorProfile);
                      
                      return (
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span className="text-slate-600">Progress</span>
                              <span className="font-semibold text-slate-900">
                                {completionScore}%
                              </span>
                            </div>
                            <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-gradient-to-r from-blue-600 to-indigo-600 transition-all duration-500"
                                style={{ width: `${completionScore}%` }}
                              />
                            </div>
                          </div>
                          
                          {missingFields.length > 0 && (
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                              <p className="text-sm font-semibold text-blue-900 mb-2">
                                Complete your profile
                              </p>
                              <ul className="space-y-1">
                                {missingFields.map((field, idx) => (
                                  <li key={idx} className="text-xs text-blue-700 flex items-center gap-2">
                                    <div className="h-1.5 w-1.5 bg-blue-600 rounded-full"></div>
                                    {field}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}

                          {completionScore === 100 && (
                            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                              <p className="text-sm text-green-800 flex items-center gap-2">
                                <CheckCircle2 className="h-4 w-4" />
                                Your profile is complete!
                              </p>
                            </div>
                          )}
                        </div>
                      );
                    })()}
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
