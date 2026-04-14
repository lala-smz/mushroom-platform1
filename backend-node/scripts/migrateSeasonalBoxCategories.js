const { sequelize } = require('../config/db');
const ProductCategory = require('../models/ProductCategory');
const Product = require('../models/Product');

const SEASONAL_CATEGORY_CONFIG = {
  level1: {
    label: '时令盲盒',
    description: '按季节分类的盲盒商品'
  },
  level2: [
    { label: '春季盲盒', description: '春季限定盲盒商品', seasonKeywords: ['春', '春季', '清明', '踏青'] },
    { label: '夏季盲盒', description: '夏季限定盲盒商品', seasonKeywords: ['夏', '夏季', '清凉', '解暑'] },
    { label: '秋季盲盒', description: '秋季限定盲盒商品', seasonKeywords: ['秋', '秋季', '丰收', '进补'] },
    { label: '冬季盲盒', description: '冬季限定盲盒商品', seasonKeywords: ['冬', '冬季', '暖身', '年货'] }
  ]
};

function generateCategoryKey(label, timestamp = Date.now()) {
  const pinyinMap = {
    '时': 'shi', '令': 'ling', '盲': 'mang', '盒': 'he',
    '春': 'chun', '夏': 'xia', '秋': 'qiu', '冬': 'dong',
    '季': 'ji', '限': 'xian', '定': 'ding'
  };
  
  const slug = label
    .toLowerCase()
    .replace(/[\u4e00-\u9fa5]/g, (char) => pinyinMap[char] || char.charCodeAt(0).toString(36))
    .replace(/[^a-z0-9]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
  
  return `${slug || 'cat'}-${timestamp.toString(36)}`;
}

async function createLevel1Category() {
  console.log('创建一级分类：时令盲盒...');
  
  const existing = await ProductCategory.findOne({ 
    where: { label: SEASONAL_CATEGORY_CONFIG.level1.label, level: 1 } 
  });
  
  if (existing) {
    console.log(`一级分类 "${SEASONAL_CATEGORY_CONFIG.level1.label}" 已存在，key: ${existing.key}`);
    return existing;
  }
  
  const categoryKey = generateCategoryKey(SEASONAL_CATEGORY_CONFIG.level1.label);
  
  const category = await ProductCategory.create({
    key: categoryKey,
    label: SEASONAL_CATEGORY_CONFIG.level1.label,
    description: SEASONAL_CATEGORY_CONFIG.level1.description,
    level: 1,
    parentKey: null,
    sortOrder: 99
  });
  
  console.log(`一级分类 "${category.label}" 创建成功，key: ${category.key}`);
  return category;
}

async function createLevel2Categories(parentKey) {
  console.log('创建二级分类...');
  const createdCategories = [];
  
  for (const config of SEASONAL_CATEGORY_CONFIG.level2) {
    const existing = await ProductCategory.findOne({ 
      where: { label: config.label, level: 2, parentKey } 
    });
    
    if (existing) {
      console.log(`二级分类 "${config.label}" 已存在，key: ${existing.key}`);
      createdCategories.push({ ...existing.toJSON(), seasonKeywords: config.seasonKeywords });
      continue;
    }
    
    const categoryKey = generateCategoryKey(config.label);
    
    const category = await ProductCategory.create({
      key: categoryKey,
      label: config.label,
      description: config.description,
      level: 2,
      parentKey: parentKey,
      sortOrder: SEASONAL_CATEGORY_CONFIG.level2.indexOf(config) + 1
    });
    
    console.log(`二级分类 "${category.label}" 创建成功，key: ${category.key}`);
    createdCategories.push({ ...category.toJSON(), seasonKeywords: config.seasonKeywords });
  }
  
  return createdCategories;
}

async function migrateProductsToSeasonalCategories(level2Categories) {
  console.log('开始迁移季节相关商品...');
  
  const blindBoxProducts = await Product.findAll({
    where: { category: '盲盒' },
    attributes: ['id', 'name', 'description', 'category', 'subCategory']
  });
  
  console.log(`找到 ${blindBoxProducts.length} 个盲盒商品`);
  
  let migratedCount = 0;
  let noMatchCount = 0;
  
  for (const product of blindBoxProducts) {
    const productText = `${product.name} ${product.description || ''}`;
    let matchedCategory = null;
    
    for (const cat of level2Categories) {
      for (const keyword of cat.seasonKeywords) {
        if (productText.includes(keyword)) {
          matchedCategory = cat;
          break;
        }
      }
      if (matchedCategory) break;
    }
    
    if (matchedCategory) {
      await product.update({
        category: SEASONAL_CATEGORY_CONFIG.level1.label,
        subCategory: matchedCategory.label
      });
      console.log(`商品 "${product.name}" 已迁移到 "${matchedCategory.label}"`);
      migratedCount++;
    } else {
      console.log(`商品 "${product.name}" 未匹配到季节分类，跳过`);
      noMatchCount++;
    }
  }
  
  console.log(`迁移完成：成功迁移 ${migratedCount} 个商品，${noMatchCount} 个商品未匹配`);
  return { migratedCount, noMatchCount };
}

async function verifyMigration(level1Key, level2Categories) {
  console.log('验证迁移结果...');
  
  const level1 = await ProductCategory.findOne({ where: { key: level1Key, level: 1 } });
  console.log(`\n一级分类验证:`);
  console.log(`  - ID: ${level1.id}`);
  console.log(`  - Key: ${level1.key}`);
  console.log(`  - 名称: ${level1.label}`);
  console.log(`  - 状态: ${level1.status}`);
  
  console.log(`\n二级分类验证:`);
  for (const cat of level2Categories) {
    const level2 = await ProductCategory.findOne({ where: { key: cat.key, level: 2 } });
    const productCount = await Product.count({ 
      where: { category: SEASONAL_CATEGORY_CONFIG.level1.label, subCategory: cat.label } 
    });
    console.log(`  - ${cat.label}: key=${cat.key}, 商品数=${productCount}`);
  }
  
  const totalSeasonalProducts = await Product.count({ 
    where: { category: SEASONAL_CATEGORY_CONFIG.level1.label } 
  });
  console.log(`\n时令盲盒分类下总商品数: ${totalSeasonalProducts}`);
}

async function main() {
  try {
    console.log('========================================');
    console.log('  时令盲盒分类迁移脚本');
    console.log('========================================\n');
    
    await sequelize.authenticate();
    console.log('数据库连接成功\n');
    
    // Step 1: 创建一级分类
    const level1Category = await createLevel1Category();
    
    // Step 2: 创建二级分类
    const level2Categories = await createLevel2Categories(level1Category.key);
    
    // Step 3: 迁移商品
    const migrationResult = await migrateProductsToSeasonalCategories(level2Categories);
    
    // Step 4: 验证迁移结果
    await verifyMigration(level1Category.key, level2Categories);
    
    console.log('\n========================================');
    console.log('  迁移完成！');
    console.log(`  成功创建: 1个一级分类 + ${level2Categories.length}个二级分类`);
    console.log(`  成功迁移: ${migrationResult.migratedCount} 个商品`);
    console.log('========================================');
    
    process.exit(0);
  } catch (error) {
    console.error('迁移失败:', error);
    console.error(error.stack);
    process.exit(1);
  }
}

main();
