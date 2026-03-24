import fs from 'fs';
let content = fs.readFileSync('server.ts', 'utf8');
content = content.replace(/error\?\.message\?\.includes/g, "String(error?.message || '').includes");
content = content.replace(/error\.message\?\.toLowerCase\(\)\.includes/g, "String(error?.message || '').toLowerCase().includes");
fs.writeFileSync('server.ts', content);
console.log('Fixed server.ts');
