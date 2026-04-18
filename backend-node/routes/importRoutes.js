const express = require('express');
const router = express.Router();
const { sequelize } = require('../config/db');
const fs = require('fs');
const path = require('path');

router.post('/import-sql', async (req, res) => {
  try {
    const sqlFilePath = path.join(__dirname, '../mushroom_backup_final_utf8.sql');
    
    if (!fs.existsSync(sqlFilePath)) {
      return res.status(400).json({ success: false, error: 'SQL文件不存在' });
    }
    
    const sqlContent = fs.readFileSync(sqlFilePath, 'utf8');
    
    const statements = sqlContent
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--') && !s.startsWith('/*'));
    
    for (const statement of statements) {
      try {
        await sequelize.query(statement);
      } catch (e) {
        console.log('跳过语句:', statement.substring(0, 100), '- 错误:', e.message);
      }
    }
    
    res.json({ success: true, message: '数据导入完成' });
  } catch (error) {
    console.error('导入失败:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/check-data', async (req, res) => {
  try {
    const [results] = await sequelize.query('SELECT COUNT(*) as count FROM product_categories');
    res.json({ success: true, categoryCount: results[0].count });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
