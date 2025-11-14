const { Client } = require('pg');

async function diagnoseDatabase() {
    const client = new Client({
        connectionString: "postgresql://postgres.gnzcvhyxiatcjofywkdq:hebedaihebed@aws-1-us-west-1.pooler.supabase.com:5432/postgres",
        ssl: { rejectUnauthorized: false }
    });

    try {
        await client.connect();
        console.log('✅ Connected to Supabase\n');

        // Check existing policies
        console.log('═══════════════════════════════════════');
        console.log('EXISTING RLS POLICIES:');
        console.log('═══════════════════════════════════════\n');
        
        const policies = await client.query(`
            SELECT schemaname, tablename, policyname, cmd
            FROM pg_policies 
            WHERE schemaname = 'public'
            ORDER BY tablename, policyname;
        `);
        
        console.log('Found', policies.rows.length, 'policies:');
        policies.rows.forEach(p => {
            console.log(`  - ${p.tablename}: ${p.policyname} (${p.cmd})`);
        });

        // Check column names in startup_profiles
        console.log('\n═══════════════════════════════════════');
        console.log('COLUMN NAMES IN startup_profiles:');
        console.log('═══════════════════════════════════════\n');
        
        const columns = await client.query(`
            SELECT column_name, data_type
            FROM information_schema.columns
            WHERE table_schema = 'public'
            AND table_name = 'startup_profiles'
            ORDER BY ordinal_position;
        `);
        
        columns.rows.forEach(c => {
            console.log(`  - ${c.column_name} (${c.data_type})`);
        });

        // Check users table columns
        console.log('\n═══════════════════════════════════════');
        console.log('COLUMN NAMES IN users:');
        console.log('═══════════════════════════════════════\n');
        
        const userCols = await client.query(`
            SELECT column_name, data_type
            FROM information_schema.columns
            WHERE table_schema = 'public'
            AND table_name = 'users'
            ORDER BY ordinal_position;
        `);
        
        userCols.rows.forEach(c => {
            console.log(`  - ${c.column_name} (${c.data_type})`);
        });

        // Check triggers
        console.log('\n═══════════════════════════════════════');
        console.log('EXISTING TRIGGERS:');
        console.log('═══════════════════════════════════════\n');
        
        const triggers = await client.query(`
            SELECT trigger_name, event_object_table
            FROM information_schema.triggers
            WHERE event_object_schema = 'auth'
            AND event_object_table = 'users';
        `);
        
        if (triggers.rows.length > 0) {
            triggers.rows.forEach(t => {
                console.log(`  - ${t.trigger_name} on ${t.event_object_table}`);
            });
        } else {
            console.log('  No triggers found on auth.users');
        }

    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        await client.end();
    }
}

diagnoseDatabase();
