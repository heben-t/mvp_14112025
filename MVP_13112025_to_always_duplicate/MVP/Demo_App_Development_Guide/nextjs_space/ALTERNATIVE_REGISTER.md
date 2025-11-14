# Alternative Registration Approach

If triggers keep blocking, we can use Supabase's regular signup (not admin API) which bypasses database triggers.

## Replace the register route with this version:

File: `app/api/auth/register/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password, name, role } = body;

    console.log('Registration attempt:', { email, role, hasPassword: !!password });

    if (!email || !password || !role) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    if (!['STARTUP', 'INVESTOR'].includes(role)) {
      return NextResponse.json(
        { error: 'Invalid role' },
        { status: 400 }
      );
    }

    // Create a regular client (not service role) for signup
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    console.log('Creating user with regular signup...');

    // Use regular signup instead of admin.createUser
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
          role,
        },
      },
    });

    if (authError || !authData.user) {
      console.error('Auth error:', authError);
      return NextResponse.json(
        { error: authError?.message || 'Failed to create user' },
        { status: 400 }
      );
    }

    console.log('User created in Auth, ID:', authData.user.id);

    // Now use service role client to create profiles
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });

    // Create user profile
    console.log('Creating user profile...');
    const { error: profileError } = await supabaseAdmin
      .from('user_profiles')
      .insert({
        id: authData.user.id,
        email,
        name,
        role: role,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });

    if (profileError) {
      console.error('Profile creation error:', profileError);
      return NextResponse.json(
        { error: `Failed to create user profile: ${profileError.message}` },
        { status: 500 }
      );
    }

    console.log('User profile created successfully');

    // Create role-specific profile
    if (role === 'STARTUP') {
      console.log('Creating startup profile...');
      const { error: startupError } = await supabaseAdmin
        .from('startup_profiles')
        .insert({
          user_id: authData.user.id,
          company_name: name || 'My Startup',
          industry: '',
          stage: 'PRE_SEED',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });

      if (startupError) {
        console.error('Startup profile creation error:', startupError);
        return NextResponse.json(
          { error: `Failed to create startup profile: ${startupError.message}` },
          { status: 500 }
        );
      }
      console.log('Startup profile created successfully');
    } else if (role === 'INVESTOR') {
      console.log('Creating investor profile...');
      const { error: investorError } = await supabaseAdmin
        .from('investor_profiles')
        .insert({
          user_id: authData.user.id,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });

      if (investorError) {
        console.error('Investor profile creation error:', investorError);
        return NextResponse.json(
          { error: `Failed to create investor profile: ${investorError.message}` },
          { status: 500 }
        );
      }
      console.log('Investor profile created successfully');
    }

    console.log('Registration completed successfully for:', email);
    return NextResponse.json(
      {
        user: {
          id: authData.user.id,
          email: authData.user.email,
          name,
          role,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Registration error (catch block):', error);
    return NextResponse.json(
      { error: `Internal server error: ${error instanceof Error ? error.message : 'Unknown error'}` },
      { status: 500 }
    );
  }
}
```

This approach:
1. Uses regular `signUp()` instead of `admin.createUser()`
2. Regular signup doesn't trigger database hooks
3. Then uses service role to create profiles
4. Should bypass the database error
