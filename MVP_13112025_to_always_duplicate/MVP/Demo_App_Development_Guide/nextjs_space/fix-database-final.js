const { Client } = require('pg');

async function fixDatabase() {
    const client = new Client({
        connectionString: "postgresql://postgres.gnzcvhyxiatcjofywkdq:hebedaihebed@aws-1-us-west-1.pooler.supabase.com:5432/postgres",
        ssl: { rejectUnauthorized: false }
    });

    try {
        await client.connect();
        console.log('✅ Connected to Supabase\n');

        // Step 1: Drop ALL existing RLS policies
        console.log('Step 1: Dropping ALL existing RLS policies...');
        
        // Get all existing policies
        const existingPolicies = await client.query(`
            SELECT schemaname, tablename, policyname
            FROM pg_policies 
            WHERE schemaname = 'public'
            AND tablename IN ('startup_profiles', 'investor_profiles', 'campaigns', 'investments', 'watchlist', 'watchlists');
        `);
        
        console.log(`Found ${existingPolicies.rows.length} policies to drop...`);
        
        for (const policy of existingPolicies.rows) {
            const dropCmd = `DROP POLICY IF EXISTS "${policy.policyname}" ON public.${policy.tablename};`;
            console.log(`  Dropping: ${policy.tablename}.${policy.policyname}`);
            await client.query(dropCmd);
        }
        
        console.log('✅ All old policies dropped\n');

        // Step 2: Update trigger function with correct type handling
        console.log('Step 2: Updating trigger function...');
        
        await client.query(`
            CREATE OR REPLACE FUNCTION public.handle_new_user()
            RETURNS TRIGGER AS $$
            DECLARE
              user_role text;
              user_name text;
              user_id_text text;
            BEGIN
              -- Convert UUID to TEXT for public.users table
              user_id_text := NEW.id::text;
              
              -- Check if user already exists
              IF EXISTS (SELECT 1 FROM public.users WHERE id = user_id_text) THEN
                RAISE NOTICE 'User already exists: %', user_id_text;
                RETURN NEW;
              END IF;

              -- Extract metadata
              user_role := COALESCE(NEW.raw_user_meta_data->>'role', 'INVESTOR');
              user_name := COALESCE(
                NEW.raw_user_meta_data->>'name',
                NEW.raw_user_meta_data->>'full_name',
                split_part(NEW.email, '@', 1)
              );
              
              -- Insert user into public.users with TEXT id
              INSERT INTO public.users (
                id, email, password, role, name, "emailVerified", image, "createdAt", "updatedAt"
              )
              VALUES (
                user_id_text,
                NEW.email,
                NULL,
                user_role::text,
                user_name,
                NEW.email_confirmed_at,
                COALESCE(NEW.raw_user_meta_data->>'avatar_url', NEW.raw_user_meta_data->>'picture'),
                NOW(),
                NOW()
              )
              ON CONFLICT (id) DO UPDATE SET
                email = EXCLUDED.email,
                name = COALESCE(EXCLUDED.name, public.users.name),
                "emailVerified" = EXCLUDED."emailVerified",
                image = COALESCE(EXCLUDED.image, public.users.image),
                "updatedAt" = NOW();

              RAISE NOTICE 'Created/updated user: %', user_id_text;
              RETURN NEW;
              
            EXCEPTION
              WHEN OTHERS THEN
                RAISE WARNING 'Error in handle_new_user: %', SQLERRM;
                RETURN NEW;
            END;
            $$ LANGUAGE plpgsql SECURITY DEFINER;
        `);
        
        console.log('✅ Trigger function updated\n');

        // Step 3: Create RLS policies with CORRECT type casting
        // NOTE: startup_profiles.user_id is UUID, users.id is TEXT
        console.log('Step 3: Creating RLS policies with correct types...');
        
        // STARTUP_PROFILES: user_id is UUID, need to cast to TEXT for comparison
        await client.query(`
            CREATE POLICY "Startup users can view own profile"
            ON public.startup_profiles
            FOR SELECT
            USING (user_id::text = auth.uid()::text);
        `);
        
        await client.query(`
            CREATE POLICY "Startup users can update own profile"
            ON public.startup_profiles
            FOR UPDATE
            USING (user_id::text = auth.uid()::text);
        `);
        
        await client.query(`
            CREATE POLICY "Startup users can insert own profile"
            ON public.startup_profiles
            FOR INSERT
            WITH CHECK (user_id::text = auth.uid()::text);
        `);

        // INVESTOR_PROFILES: user_id is UUID
        await client.query(`
            CREATE POLICY "Investor users can view own profile"
            ON public.investor_profiles
            FOR SELECT
            USING (user_id::text = auth.uid()::text);
        `);
        
        await client.query(`
            CREATE POLICY "Investor users can update own profile"
            ON public.investor_profiles
            FOR UPDATE
            USING (user_id::text = auth.uid()::text);
        `);
        
        await client.query(`
            CREATE POLICY "Investor users can insert own profile"
            ON public.investor_profiles
            FOR INSERT
            WITH CHECK (user_id::text = auth.uid()::text);
        `);

        // CAMPAIGNS
        await client.query(`
            CREATE POLICY "Anyone can view published campaigns"
            ON public.campaigns
            FOR SELECT
            USING (status = 'published' OR status = 'live');
        `);
        
        await client.query(`
            CREATE POLICY "Startup can manage own campaigns"
            ON public.campaigns
            FOR ALL
            USING (
                EXISTS (
                    SELECT 1 FROM public.startup_profiles
                    WHERE id = campaigns.startup_profile_id
                    AND user_id::text = auth.uid()::text
                )
            );
        `);

        // INVESTMENTS
        await client.query(`
            CREATE POLICY "Investor can view own investments"
            ON public.investments
            FOR SELECT
            USING (
                EXISTS (
                    SELECT 1 FROM public.investor_profiles
                    WHERE id = investments.investor_profile_id
                    AND user_id::text = auth.uid()::text
                )
            );
        `);
        
        await client.query(`
            CREATE POLICY "Investor can create investments"
            ON public.investments
            FOR INSERT
            WITH CHECK (
                EXISTS (
                    SELECT 1 FROM public.investor_profiles
                    WHERE id = investments.investor_profile_id
                    AND user_id::text = auth.uid()::text
                )
            );
        `);

        console.log('✅ All RLS policies created successfully!\n');

        // Step 4: Verify
        console.log('Step 4: Verification...');
        
        const policies = await client.query(`
            SELECT tablename, COUNT(*) as policy_count
            FROM pg_policies 
            WHERE schemaname = 'public'
            GROUP BY tablename
            ORDER BY tablename;
        `);
        
        console.log('\nPolicies per table:');
        policies.rows.forEach(p => {
            console.log(`  ✅ ${p.tablename}: ${p.policy_count} policies`);
        });

        console.log('\n═══════════════════════════════════════');
        console.log('🎉 DATABASE FIX COMPLETED SUCCESSFULLY!');
        console.log('═══════════════════════════════════════\n');
        console.log('Key fixes applied:');
        console.log('  ✅ Trigger function uses UUID::TEXT casting');
        console.log('  ✅ All RLS policies use user_id::text = auth.uid()::text');
        console.log('  ✅ Handles UUID columns correctly');
        console.log('\nNext step: Test Google OAuth signup!');

    } catch (error) {
        console.error('\n❌ Error:', error.message);
        console.error('Details:', error);
        process.exit(1);
    } finally {
        await client.end();
        console.log('\n✅ Database connection closed.');
    }
}

fixDatabase();
