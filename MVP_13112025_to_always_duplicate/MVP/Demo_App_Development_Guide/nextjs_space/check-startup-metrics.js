const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
  const result = await prisma.$queryRaw`
    SELECT column_name, data_type 
    FROM information_schema.columns 
    WHERE table_name = 'startup_metrics' 
    ORDER BY ordinal_position
  `;
  console.log('startup_metrics columns:');
  result.forEach(r => console.log(`  ${r.column_name}`));
  await prisma.$disconnect();
}

check();
