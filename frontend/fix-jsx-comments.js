// eslint-disable-next-line @typescript-eslint/no-require-imports
const fs = require('fs');
// eslint-disable-next-line @typescript-eslint/no-require-imports
const path = require('path');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach((file) => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat && stat.isDirectory() && !filePath.includes('node_modules') && !filePath.includes('.next')) {
      results = results.concat(walk(filePath));
    } else if (filePath.endsWith('.tsx') || filePath.endsWith('.ts')) {
      results.push(filePath);
    }
  });
  return results;
}

const files = walk('.');

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let changed = false;

  const lines = content.split('\n');
  for (let i = 0; i < lines.length; i++) {
    // If we find an eslint disable line that looks like it's inside JSX
    if (lines[i].match(/^\s*\/\/\s*eslint-disable-next-line/)) {
      // Check surrounding lines or just assume if it's in a .tsx and indented with spaces it might be JSX.
      // But a better way: change it to `{/* eslint-disable-next-line ... */}` if it's right before a JSX tag
      const nextLine = lines[i + 1] || '';
      if (nextLine.match(/^\s*</) || nextLine.match(/^\s*\{/)) {
         lines[i] = lines[i].replace(/\/\/\s*(eslint-disable-next-line.*)/, '{/* $1 */}');
         changed = true;
      }
    }
  }

  if (changed) {
    fs.writeFileSync(file, lines.join('\n'));
  }
});
console.log('Fixed JSX comments');
