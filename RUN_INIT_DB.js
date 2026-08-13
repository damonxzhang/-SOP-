
import sql from 'mssql';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const config = {
    user: 'sa',
    password: 'fmM3Wv6+SyiE',
    server: '212.64.29.230',
    database: 'sop',
    options: {
        encrypt: false,
        trustServerCertificate: true
    }
};

async function executeInit() {
    try {
        console.log('正在连接数据库 212.64.29.230...');
        await sql.connect(config);
        console.log('数据库连接成功！');

        const sqlFilePath = path.join(__dirname, 'INIT_DB.sql');
        let sqlContent = fs.readFileSync(sqlFilePath, 'utf8');

        // 移除 USE 指令，因为连接时已经指定了数据库
        sqlContent = sqlContent.replace(/USE\s+\[.*?\];?/gi, '');
        
        // 分割语句块 (以 GO 分割)
        const batches = sqlContent.split(/\bGO\b/gi)
            .map(b => b.trim())
            .filter(b => b.length > 0);

        console.log(`准备执行 ${batches.length} 个 SQL 批处理块...`);

        for (let i = 0; i < batches.length; i++) {
            const batch = batches[i];
            try {
                await sql.query(batch);
                console.log(`进度: ${i + 1}/${batches.length} 已完成`);
            } catch (err) {
                console.error(`\n执行第 ${i + 1} 块 SQL 时出错:`);
                console.error('SQL 内容预览:', batch.substring(0, 100) + '...');
                console.error('错误信息:', err.message);
                // 如果是 DROP TABLE 出错（比如表不存在），可以忽略
                if (!err.message.includes('Cannot drop the table')) {
                    throw err; 
                }
            }
        }

        console.log('\n数据库初始化完成！所有表已根据 ADMIN_API_DOCUMENT.md 建好。');
    } catch (err) {
        console.error('初始化过程中发生严重错误:', err.message);
    } finally {
        await sql.close();
        console.log('数据库连接已关闭。');
    }
}

executeInit();
