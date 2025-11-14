/**
 * Script to find all NextAuth references that need to be migrated to Supabase Auth
 * Run with: npx tsx find-nextauth-references.ts
 */

import * as fs from 'fs';
import * as path from 'path';

const projectRoot = process.cwd();
const excludeDirs = ['node_modules', '.next', 'dist', 'build'];

interface Reference {
  file: string;
  line: number;
  content: string;
  type: string;
}

const references: Reference[] = [];

function searchInFile(filePath: string) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n');
  
  lines.forEach((line, index) => {
    const patterns = [
      { pattern: /from ['"]next-auth['"]/, type: 'NextAuth import' },
      { pattern: /from ['"]next-auth\/react['"]/, type: 'NextAuth React import' },
      { pattern: /getServerSession/, type: 'getServerSession' },
      { pattern: /useSession/, type: 'useSession hook' },
      { pattern: /SessionProvider/, type: 'SessionProvider' },
      { pattern: /signIn\(/, type: 'NextAuth signIn' },
      { pattern: /signOut\(/, type: 'NextAuth signOut' },
      { pattern: /\/api\/auth\/session/, type: 'Session API route' },
      { pattern: /authOptions/, type: 'authOptions reference' },
    ];

    patterns.forEach(({ pattern, type }) => {
      if (pattern.test(line)) {
        references.push({
          file: path.relative(projectRoot, filePath),
          line: index + 1,
          content: line.trim(),
          type,
        });
      }
    });
  });
}

function searchDirectory(dir: string) {
  const items = fs.readdirSync(dir);

  items.forEach(item => {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      if (!excludeDirs.includes(item)) {
        searchDirectory(fullPath);
      }
    } else if (stat.isFile()) {
      const ext = path.extname(item);
      if (['.ts', '.tsx', '.js', '.jsx'].includes(ext)) {
        searchInFile(fullPath);
      }
    }
  });
}

console.log('🔍 Searching for NextAuth references...\n');

searchDirectory(path.join(projectRoot, 'app'));
searchDirectory(path.join(projectRoot, 'components'));
searchDirectory(path.join(projectRoot, 'lib'));

if (references.length === 0) {
  console.log('✅ No NextAuth references found! Migration complete.\n');
} else {
  console.log(`❌ Found ${references.length} NextAuth references that need to be migrated:\n`);
  
  // Group by file
  const byFile: { [key: string]: Reference[] } = {};
  references.forEach(ref => {
    if (!byFile[ref.file]) {
      byFile[ref.file] = [];
    }
    byFile[ref.file].push(ref);
  });

  // Print organized by file
  Object.entries(byFile).forEach(([file, refs]) => {
    console.log(`📄 ${file}`);
    refs.forEach(ref => {
      console.log(`   Line ${ref.line}: ${ref.type}`);
      console.log(`   > ${ref.content}`);
    });
    console.log('');
  });

  console.log('💡 Migration Guide:');
  console.log('   1. Replace useSession() with custom hook using Supabase');
  console.log('   2. Replace getServerSession() with getCurrentUser() from lib/auth');
  console.log('   3. Replace signIn() with supabase.auth.signInWithPassword()');
  console.log('   4. Replace signOut() with supabase.auth.signOut()');
  console.log('   5. Remove SessionProvider (no longer needed)\n');
}
