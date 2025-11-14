import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const role = searchParams.get('role');
  const next = searchParams.get('next') ?? '/dashboard';

  console.log('🔄 OAuth Callback received:', { code: !!code, role, origin });

  if (code) {
    const cookieStore = cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value;
          },
          set(name: string, value: string, options: CookieOptions) {
            try {
              cookieStore.set({ name, value, ...options });
            } catch (error) {
              // Server component - cookies are read-only during render
            }
          },
          remove(name: string, options: CookieOptions) {
            try {
              cookieStore.set({ name, value: '', ...options });
            } catch (error) {
              // Server component - cookies are read-only during render
            }
          },
        },
      }
    );

    try {
      // Exchange authorization code for session
      const { data: sessionData, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);

      if (exchangeError) {
        console.error('❌ Auth code exchange error:', exchangeError);
        return NextResponse.redirect(`${origin}/auth/signin?error=auth_failed&message=${encodeURIComponent(exchangeError.message)}`);
      }

      if (!sessionData?.session?.user) {
        console.error('❌ No session or user after code exchange');
        return NextResponse.redirect(`${origin}/auth/signin?error=no_session`);
      }

      const user = sessionData.user;
      const userId = user.id;
      const userEmail = user.email || '';
      const userName = user.user_metadata?.full_name || user.user_metadata?.name || null;
      const userAvatar = user.user_metadata?.avatar_url || user.user_metadata?.picture || null;

      console.log(`✅ User authenticated via Google: ${userId} (${userEmail})`);

      // Check if user exists in public.users table
      const { data: existingUser, error: userCheckError } = await supabase
        .from('users')
        .select('id, role, name, email')
        .eq('id', userId)
        .maybeSingle();

      let isNewUser = false;
      let userRole: 'STARTUP' | 'INVESTOR' = 'INVESTOR';
      let redirectPath = '/dashboard';

      if (!existingUser) {
        // NEW USER - Create user record
        isNewUser = true;
        
        // Determine role: from URL param, or default to INVESTOR
        userRole = (role?.toUpperCase() === 'STARTUP' || role?.toUpperCase() === 'INVESTOR') 
          ? (role.toUpperCase() as 'STARTUP' | 'INVESTOR')
          : 'INVESTOR';

        console.log(`🆕 Creating new user with role: ${userRole}`);

        const { error: insertError } = await supabase
          .from('users')
          .insert({
            id: userId,
            email: userEmail,
            role: userRole,
            name: userName,
            image: userAvatar,
            emailVerified: user.email_confirmed_at ? new Date(user.email_confirmed_at) : null,
            createdAt: new Date(),
            updatedAt: new Date(),
          });

        if (insertError) {
          console.error('❌ Failed to create user record:', insertError);
          
          // Check if it's a duplicate key error (user might have been created by trigger)
          if (insertError.code === '23505') {
            console.log('⚠️ User already exists (created by trigger), continuing...');
          } else {
            return NextResponse.redirect(`${origin}/auth/signin?error=user_creation_failed&message=${encodeURIComponent(insertError.message)}`);
          }
        } else {
          console.log(`✅ Created new user record`);
        }

        // Redirect to onboarding for new users
        redirectPath = userRole === 'STARTUP' 
          ? '/auth/onboarding/startup' 
          : '/auth/onboarding/investor';

      } else {
        // EXISTING USER
        isNewUser = false;
        console.log(`✅ Existing user found: ${existingUser.email}`);

        // If role is provided in URL and different from existing, update it
        if (role && (role.toUpperCase() === 'STARTUP' || role.toUpperCase() === 'INVESTOR')) {
          const newRole = role.toUpperCase() as 'STARTUP' | 'INVESTOR';
          if (existingUser.role !== newRole) {
            console.log(`🔄 Updating user role from ${existingUser.role} to ${newRole}`);
            
            const { error: roleUpdateError } = await supabase
              .from('users')
              .update({ 
                role: newRole,
                updatedAt: new Date(),
              })
              .eq('id', userId);

            if (roleUpdateError) {
              console.error('❌ Failed to update role:', roleUpdateError);
            } else {
              console.log(`✅ Role updated to: ${newRole}`);
              userRole = newRole;
            }
          } else {
            userRole = existingUser.role as 'STARTUP' | 'INVESTOR';
          }
        } else {
          userRole = (existingUser.role as 'STARTUP' | 'INVESTOR') || 'INVESTOR';
        }

        // Update user info from Google (name, avatar)
        if (userName || userAvatar) {
          const updateData: any = { updatedAt: new Date() };
          if (userName && !existingUser.name) updateData.name = userName;
          if (userAvatar) updateData.image = userAvatar;

          await supabase
            .from('users')
            .update(updateData)
            .eq('id', userId);
        }

        // Check onboarding status
        if (userRole === 'STARTUP') {
          const { data: startupProfile } = await supabase
            .from('startup_profiles')
            .select('onboardingComplete')
            .eq('userId', userId)
            .single();

          if (!startupProfile || !startupProfile.onboardingComplete) {
            redirectPath = '/auth/onboarding/startup';
          } else {
            redirectPath = '/dashboard';
          }
        } else {
          const { data: investorProfile } = await supabase
            .from('investor_profiles')
            .select('onboardingComplete')
            .eq('userId', userId)
            .single();

          if (!investorProfile || !investorProfile.onboardingComplete) {
            redirectPath = '/auth/onboarding/investor';
          } else {
            redirectPath = '/dashboard';
          }
        }
      }

      console.log(`✅ ${isNewUser ? 'NEW' : 'EXISTING'} user (${userRole}) → redirecting to: ${redirectPath}`);
      
      // Force a fresh page load to ensure session is properly set
      const response = NextResponse.redirect(`${origin}${redirectPath}`);
      return response;

    } catch (error) {
      console.error('❌ Callback error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      return NextResponse.redirect(`${origin}/auth/signin?error=callback_failed&message=${encodeURIComponent(errorMessage)}`);
    }
  }

  // No authorization code - redirect to signin
  console.log('⚠️ No authorization code in callback, redirecting to signin');
  return NextResponse.redirect(`${origin}/auth/signin?error=no_code`);
}
