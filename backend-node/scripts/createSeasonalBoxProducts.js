const { sequelize } = require('../config/db');
const Product = require('../models/Product');

const SEASONAL_PRODUCTS = [
  {
    name: '春季踏青盲盒',
    description: '春季限定盲盒，包含新鲜春菇、春笋等时令菌菇，适合踏青野餐',
    price: 88.00,
    stock: 50,
    category: '时令盲盒',
    subCategory: '春季盲盒',
    isHot: true
  },
  {
    name: '春季清明菌菇礼盒',
    description: '清明节限定，精选春季新鲜菌菇组合',
    price: 128.00,
    stock: 30,
    category: '时令盲盒',
    subCategory: '春季盲盒',
    isHot: false
  },
  {
    name: '夏季清凉盲盒',
    description: '夏季限定，清凉爽口的菌菇拼盘，消暑必备',
    price: 68.00,
    stock: 80,
    category: '时令盲盒',
    subCategory: '夏季盲盒',
    isHot: true
  },
  {
    name: '夏季解暑菌汤盲盒',
    description: '夏日解暑菌菇汤料包，清凉滋补',
    price: 58.00,
    stock: 100,
    category: '时令盲盒',
    subCategory: '夏季盲盒',
    isHot: false
  },
  {
    name: '秋季丰收盲盒',
    description: '秋季限定，丰收季节的珍稀野生菌组合',
    price: 158.00,
    stock: 40,
    category: '时令盲盒',
    subCategory: '秋季盲盒',
    isHot: true
  },
  {
    name: '秋季进补礼盒',
    description: '金秋进补首选，精选滋补菌菇组合',
    price: 198.00,
    stock: 25,
    category: '时令盲盒',
    subCategory: '秋季盲盒',
    isHot: false
  },
  {
    name: '冬季暖身盲盒',
    description: '冬季限定，暖心暖胃的菌菇火锅套餐',
    price: 98.00,
    stock: 60,
    category: '时令盲盒',
    subCategory: '冬季盲盒',
    isHot: true
  },
  {
    name: '冬季节庆年货盲盒',
    description: '年货精选，高端菌菇礼盒装',
    price: 268.00,
    stock: 20,
    category: '时令盲盒',
    subCategory: '冬季盲盒',
    isHot: false
  }
];

async function createSeasonalProducts() {
  console.log('创建季节盲盒商品...');
  
  let createdCount = 0;
  let skippedCount = 0;
  
  for (const productData of SEASONAL_PRODUCTS) {
    const existing = await Product.findOne({ where: { name: productData.name } });
    
    if (existing) {
      console.log(`商品 "${productData.name}" 已存在，跳过`);
      skippedCount++;
      continue;
    }
    
    const product = await Product.create({
      ...productData,
      sellerId: 2,
      status: 'approved',
      images: []
    });
    
    console.log(`商品 "${product.name}" 创建成功，ID: ${product.id}`);
    createdCount++;
  }
  
  return { createdCount, skippedCount };
}

async function verifyProducts() {
  console.log('验证季节盲盒商品...');
  
  const products = await Product.findAll({
    where: { category: '时令盲盒' },
    attributes: ['id', 'name', 'category', 'subCategory', 'price', 'stock', 'status']
  });
  
  console.log(`\n时令盲盒分类下共有 ${products.length} 个商品:`);
  for (const product of products) {
    console.log(`  - ${product.name} (${product.subCategory}): ¥${product.price}, 库存: ${product.stock}`);
  }
  
  // 按二级分类统计
  const springCount = await Product.count({ where: { category: '时令盲盒', subCategory: '春季盲盒' } });
  const summerCount = await Product.count({ where: { category: '时令盲盒', subCategory: '夏季盲盒' } });
  const autumnCount = await Product.count({ where: { category: '时令盲盒', subCategory: '秋季盲盒' } });
  const winterCount = await Product.count({ where: { category: '时令盲盒', subCategory: '冬季盲盒' } });
  
  console.log(`\n各季节盲盒商品数量:`);
  console.log(`  - 春季盲盒: ${springCount} 个`);
  console.log(`  - 夏季盲盒: ${summerCount} 个`);
  console.log(`  - 秋季盲盒: ${autumnCount} 个`);
  console.log(`  - 冬季盲盒: ${winterCount} 个`);
}

async function main() {
  try {
    console.log('========================================');
    console.log('  创建季节盲盒商品');
    console.log('========================================\n');
    
    await sequelize.authenticate();
    console.log('数据库连接成功\n');
    
    // 创建商品
    const result = await createSeasonalProducts();
    
    // 验证结果
    await verifyProducts();
    
    console.log('\n========================================');
    console.log('  商品创建完成！');
    console.log(`  成功创建: ${result.createdCount} 个商品`);
    console.log(`  跳过已存在: ${result.skippedCount} 个商品`);
    console.log('========================================');
    
    process.exit(0);
  } catch (error) {
    console.error('创建商品失败:', error);
    console.error(error.stack);
    process.exit(1);
  }
}

main();
