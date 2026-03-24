import fs from 'fs';
let content = fs.readFileSync('server.ts', 'utf8');
content = content.replace(/error: error\.message \}/g, "error: error?.message || 'Unknown error' }");
content = content.replace(/error: error\.message \|\|/g, "error: error?.message ||");
fs.writeFileSync('server.ts', content);
console.log('Fixed server.ts again 2');
