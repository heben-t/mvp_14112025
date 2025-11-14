const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

async function executeSqlFix() {
    const client = new Client({
        connectionString: "postgresql://postgres.gnzcvhyxiatcjofywkdq:hebedaihebed@aws-1-us-west-1.pooler.supabase.com:5432/postgres",
        ssl: { rejectUnauthorized: false }
    });

    try {
        console.log('Connecting to Supabase...');
        await client.connect();
        console.log('✅ Connected successfully!\n');

        // Read the corrected SQL fix file
        const sqlFilePath = path.join(__dirname, 'COMPLETE_UUID_FIX_CORRECTED.sql');
        console.log('Reading SQL file:', sqlFilePath);
        const sqlContent = fs.readFileSync(sqlFilePath, 'utf8');

        console.log('Executing SQL fix...\n');
        const result = await client.query(sqlContent);
        
        console.log('✅ SQL fix executed successfully!');
        console.log('Result:', result);

    } catch (error) {
        console.error('❌ Error:', error.message);
        console.error('Details:', error);
        process.exit(1);
    } finally {
        await client.end();
        console.log('\n✅ Database connection closed.');
    }
}

executeSqlFix();
