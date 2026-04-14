const Product = require('../models/Product');
const { sequelize } = require('../config/db');

// 常见菌菇商品数据
const mushroomProducts = [
  {
    name: '香菇',
    description: '香菇是一种常见的食用真菌，具有浓郁的香气和丰富的营养价值。',
    price: '19.99',
    stock: 100,
    category: '菌菇',
    images: ['/mushrooms/xianggu.jpg'],
    status: 'approved',
    sellerId: 3, // 使用卖家用户ID=3
    viewCount: 0
  },
  {
    name: '平菇',
    description: '平菇是一种广泛栽培的食用菌，味道鲜美，营养丰富。',
    price: '15.99',
    stock: 100,
    category: '菌菇',
    images: ['/mushrooms/pinggu.jpg'],
    status: 'approved',
    sellerId: 3,
    viewCount: 0
  },
  {
    name: '杏鲍菇',
    description: '杏鲍菇肉质肥厚，口感鲜嫩，适合多种烹饪方式。',
    price: '22.99',
    stock: 100,
    category: '菌菇',
    images: ['/mushrooms/xingbaogu.jpg'],
    status: 'approved',
    sellerId: 3,
    viewCount: 0
  },
  {
    name: '金针菇',
    description: '金针菇口感脆嫩，富含多种氨基酸和维生素。',
    price: '12.99',
    stock: 100,
    category: '菌菇',
    images: ['/mushrooms/jinzhengu.jpg'],
    status: 'approved',
    sellerId: 3,
    viewCount: 0
  },
  {
    name: '猴头菇',
    description: '猴头菇是一种珍贵的食用菌，具有很高的营养价值和药用价值。',
    price: '29.99',
    stock: 100,
    category: '菌菇',
    images: ['/mushrooms/houtougu.jpg'],
    status: 'approved',
    sellerId: 3,
    viewCount: 0
  }
];

// 初始化菌菇商品
async function initMushroomProducts() {
  try {
    console.log('开始初始化菌菇商品...');
    
    // 检查是否已存在菌菇商品
    const existingProducts = await Product.findAll({
      where: {
        category: '菌菇'
      }
    });
    
    if (existingProducts.length > 0) {
      console.log(`已存在 ${existingProducts.length} 个菌菇商品，跳过初始化`);
      return;
    }
    
    // 创建菌菇商品
    const createdProducts = await Product.bulkCreate(mushroomProducts);
    
    console.log(`成功创建 ${createdProducts.length} 个菌菇商品`);
    console.log('菌菇商品初始化完成');
    
  } catch (error) {
    console.error('初始化菌菇商品失败:', error);
  } finally {
    // 关闭数据库连接
    await sequelize.close();
  }
}

// 运行初始化
initMushroomProducts();
