const express = require('express');
const router = express.Router();
const { sequelize } = require('../config/db');

// 最简单的测试路由
router.get('/health', (req, res) => {
  res.json({ status: 'ok', message: '后端服务正常运行', timestamp: new Date() });
});

router.get('/db-charset', async (req, res) => {
  try {
    const results = await sequelize.query("SHOW VARIABLES LIKE 'character_set_%'");
    const charsetVars = {};
    results[0].forEach(row => {
      charsetVars[row.Variable_name] = row.Value;
    });
    
    const collationResults = await sequelize.query("SHOW VARIABLES LIKE 'collation_%'");
    collationResults[0].forEach(row => {
      charsetVars[row.Variable_name] = row.Value;
    });
    
    res.json({ success: true, data: charsetVars });
  } catch (error) {
    res.json({ success: false, error: error.message });
  }
});

router.get('/db-info', async (req, res) => {
  try {
    const config = sequelize.config;
    res.json({ 
      success: true, 
      data: {
        database: config.database,
        host: config.host,
        port: config.port,
        username: config.username
      }
    });
  } catch (error) {
    res.json({ success: false, error: error.message });
  }
});

router.get('/boxes', (req, res) => {
  // 返回固定的测试数据
  const testBoxes = [
    {
      id: 1,
      name: '春季时令菌菇盲盒',
      description: '精选当季新鲜菌菇品种',
      price: 99.00,
      season: '春季',
      imageUrl: '/uploads/boxes/spring-box.jpg'
    },
    {
      id: 2,
      name: '夏季清凉菌菇盲盒',
      description: '夏日清爽菌菇组合',
      price: 88.00,
      season: '夏季',
      imageUrl: '/uploads/boxes/summer-box.jpg'
    }
  ];
  
  res.json({ success: true, data: testBoxes });
});

router.post('/import-sql', async (req, res) => {
  try {
    const { sql } = req.body;
    
    if (!sql) {
      return res.json({ success: false, error: '请提供SQL内容' });
    }
    
    const statements = sql.split(';').filter(stmt => stmt.trim().length > 0);
    let successCount = 0;
    let skipCount = 0;
    let errorCount = 0;
    const errors = [];
    
    for (const statement of statements) {
      const trimmedStmt = statement.trim();
      if (!trimmedStmt || trimmedStmt.startsWith('--') || trimmedStmt.startsWith('/*')) {
        skipCount++;
        continue;
      }
      
      try {
        await sequelize.query(trimmedStmt);
        successCount++;
      } catch (error) {
        if (error.message && error.message.includes('ER_TABLE_EXISTS_ERROR')) {
          skipCount++;
        } else {
          errorCount++;
          errors.push({ statement: trimmedStmt.substring(0, 50) + '...', error: error.message });
        }
      }
    }
    
    res.json({ 
      success: true, 
      message: `导入完成`,
      successCount,
      skipCount,
      errorCount,
      errors: errors.slice(0, 10)
    });
  } catch (error) {
    res.json({ success: false, error: error.message });
  }
});

router.post('/import-sql-batch', async (req, res) => {
  try {
    const { batch } = req.body;
    
    if (!batch || !Array.isArray(batch)) {
      return res.json({ success: false, error: '请提供SQL语句数组' });
    }
    
    let successCount = 0;
    let skipCount = 0;
    let errorCount = 0;
    
    for (const sql of batch) {
      const trimmedStmt = sql.trim();
      if (!trimmedStmt || trimmedStmt.startsWith('--') || trimmedStmt.startsWith('/*')) {
        skipCount++;
        continue;
      }
      
      try {
        await sequelize.query(trimmedStmt);
        successCount++;
      } catch (error) {
        if (error.message && error.message.includes('ER_TABLE_EXISTS_ERROR')) {
          skipCount++;
        } else {
          errorCount++;
        }
      }
    }
    
    res.json({ 
      success: true, 
      successCount,
      skipCount,
      errorCount
    });
  } catch (error) {
    res.json({ success: false, error: error.message });
  }
});

module.exports = router;