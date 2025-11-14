const fs = require('fs');
const path = require('path');

// Patterns to fix
const replacements = [
  { from: /prisma\.investorProfile\b/g, to: 'prisma.investor_profiles' },
  { from: /prisma\.startupProfile\b/g, to: 'prisma.startup_profiles' },
  { from: /prisma\.startupMetrics\b/g, to: 'prisma.startup_metrics' },
  { from: /prisma\.timeSeriesData\b/g, to: 'prisma.time_series_data' },
  { from: /prisma\.subscription\b(?!s)/g, to: 'prisma.subscriptions' },
  { from: /prisma\.campaign\b(?!s)/g, to: 'prisma.campaigns' },
  { from: /prisma\.investment\b(?!s)/g, to: 'prisma.investments' },
  // Fix relation names in includes
  { from: /(\s+)startupProfile:/g, to: '$1startup_profiles:' },
  { from: /(\s+)investorProfile:/g, to: '$1investor_profiles:' },
  { from: /(\s+)campaign:/g, to: '$1campaigns:' },
  { from: /(\s+)user:/g, to: '$1users:' },
  // Fix property accesses (but not session.user!)
  { from: /\.campaign\./g, to: '.campaigns.' },
  { from: /\.startupProfile\./g, to: '.startup_profiles.' },
  { from: /\.investorProfile\./g, to: '.investor_profiles.' },
  { from: /(?<!session\.)\.user\./g, to: '.users.' },
];

function walkDir(dir, callback) {
  const files = fs.readdirSync(dir);
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat.isDirectory() && file !== 'node_modules' && file !== '.next') {
      walkDir(filePath, callback);
    } else if (file.endsWith('.ts') || file.endsWith('.tsx')) {
      callback(filePath);
    }
  });
}

function fixFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;

  replacements.forEach(({ from, to }) => {
    if (from.test(content)) {
      content = content.replace(from, to);
      modified = true;
    }
  });

  if (modified) {
    fs.writeFileSync(filePath, content);
    console.log(`Fixed: ${filePath}`);
  }
}

// Fix files in app directory (both API routes and pages)
const appDir = path.join(__dirname, 'Demo_App_Development_Guide', 'ai_roi_dashboard', 'nextjs_space', 'app');
if (fs.existsSync(appDir)) {
  console.log('Fixing Prisma naming issues...');
  walkDir(appDir, fixFile);
  console.log('Done!');
} else {
  console.log('App directory not found');
}
