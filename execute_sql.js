
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

async function executeUpdate() {
    try {
        console.log('正在连接数据库...');
        await sql.connect(config);
        console.log('数据库连接成功！');

        const sqlFilePath = path.join(__dirname, 'UPDATE_COMMENTS.sql');
        let sqlContent = fs.readFileSync(sqlFilePath, 'utf8');

        // 移除所有注释行
        sqlContent = sqlContent.replace(/\/\*[\s\S]*?\*\/|--.*$/gm, '');

        // 移除 USE 和 GO 指令
        sqlContent = sqlContent.replace(/USE\s+\[.*?\];?/gi, '');
        
        // 分割语句
        const statements = sqlContent.split(/\bGO\b/gi)
            .map(s => s.trim())
            .filter(s => s.length > 0);

        console.log(`准备执行 ${statements.length} 组备注更新语句...`);

        for (let i = 0; i < statements.length; i++) {
            const batch = statements[i];
            // 在每一组中，可能包含多条 EXEC 语句，我们直接执行这组语句
            try {
                if (batch) {
                    await sql.query(batch);
                    console.log(`进度: ${i + 1}/${statements.length} 已完成`);
                }
            } catch (err) {
                console.error(`\n执行第 ${i + 1} 组语句时出错:`, err.message);
            }
        }

        console.log('\n所有备注更新操作已完成。');
    } catch (err) {
        console.error('连接或执行过程中发生错误:', err.message);
    } finally {
        await sql.close();
        console.log('数据库连接已关闭。');
    }
}

executeUpdate();
