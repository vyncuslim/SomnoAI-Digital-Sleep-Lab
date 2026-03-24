import fs from 'fs';
let content = fs.readFileSync('server.ts', 'utf8');
content = content.replace(/error\.message\.includes/g, "String(error?.message || '').includes");
fs.writeFileSync('server.ts', content);
console.log('Fixed server.ts again');
