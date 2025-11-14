/**
 * Automated Migration Script: NextAuth → Supabase Auth
 * This script automatically replaces all NextAuth references with Supabase Auth equivalents
 * Run with: npx tsx migrate-to-supabase-auth.ts
 */

import * as fs from 'fs';
import * as path from 'path';

const projectRoot = process.cwd();
let filesModified = 0;
let replacementsMade = 0;

function migrateFile(filePath: string) {
  let content = fs.readFileSync(filePath, 'utf-8');
  const originalContent = content;
  let modified = false;

  // 1. Replace NextAuth imports with Supabase imports
  if (content.includes("import { getServerSession } from 'next-auth'")) {
    content = content.replace(
      /import { getServerSession } from 'next-auth';?\n?/g,
      ''
    );
    content = content.replace(
      /import { authOptions } from ['"]@\/lib\/auth['"];?\n?/g,
      ''
    );
    
    // Add Supabase import at the top if not present
    if (!content.includes("from '@/lib/auth'")) {
      const firstImport = content.indexOf('import');
      if (firstImport !== -1) {
        content = content.slice(0, firstImport) +
          "import { getCurrentUser } from '@/lib/auth';\n" +
          content.slice(firstImport);
      }
    }
    modified = true;
  }

  // 2. Replace getServerSession calls
  content = content.replace(
    /const session = await getServerSession\(authOptions\);?/g,
    'const user = await getCurrentUser();'
  );
  
  content = content.replace(
    /await getServerSession\(authOptions\)/g,
    'await getCurrentUser()'
  );

  // 3. Replace session?.user checks
  content = content.replace(
    /if \(!session\?\.(user|session)\)/g,
    'if (!user)'
  );
  
  content = content.replace(
    /if \(session\?\.(user|session)\)/g,
    'if (user)'
  );

  // 4. Replace session.user references
  content = content.replace(/session\.user\.id/g, 'user.id');
  content = content.replace(/session\.user\.email/g, 'user.email');
  content = content.replace(/session\.user\.name/g, 'user.name');
  content = content.replace(/session\.user\.role/g, 'user.role');
  content = content.replace(/session\.user/g, 'user');

  // 5. Replace useSession hook
  if (content.includes("import { useSession } from 'next-auth/react'")) {
    // This needs custom hook - mark for manual review
    console.log(`⚠️  Manual review needed for useSession in: ${path.relative(projectRoot, filePath)}`);
  }

  if (content !== originalContent) {
    fs.writeFileSync(filePath, content, 'utf-8');
    filesModified++;
    const changes = (originalContent.match(/getServerSession|session\.user/g) || []).length;
    replacementsMade += changes;
    return true;
  }

  return false;
}

function processDirectory(dir: string) {
  const items = fs.readdirSync(dir);

  items.forEach(item => {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      if (!['node_modules', '.next', 'dist', 'build'].includes(item)) {
        processDirectory(fullPath);
      }
    } else if (stat.isFile()) {
      const ext = path.extname(item);
      if (['.ts', '.tsx'].includes(ext)) {
        migrateFile(fullPath);
      }
    }
  });
}

console.log('🔄 Starting automated migration from NextAuth to Supabase Auth...\n');

processDirectory(path.join(projectRoot, 'app'));
processDirectory(path.join(projectRoot, 'lib'));

console.log(`\n✅ Migration complete!`);
console.log(`   Files modified: ${filesModified}`);
console.log(`   Replacements made: ${replacementsMade}`);
console.log(`\n📋 Next steps:`);
console.log(`   1. Review files marked for manual review (useSession hooks)`);
console.log(`   2. Test the application`);
console.log(`   3. Clear .next build cache: rm -rf .next`);
console.log(`   4. Restart dev server: npm run dev\n`);
