'use client';

import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase-client';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import { 
  LayoutDashboard, 
  TrendingUp, 
  User, 
  LogOut,
  Menu,
  X,
  Briefcase
} from 'lucide-react';

interface UserSession {
  id: string;
  email: string;
  name: string | null;
  role: 'STARTUP' | 'INVESTOR';
}

export default function Navigation() {
  const [user, setUser] = useState<UserSession | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        // Fetch user data from public.users
        supabase
          .from('users')
          .select('id, email, name, role')
          .eq('id', session.user.id)
          .single()
          .then(({ data }) => {
            if (data) {
              setUser(data as UserSession);
            }
            setLoading(false);
          });
      } else {
        setLoading(false);
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        supabase
          .from('users')
          .select('id, email, name, role')
          .eq('id', session.user.id)
          .single()
          .then(({ data }) => {
            if (data) {
              setUser(data as UserSession);
            }
          });
      } else {
        setUser(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/auth/signin');
  };

  if (loading || !user) {
    return null;
  }

  const isActive = (path: string) => pathname === path;

  const navItems = user.role === 'STARTUP'
    ? [
        { label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
        { label: 'Discover', icon: TrendingUp, path: '/discover' },
        { label: 'Profile', icon: User, path: '/dashboard/profile' },
      ]
    : [
        { label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
        { label: 'Discover', icon: TrendingUp, path: '/discover' },
        { label: 'Portfolio', icon: Briefcase, path: '/coming-soon' },
        { label: 'Profile', icon: User, path: '/dashboard/profile' },
      ];


  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <button
              onClick={() => router.push('/')}
              className="flex items-center hover:opacity-80 transition-opacity"
            >
              <Image
                src="/logo.png"
                alt="HEBED AI Logo"
                width={32}
                height={32}
                className="object-contain"
                priority
              />
            </button>
            
            <div className="hidden md:flex ml-10 space-x-4">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.path}
                    onClick={() => router.push(item.path)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      isActive(item.path)
                        ? 'bg-blue-50 text-blue-700'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {item.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-3">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">{user.name || user.email}</p>
                <p className="text-xs text-gray-600">{user.role}</p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleSignOut}
              >
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            </div>

            <button
              className="md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? (
                <X className="h-6 w-6 text-gray-700" />
              ) : (
                <Menu className="h-6 w-6 text-gray-700" />
              )}
            </button>
          </div>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="md:hidden border-t border-gray-200">
          <div className="px-2 pt-2 pb-3 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.path}
                  onClick={() => {
                    router.push(item.path);
                    setMobileMenuOpen(false);
                  }}
                  className={`flex items-center gap-2 w-full px-3 py-2 rounded-md text-base font-medium ${
                    isActive(item.path)
                      ? 'bg-blue-50 text-blue-700'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  {item.label}
                </button>
              );
            })}
            <button
              onClick={() => signOut({ callbackUrl: '/auth/signin' })}
              className="flex items-center gap-2 w-full px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-50"
            >
              <LogOut className="h-5 w-5" />
              Sign Out
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}
