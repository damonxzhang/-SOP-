const fs = require('fs');
let content = fs.readFileSync('DATABASE_SCHEMA.md', 'utf-8');
// 直接通过字符串拆分替换字面量 \n
content = content.split('\\n').join('\n');
fs.writeFileSync('DATABASE_SCHEMA.md', content, 'utf-8');
