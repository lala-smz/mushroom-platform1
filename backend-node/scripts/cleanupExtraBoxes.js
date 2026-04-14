const { sequelize } = require('../config/db');
const MushroomBox = require('../models/MushroomBox');
const MushroomBoxItem = require('../models/MushroomBoxItem');

// 需要删除的盲盒名称
const BOXES_TO_DELETE = ['111', '全家享盲盒 - 精选菌菇组合'];

async function cleanupBoxes() {
  console.log('清理多余的非季节盲盒...');
  
  let deletedCount = 0;
  let notFoundCount = 0;
  
  for (const boxName of BOXES_TO_DELETE) {
    const box = await MushroomBox.findOne({ where: { name: boxName } });
    
    if (!box) {
      console.log(`盲盒 "${boxName}" 不存在，跳过`);
      notFoundCount++;
      continue;
    }
    
    await sequelize.transaction(async (t) => {
      // 删除关联的商品
      await MushroomBoxItem.destroy({
        where: { boxId: box.id },
        transaction: t
      });
      
      // 删除盲盒
      await box.destroy({ transaction: t });
    });
    
    console.log(`盲盒 "${boxName}" 删除成功，ID: ${box.id}`);
    deletedCount++;
  }
  
  return { deletedCount, notFoundCount };
}

async function verifyTotalCount() {
  const total = await MushroomBox.count();
  const activeCount = await MushroomBox.count({ where: { status: 'active' } });
  
  console.log(`\n盲盒总数: ${total}`);
  console.log(`活跃盲盒数: ${activeCount}`);
  
  // 按季节统计
  const springCount = await MushroomBox.count({ where: { season: 'spring', status: 'active' } });
  const summerCount = await MushroomBox.count({ where: { season: 'summer', status: 'active' } });
  const autumnCount = await MushroomBox.count({ where: { season: 'autumn', status: 'active' } });
  const winterCount = await MushroomBox.count({ where: { season: 'winter', status: 'active' } });
  
  console.log(`\n各季节盲盒数量:`);
  console.log(`  - 春季盲盒: ${springCount} 个`);
  console.log(`  - 夏季盲盒: ${summerCount} 个`);
  console.log(`  - 秋季盲盒: ${autumnCount} 个`);
  console.log(`  - 冬季盲盒: ${winterCount} 个`);
  
  const boxes = await MushroomBox.findAll({
    attributes: ['id', 'name', 'season', 'status'],
    order: [['season', 'ASC'], ['name', 'ASC']]
  });
  
  console.log('\n所有盲盒列表:');
  boxes.forEach(box => {
    console.log(`  - ${box.name} (季节: ${box.season})`);
  });
}

async function main() {
  try {
    console.log('========================================');
    console.log('  清理多余盲盒');
    console.log('========================================\n');
    
    await sequelize.authenticate();
    console.log('数据库连接成功\n');
    
    // 清理多余盲盒
    const result = await cleanupBoxes();
    
    // 验证总数
    await verifyTotalCount();
    
    console.log('\n========================================');
    console.log('  操作完成！');
    console.log(`  成功删除: ${result.deletedCount} 个盲盒`);
    console.log(`  未找到: ${result.notFoundCount} 个盲盒`);
    console.log('========================================');
    
    process.exit(0);
  } catch (error) {
    console.error('操作失败:', error);
    console.error(error.stack);
    process.exit(1);
  }
}

main();
