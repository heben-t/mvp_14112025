'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Building2, 
  Mail, 
  Globe, 
  Calendar,
  CheckCircle2,
  XCircle,
  Clock,
  Upload,
  Save,
  Edit2,
  User
} from 'lucide-react';
import { toast } from 'sonner';

interface UserProfile {
  id: string;
  email: string;
  name: string | null;
  role: 'STARTUP' | 'INVESTOR';
  image: string | null;
  emailVerified: Date | null;
  createdAt: Date;
  startupProfile?: {
    id: string;
    companyName: string;
    logo: string | null;
    industry: string;
    stage: string;
    description: string | null;
    website: string | null;
    kycStatus: string;
    profileCompletionScore: number;
    businessLicense: string | null;
    founderIdDocument: string | null;
  };
  investorProfile?: {
    id: string;
    professionalTitle: string | null;
    investmentFocus: string | null;
    ticketSize: string | null;
    accreditationStatus: string;
    accreditationDocument: string | null;
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
      });
    } else if (profileData.role === 'INVESTOR' && profileData.investorProfile) {
      setFormData({
        name: profileData.name || '',
        professionalTitle: profileData.investorProfile.professionalTitle || '',
        investmentFocus: profileData.investorProfile.investmentFocus || '',
        ticketSize: profileData.investorProfile.ticketSize || '',
      });
    }
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
      APPROVED: { label: 'Approved', variant: 'default' },
      PENDING: { label: 'Pending', variant: 'secondary' },
      REJECTED: { label: 'Rejected', variant: 'destructive' },
    };

    const statusInfo = statusMap[status] || { label: status, variant: 'secondary' };
    
    return (
      <Badge variant={statusInfo.variant} className="ml-2">
        {status === 'APPROVED' && <CheckCircle2 className="w-3 h-3 mr-1" />}
        {status === 'PENDING' && <Clock className="w-3 h-3 mr-1" />}
        {status === 'REJECTED' && <XCircle className="w-3 h-3 mr-1" />}
        {statusInfo.label}
      </Badge>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="max-w-md w-full">
          <CardHeader>
            <CardTitle>Profile Not Found</CardTitle>
            <CardDescription>Unable to load your profile information</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => router.push('/dashboard')} className="w-full">
              Return to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container max-w-5xl py-8 space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-6">
          <Avatar className="h-24 w-24">
            <AvatarImage src={profile.image || ''} alt={profile.name || ''} />
            <AvatarFallback className="text-2xl">
              {profile.role === 'STARTUP' 
                ? profile.startupProfile?.companyName?.charAt(0) || 'S'
                : profile.name?.charAt(0) || 'I'
              }
            </AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-3xl font-bold">
              {profile.role === 'STARTUP' 
                ? profile.startupProfile?.companyName 
                : profile.name || 'Investor Profile'
              }
            </h1>
            <p className="text-muted-foreground flex items-center gap-2 mt-1">
              <Mail className="h-4 w-4" />
              {profile.email}
            </p>
            <div className="flex items-center gap-2 mt-2">
              <Badge variant="outline">{profile.role}</Badge>
              {profile.emailVerified && (
                <Badge variant="default" className="bg-green-600">
                  <CheckCircle2 className="h-3 w-3 mr-1" />
                  Verified
                </Badge>
              )}
            </div>
          </div>
        </div>
        <Button
          onClick={() => editing ? handleSave() : setEditing(true)}
          disabled={saving}
        >
          {saving ? (
            <>Saving...</>
          ) : editing ? (
            <><Save className="h-4 w-4 mr-2" /> Save Changes</>
          ) : (
            <><Edit2 className="h-4 w-4 mr-2" /> Edit Profile</>
          )}
        </Button>
      </div>

      <Separator />

      {/* Startup Profile */}
      {profile.role === 'STARTUP' && profile.startupProfile && (
        <Tabs defaultValue="overview" className="w-full">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="company">Company Details</TabsTrigger>
            <TabsTrigger value="verification">Verification Status</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Company Information</CardTitle>
                <CardDescription>Basic information about your company</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Company Name</Label>
                    {editing ? (
                      <Input
                        value={formData.companyName}
                        onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                      />
                    ) : (
                      <p className="text-sm font-medium mt-1">{profile.startupProfile.companyName}</p>
                    )}
                  </div>
                  <div>
                    <Label>Industry</Label>
                    {editing ? (
                      <Input
                        value={formData.industry}
                        onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                      />
                    ) : (
                      <p className="text-sm font-medium mt-1">{profile.startupProfile.industry}</p>
                    )}
                  </div>
                  <div>
                    <Label>Stage</Label>
                    {editing ? (
                      <Input
                        value={formData.stage}
                        onChange={(e) => setFormData({ ...formData, stage: e.target.value })}
                      />
                    ) : (
                      <p className="text-sm font-medium mt-1">{profile.startupProfile.stage}</p>
                    )}
                  </div>
                  <div>
                    <Label>Website</Label>
                    {editing ? (
                      <Input
                        type="url"
                        value={formData.website}
                        onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                      />
                    ) : (
                      <a 
                        href={profile.startupProfile.website || '#'} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-sm font-medium text-primary hover:underline mt-1 flex items-center gap-1"
                      >
                        <Globe className="h-3 w-3" />
                        {profile.startupProfile.website || 'Not provided'}
                      </a>
                    )}
                  </div>
                </div>

                <div>
                  <Label>Description</Label>
                  {editing ? (
                    <Textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      rows={4}
                    />
                  ) : (
                    <p className="text-sm text-muted-foreground mt-1">
                      {profile.startupProfile.description || 'No description provided'}
                    </p>
                  )}
                </div>

                <div className="pt-4">
                  <div className="flex items-center justify-between mb-2">
                    <Label>Profile Completion</Label>
                    <span className="text-sm font-medium">
                      {profile.startupProfile.profileCompletionScore}%
                    </span>
                  </div>
                  <div className="w-full bg-secondary rounded-full h-2">
                    <div 
                      className="bg-primary h-2 rounded-full transition-all"
                      style={{ width: `${profile.startupProfile.profileCompletionScore}%` }}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="company" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Company Documents</CardTitle>
                <CardDescription>Required verification documents</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Building2 className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">Business License</p>
                      <p className="text-sm text-muted-foreground">
                        {profile.startupProfile.businessLicense ? 'Uploaded' : 'Not uploaded'}
                      </p>
                    </div>
                  </div>
                  {profile.startupProfile.businessLicense ? (
                    <Button variant="outline" size="sm">View</Button>
                  ) : (
                    <Button variant="outline" size="sm">
                      <Upload className="h-4 w-4 mr-2" />
                      Upload
                    </Button>
                  )}
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <User className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">Founder ID Document</p>
                      <p className="text-sm text-muted-foreground">
                        {profile.startupProfile.founderIdDocument ? 'Uploaded' : 'Not uploaded'}
                      </p>
                    </div>
                  </div>
                  {profile.startupProfile.founderIdDocument ? (
                    <Button variant="outline" size="sm">View</Button>
                  ) : (
                    <Button variant="outline" size="sm">
                      <Upload className="h-4 w-4 mr-2" />
                      Upload
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="verification" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Verification Status</CardTitle>
                <CardDescription>KYC and verification information</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <p className="font-medium">KYC Status</p>
                      <p className="text-sm text-muted-foreground">Know Your Customer verification</p>
                    </div>
                    {getStatusBadge(profile.startupProfile.kycStatus)}
                  </div>

                  {profile.startupProfile.kycStatus === 'PENDING' && (
                    <div className="bg-yellow-50 dark:bg-yellow-900/10 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                      <p className="text-sm text-yellow-800 dark:text-yellow-200">
                        Your KYC verification is being reviewed. This typically takes 2-3 business days.
                      </p>
                    </div>
                  )}

                  {profile.startupProfile.kycStatus === 'REJECTED' && (
                    <div className="bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800 rounded-lg p-4">
                      <p className="text-sm text-red-800 dark:text-red-200">
                        Your KYC verification was rejected. Please contact support for more information.
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}

      {/* Investor Profile */}
      {profile.role === 'INVESTOR' && profile.investorProfile && (
        <Tabs defaultValue="overview" className="w-full">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="verification">Accreditation</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Investor Information</CardTitle>
                <CardDescription>Your professional details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Full Name</Label>
                    {editing ? (
                      <Input
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      />
                    ) : (
                      <p className="text-sm font-medium mt-1">{profile.name || 'Not provided'}</p>
                    )}
                  </div>
                  <div>
                    <Label>Professional Title</Label>
                    {editing ? (
                      <Input
                        value={formData.professionalTitle}
                        onChange={(e) => setFormData({ ...formData, professionalTitle: e.target.value })}
                      />
                    ) : (
                      <p className="text-sm font-medium mt-1">
                        {profile.investorProfile.professionalTitle || 'Not provided'}
                      </p>
                    )}
                  </div>
                  <div>
                    <Label>Investment Focus</Label>
                    {editing ? (
                      <Input
                        value={formData.investmentFocus}
                        onChange={(e) => setFormData({ ...formData, investmentFocus: e.target.value })}
                      />
                    ) : (
                      <p className="text-sm font-medium mt-1">
                        {profile.investorProfile.investmentFocus || 'Not specified'}
                      </p>
                    )}
                  </div>
                  <div>
                    <Label>Typical Ticket Size</Label>
                    {editing ? (
                      <Input
                        value={formData.ticketSize}
                        onChange={(e) => setFormData({ ...formData, ticketSize: e.target.value })}
                      />
                    ) : (
                      <p className="text-sm font-medium mt-1">
                        {profile.investorProfile.ticketSize || 'Not specified'}
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="verification" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Accreditation Status</CardTitle>
                <CardDescription>Investor accreditation verification</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <p className="font-medium">Accreditation Status</p>
                      <p className="text-sm text-muted-foreground">Accredited investor verification</p>
                    </div>
                    {getStatusBadge(profile.investorProfile.accreditationStatus)}
                  </div>

                  {profile.investorProfile.accreditationStatus === 'PENDING' && (
                    <div className="bg-yellow-50 dark:bg-yellow-900/10 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                      <p className="text-sm text-yellow-800 dark:text-yellow-200">
                        Your accreditation is being reviewed. This typically takes 2-3 business days.
                      </p>
                    </div>
                  )}

                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <User className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="font-medium">Accreditation Document</p>
                        <p className="text-sm text-muted-foreground">
                          {profile.investorProfile.accreditationDocument ? 'Uploaded' : 'Not uploaded'}
                        </p>
                      </div>
                    </div>
                    {profile.investorProfile.accreditationDocument ? (
                      <Button variant="outline" size="sm">View</Button>
                    ) : (
                      <Button variant="outline" size="sm">
                        <Upload className="h-4 w-4 mr-2" />
                        Upload
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}

      {/* Account Information */}
      <Card>
        <CardHeader>
          <CardTitle>Account Information</CardTitle>
          <CardDescription>General account details</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between py-2">
            <span className="text-sm text-muted-foreground">Account Created</span>
            <span className="text-sm font-medium flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              {new Date(profile.createdAt).toLocaleDateString()}
            </span>
          </div>
          <div className="flex items-center justify-between py-2">
            <span className="text-sm text-muted-foreground">Email Verification</span>
            <span className="text-sm font-medium">
              {profile.emailVerified ? (
                <Badge variant="default" className="bg-green-600">
                  <CheckCircle2 className="h-3 w-3 mr-1" />
                  Verified
                </Badge>
              ) : (
                <Badge variant="secondary">
                  <Clock className="h-3 w-3 mr-1" />
                  Not Verified
                </Badge>
              )}
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
