import fs from 'fs';
let content = fs.readFileSync('server.ts', 'utf8');
content = content.replace(/error\.message/g, "error?.message");
content = content.replace(/error\.stack/g, "error?.stack");
fs.writeFileSync('server.ts', content);
console.log('Fixed server.ts again 3');
