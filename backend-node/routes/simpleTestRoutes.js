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

router.get('/check-table', async (req, res) => {
  try {
    const result = await sequelize.query("SHOW TABLES LIKE 'product_categories'");
    const tableExists = result[0].length > 0;
    
    if (tableExists) {
      const columns = await sequelize.query("DESCRIBE product_categories");
      const count = await sequelize.query("SELECT COUNT(*) as count FROM product_categories");
      res.json({ 
        success: true, 
        tableExists: true,
        rowCount: count[0][0].count,
        columns: columns[0].map(col => col.Field)
      });
    } else {
      res.json({ success: true, tableExists: false });
    }
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

module.exports = router;