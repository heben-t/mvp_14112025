const fs = require('fs');
const path = require('path');

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
  const before = content;

  content = content.replace(/session\.users/g, 'session.user');

  if (content !== before) {
    fs.writeFileSync(filePath, content);
    console.log(`Fixed: ${filePath}`);
  }
}

const appDir = path.join(__dirname, 'Demo_App_Development_Guide', 'ai_roi_dashboard', 'nextjs_space', 'app');
if (fs.existsSync(appDir)) {
  console.log('Reverting session.users to session.user...');
  walkDir(appDir, fixFile);
  console.log('Done!');
}
