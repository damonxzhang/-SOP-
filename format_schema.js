const fs = require('fs');

const content = fs.readFileSync('DATABASE_SCHEMA.md', 'utf-8');
// 之前脚本中为了写入文件用的 \n 被当做了字面量字符 \n 而没有转换成真实的换行符，所以这里需要替换回来
const formatted = content.replace(/\\n/g, '\n');

fs.writeFileSync('DATABASE_SCHEMA.md', formatted, 'utf-8');
console.log('Fixed markdown formatting.');
