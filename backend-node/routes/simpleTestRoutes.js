const express = require('express');
const router = express.Router();

// 最简单的测试路由
router.get('/health', (req, res) => {
  res.json({ status: 'ok', message: '后端服务正常运行', timestamp: new Date() });
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