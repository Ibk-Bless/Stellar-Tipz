const fs = require('fs');
const path = require('path');

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walkDir(dirPath, callback) : callback(path.join(dir, f));
  });
}

const targetDir = path.join(__dirname, 'frontend-scaffold', 'src');

walkDir(targetDir, function(filePath) {
  if (filePath.endsWith('.tsx') || filePath.endsWith('.ts') || filePath.endsWith('.jsx')) {
    let content = fs.readFileSync(filePath, 'utf8');
    let replaced = content.replace(/text-gray-400/g, 'text-gray-700 dark:text-gray-300');
    replaced = replaced.replace(/text-gray-500/g, 'text-gray-800 dark:text-gray-200');
    if (content !== replaced) {
      fs.writeFileSync(filePath, replaced, 'utf8');
      console.log(`Updated ${filePath}`);
    }
  }
});
console.log("Contrast fixes applied.");
