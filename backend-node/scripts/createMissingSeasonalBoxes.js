const { sequelize } = require('../config/db');
const MushroomBox = require('../models/MushroomBox');
const MushroomBoxItem = require('../models/MushroomBoxItem');

const MISSING_BOXES = [
  {
    name: '春季踏青盲盒',
    description: '春季限定盲盒，包含新鲜春菇、春笋等时令菌菇，适合踏青野餐',
    price: 88.00,
    stock: 50,
    totalQuantity: 10,
    season: 'spring',
    status: 'active',
    items: [
      { mushroomId: 52, quantity: 2, minQuantity: 1, maxQuantity: 3, probability: 50, mushroomName: '香菇', mushroomType: 'common' },
      { mushroomId: 31, quantity: 2, minQuantity: 1, maxQuantity: 3, probability: 50, mushroomName: '平菇', mushroomType: 'common' }
    ]
  },
  {
    name: '夏季解暑菌汤盲盒',
    description: '夏日解暑菌菇汤料包，清凉滋补',
    price: 58.00,
    stock: 100,
    totalQuantity: 8,
    season: 'summer',
    status: 'active',
    items: [
      { mushroomId: 34, quantity: 2, minQuantity: 1, maxQuantity: 3, probability: 50, mushroomName: '猴头菇', mushroomType: 'common' },
      { mushroomId: 53, quantity: 2, minQuantity: 1, maxQuantity: 3, probability: 50, mushroomName: '杏鲍菇', mushroomType: 'common' }
    ]
  },
  {
    name: '秋季丰收盲盒',
    description: '秋季限定，丰收季节的珍稀野生菌组合',
    price: 158.00,
    stock: 40,
    totalQuantity: 6,
    season: 'autumn',
    status: 'active',
    items: [
      { mushroomId: 52, quantity: 2, minQuantity: 1, maxQuantity: 2, probability: 50, mushroomName: '香菇', mushroomType: 'common' },
      { mushroomId: 33, quantity: 1, minQuantity: 1, maxQuantity: 2, probability: 50, mushroomName: '金针菇', mushroomType: 'common' }
    ]
  },
  {
    name: '冬季节庆年货盲盒',
    description: '年货精选，高端菌菇礼盒装',
    price: 268.00,
    stock: 20,
    totalQuantity: 8,
    season: 'winter',
    status: 'active',
    items: [
      { mushroomId: 52, quantity: 2, minQuantity: 1, maxQuantity: 3, probability: 33, mushroomName: '香菇', mushroomType: 'common' },
      { mushroomId: 53, quantity: 2, minQuantity: 1, maxQuantity: 3, probability: 33, mushroomName: '杏鲍菇', mushroomType: 'common' },
      { mushroomId: 34, quantity: 1, minQuantity: 1, maxQuantity: 2, probability: 34, mushroomName: '猴头菇', mushroomType: 'common' }
    ]
  }
];

async function createMissingBoxes() {
  console.log('检查并创建缺失的季节盲盒...');
  
  let createdCount = 0;
  let skippedCount = 0;
  
  for (const boxData of MISSING_BOXES) {
    const existing = await MushroomBox.findOne({ where: { name: boxData.name } });
    
    if (existing) {
      console.log(`盲盒 "${boxData.name}" 已存在，跳过`);
      skippedCount++;
      continue;
    }
    
    const result = await sequelize.transaction(async (t) => {
      const box = await MushroomBox.create({
        name: boxData.name,
        description: boxData.description,
        price: boxData.price,
        stock: boxData.stock,
        totalQuantity: boxData.totalQuantity,
        season: boxData.season,
        status: boxData.status
      }, { transaction: t });
      
      const items = boxData.items.map(item => ({
        boxId: box.id,
        mushroomId: item.mushroomId,
        quantity: item.quantity,
        minQuantity: item.minQuantity,
        maxQuantity: item.maxQuantity,
        probability: item.probability,
        mushroomName: item.mushroomName,
        mushroomType: item.mushroomType
      }));
      
      await MushroomBoxItem.bulkCreate(items, { transaction: t });
      
      return box;
    });
    
    console.log(`盲盒 "${result.name}" 创建成功，ID: ${result.id}`);
    createdCount++;
  }
  
  return { createdCount, skippedCount };
}

async function verifyTotalCount() {
  const total = await MushroomBox.count();
  const activeCount = await MushroomBox.count({ where: { status: 'active' } });
  
  console.log(`\n盲盒总数: ${total}`);
  console.log(`活跃盲盒数: ${activeCount}`);
  
  const boxes = await MushroomBox.findAll({
    attributes: ['id', 'name', 'season', 'status'],
    order: [['season', 'ASC'], ['name', 'ASC']]
  });
  
  console.log('\n所有盲盒列表:');
  boxes.forEach(box => {
    console.log(`  - ${box.name} (季节: ${box.season}, 状态: ${box.status})`);
  });
}

async function main() {
  try {
    console.log('========================================');
    console.log('  创建缺失的季节盲盒');
    console.log('========================================\n');
    
    await sequelize.authenticate();
    console.log('数据库连接成功\n');
    
    // 创建缺失的盲盒
    const result = await createMissingBoxes();
    
    // 验证总数
    await verifyTotalCount();
    
    console.log('\n========================================');
    console.log('  操作完成！');
    console.log(`  成功创建: ${result.createdCount} 个盲盒`);
    console.log(`  跳过已存在: ${result.skippedCount} 个盲盒`);
    console.log('========================================');
    
    process.exit(0);
  } catch (error) {
    console.error('操作失败:', error);
    console.error(error.stack);
    process.exit(1);
  }
}

main();
