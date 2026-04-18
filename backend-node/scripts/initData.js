const { sequelize } = require('../config/db');
const Mushroom = require('../models/Mushroom');
const MushroomBox = require('../models/MushroomBox');
const MushroomBoxItem = require('../models/MushroomBoxItem');

/**
 * 数据初始化脚本
 * 用于填充蘑菇、盲盒和盲盒内容数据
 */

// 模拟蘑菇数据
const mushroomData = [
  {
    name: '香菇',
    scientificName: 'Lentinula edodes',
    description: '香菇是一种常见的食用真菌，具有浓郁的香气和丰富的营养价值。',
    morphology: '菌盖呈圆形或半圆形，表面有褐色鳞片，菌褶白色，菌柄圆柱形。',
    growthEnvironment: '香菇适宜在温度15-25℃，湿度80-90%的环境下生长，需要充足的通风和适量的光照。',
    nutritionalValue: {
      protein: 20.0,
      fiber: 30.0,
      vitaminD: 10.0,
      minerals: ['钾', '磷', '镁', '锌']
    },
    safetyInfo: '香菇是安全的食用真菌，无毒性，适合大多数人群食用。',
    cookingMethods: '炖、炒、煮、烤',
    selectionTips: '选择菌盖完整、菌褶白色、无异味的新鲜香菇。',
    season: '秋季,冬季',
    cultivationGuide: '香菇培育需要木屑、麸皮等培养基，在适宜的温度和湿度条件下，约30-40天可收获。',
    cultivationDifficulty: 'medium',
    category: '食用菇',
    originInfo: {
      mainRegions: ['福建', '浙江', '江西', '云南'],
      environment: '温暖湿润的山区环境'
    },
    storageMethods: '香菇可在冰箱中冷藏保存3-5天，也可晒干后长期保存。',
    healthBenefits: '香菇富含香菇多糖，具有增强免疫力、降血脂、抗肿瘤等功效。',
    culturalInfo: '香菇在中国有着悠久的食用历史，是传统的药食两用真菌。',
    marketInfo: {
      priceRange: '10-30元/斤',
      demand: '高'
    },
    dataSource: '中国食用菌协会',
    image: 'https://via.placeholder.com/300x200?text=香菇',
    status: 'active'
  },
  {
    name: '平菇',
    scientificName: 'Pleurotus ostreatus',
    description: '平菇是一种广泛栽培的食用菌，味道鲜美，营养丰富。',
    morphology: '菌盖呈扇形或贝壳形，表面光滑，颜色从白色到灰色不等，菌褶延生。',
    growthEnvironment: '平菇生长温度范围较广，10-30℃均可生长，最适温度20-25℃，湿度保持在85-95%。',
    nutritionalValue: {
      protein: 19.4,
      fiber: 21.0,
      vitamins: ['B1', 'B2', 'C'],
      minerals: ['钾', '磷', '钙']
    },
    safetyInfo: '平菇是安全的食用真菌，无毒性，适合大多数人群食用。',
    cookingMethods: '炒、煮、汤、涮',
    selectionTips: '选择菌盖完整、边缘内卷、无异味的新鲜平菇。',
    season: '春季,秋季',
    cultivationGuide: '平菇培育可使用棉籽壳、玉米芯等培养基，在适宜条件下，约15-20天可收获。',
    cultivationDifficulty: 'easy',
    category: '食用菇',
    originInfo: {
      mainRegions: ['河北', '山东', '河南', '江苏'],
      environment: '温暖湿润的环境'
    },
    storageMethods: '平菇在冰箱中冷藏保存2-3天，不宜长期保存。',
    healthBenefits: '平菇富含氨基酸和多糖，具有增强免疫力、降血压、降血脂等功效。',
    culturalInfo: '平菇是世界上最广泛栽培的食用菌之一，易于培育，产量高。',
    marketInfo: {
      priceRange: '5-15元/斤',
      demand: '高'
    },
    dataSource: '中国食用菌协会',
    image: 'https://via.placeholder.com/300x200?text=平菇',
    status: 'active'
  },
  {
    name: '杏鲍菇',
    scientificName: 'Pleurotus eryngii',
    description: '杏鲍菇是一种珍稀的食用菌，肉质肥厚，口感鲜美，具有杏仁香味。',
    morphology: '菌盖较小，菌柄粗壮，呈圆柱形，表面光滑，颜色为白色或淡黄色。',
    growthEnvironment: '杏鲍菇适宜在温度15-20℃，湿度80-90%的环境下生长，需要充足的通风。',
    nutritionalValue: {
      protein: 16.4,
      fiber: 25.0,
      vitamins: ['B1', 'B2', 'C', 'D'],
      minerals: ['钾', '磷', '镁', '锌']
    },
    safetyInfo: '杏鲍菇是安全的食用真菌，无毒性，适合大多数人群食用。',
    cookingMethods: '炒、煎、烤、炖',
    selectionTips: '选择菌柄粗壮、无异味、手感坚实的新鲜杏鲍菇。',
    season: '春季,秋季',
    cultivationGuide: '杏鲍菇培育需要木屑、麸皮等培养基，在适宜条件下，约30-40天可收获。',
    cultivationDifficulty: 'medium',
    category: '食用菇',
    originInfo: {
      mainRegions: ['福建', '浙江', '山东', '河南'],
      environment: '温暖湿润的山区环境'
    },
    storageMethods: '杏鲍菇在冰箱中冷藏保存5-7天，也可切片冷冻保存。',
    healthBenefits: '杏鲍菇富含多糖和膳食纤维，具有增强免疫力、降血脂、促进消化等功效。',
    culturalInfo: '杏鲍菇原产于欧洲地中海沿岸，近年来在我国广泛栽培。',
    marketInfo: {
      priceRange: '15-25元/斤',
      demand: '中高'
    },
    dataSource: '中国食用菌协会',
    image: 'https://via.placeholder.com/300x200?text=杏鲍菇',
    status: 'active'
  },
  {
    name: '金针菇',
    scientificName: 'Flammulina velutipes',
    description: '金针菇是一种常见的食用菌，菌柄细长，菌盖小巧，口感脆嫩。',
    morphology: '菌盖呈球形或半球形，表面光滑，颜色为白色或淡黄色，菌柄细长，呈圆柱形。',
    growthEnvironment: '金针菇适宜在温度5-15℃，湿度85-95%的环境下生长，需要黑暗的环境。',
    nutritionalValue: {
      protein: 17.8,
      fiber: 21.0,
      vitamins: ['B1', 'B2', 'C'],
      minerals: ['钾', '磷', '镁']
    },
    safetyInfo: '金针菇是安全的食用真菌，无毒性，适合大多数人群食用。',
    cookingMethods: '炒、汤、涮、凉拌',
    selectionTips: '选择菌柄细长、颜色均匀、无异味的新鲜金针菇。',
    season: '冬季',
    cultivationGuide: '金针菇培育需要木屑、麸皮等培养基，在适宜条件下，约30-40天可收获。',
    cultivationDifficulty: 'medium',
    category: '食用菇',
    originInfo: {
      mainRegions: ['河北', '山东', '河南', '江苏'],
      environment: '低温湿润的环境'
    },
    storageMethods: '金针菇在冰箱中冷藏保存3-5天，不宜长期保存。',
    healthBenefits: '金针菇富含多糖和膳食纤维，具有增强免疫力、降血脂、促进大脑发育等功效。',
    culturalInfo: '金针菇是我国传统的食用菌之一，因其菌柄细长，形似金针而得名。',
    marketInfo: {
      priceRange: '8-15元/斤',
      demand: '中高'
    },
    dataSource: '中国食用菌协会',
    image: 'https://via.placeholder.com/300x200?text=金针菇',
    status: 'active'
  },
  {
    name: '猴头菇',
    scientificName: 'Hericium erinaceus',
    description: '猴头菇是一种珍稀的食药用真菌，因其形似猴头而得名，具有很高的营养价值和药用价值。',
    morphology: '子实体呈球形或半球形，表面布满肉质针状菌刺，颜色为白色或淡黄色。',
    growthEnvironment: '猴头菇适宜在温度18-22℃，湿度85-95%的环境下生长，需要充足的通风。',
    nutritionalValue: {
      protein: 26.3,
      fiber: 25.0,
      vitamins: ['B1', 'B2', 'C', 'E'],
      minerals: ['钾', '磷', '镁', '锌']
    },
    safetyInfo: '猴头菇是安全的食用真菌，无毒性，适合大多数人群食用。',
    cookingMethods: '炖、煮、炒、汤',
    selectionTips: '选择菌刺完整、颜色洁白、无异味的新鲜猴头菇。',
    season: '秋季',
    cultivationGuide: '猴头菇培育需要木屑、麸皮等培养基，在适宜条件下，约40-50天可收获。',
    cultivationDifficulty: 'hard',
    category: '食药用菇',
    originInfo: {
      mainRegions: ['黑龙江', '吉林', '辽宁', '河北'],
      environment: '凉爽湿润的山区环境'
    },
    storageMethods: '猴头菇在冰箱中冷藏保存3-5天，也可晒干后长期保存。',
    healthBenefits: '猴头菇富含多糖和氨基酸，具有增强免疫力、保护肠胃、抗肿瘤等功效。',
    culturalInfo: '猴头菇是我国传统的名贵食用菌，与熊掌、燕窝、鱼翅并称为四大名菜。',
    marketInfo: {
      priceRange: '30-50元/斤',
      demand: '中'
    },
    dataSource: '中国食用菌协会',
    image: 'https://via.placeholder.com/300x200?text=猴头菇',
    status: 'active'
  }
];

// 模拟盲盒数据
const boxData = [
  {
    name: '春季时令盲盒',
    description: '精选春季当季新鲜菌菇品种，包含多种春季特色蘑菇。',
    price: 99.99,
    season: '春季',
    image: 'https://via.placeholder.com/300x200?text=春季盲盒',
    status: 'active',
    cultivationService: true,
    cultivationPrice: 50.00,
    cultivationDuration: 30,
    cultivationInclusions: '专业培育指导、定期生长监测、收获指导',
    cultivationDescription: '提供完整的代培服务，从接种到收获全程专业管理。'
  },
  {
    name: '夏季清凉盲盒',
    description: '夏日清爽菌菇组合，适合夏季烹饪，口感清爽。',
    price: 88.88,
    season: '夏季',
    image: 'https://via.placeholder.com/300x200?text=夏季盲盒',
    status: 'active',
    cultivationService: true,
    cultivationPrice: 45.00,
    cultivationDuration: 25,
    cultivationInclusions: '专业培育指导、定期生长监测、收获指导',
    cultivationDescription: '提供完整的代培服务，从接种到收获全程专业管理。'
  },
  {
    name: '秋季丰收盲盒',
    description: '秋季丰收季节的精选菌菇，品种丰富，品质优良。',
    price: 109.99,
    season: '秋季',
    image: 'https://via.placeholder.com/300x200?text=秋季盲盒',
    status: 'active',
    cultivationService: true,
    cultivationPrice: 55.00,
    cultivationDuration: 35,
    cultivationInclusions: '专业培育指导、定期生长监测、收获指导',
    cultivationDescription: '提供完整的代培服务，从接种到收获全程专业管理。'
  },
  {
    name: '冬季滋补盲盒',
    description: '冬季滋补养生菌菇组合，具有较高的营养价值。',
    price: 119.99,
    season: '冬季',
    image: 'https://via.placeholder.com/300x200?text=冬季盲盒',
    status: 'active',
    cultivationService: true,
    cultivationPrice: 60.00,
    cultivationDuration: 40,
    cultivationInclusions: '专业培育指导、定期生长监测、收获指导',
    cultivationDescription: '提供完整的代培服务，从接种到收获全程专业管理。'
  },
  {
    name: '初学者体验盲盒',
    description: '专为初学者设计的体验盲盒，包含易培育的菌菇品种。',
    price: 69.99,
    season: '四季',
    image: 'https://via.placeholder.com/300x200?text=初学者盲盒',
    status: 'active',
    cultivationService: false,
    cultivationPrice: null,
    cultivationDuration: null,
    cultivationInclusions: null,
    cultivationDescription: null
  }
];

// 初始化数据
async function initData() {
  try {
    console.log('开始初始化数据...');
    
    // 同步数据库表结构
    console.log('同步数据库表结构...');
    await sequelize.sync({ alter: true });
    console.log('数据库表结构同步完成');
    
    // 填充蘑菇数据
    console.log('填充蘑菇数据...');
    const mushrooms = [];
    for (const mushroom of mushroomData) {
      // 检查是否已存在
      const existing = await Mushroom.findOne({ where: { name: mushroom.name } });
      if (!existing) {
        const created = await Mushroom.create(mushroom);
        mushrooms.push(created);
        console.log(`创建蘑菇: ${created.name}`);
      } else {
        mushrooms.push(existing);
        console.log(`蘑菇已存在: ${existing.name}`);
      }
    }
    console.log(`蘑菇数据填充完成，共 ${mushrooms.length} 个蘑菇`);
    
    // 填充盲盒数据
    console.log('填充盲盒数据...');
    const boxes = [];
    for (const box of boxData) {
      // 检查是否已存在
      const existing = await MushroomBox.findOne({ where: { name: box.name } });
      if (!existing) {
        const created = await MushroomBox.create(box);
        boxes.push(created);
        console.log(`创建盲盒: ${created.name}`);
      } else {
        boxes.push(existing);
        console.log(`盲盒已存在: ${existing.name}`);
      }
    }
    console.log(`盲盒数据填充完成，共 ${boxes.length} 个盲盒`);
    
    // 填充盲盒内容数据
    console.log('填充盲盒内容数据...');
    const boxItems = [];
    
    // 为每个盲盒添加蘑菇
    for (let i = 0; i < boxes.length; i++) {
      const box = boxes[i];
      
      // 清空现有内容
      await MushroomBoxItem.destroy({ where: { boxId: box.id } });
      
      // 根据盲盒类型添加不同的蘑菇
      let selectedMushrooms;
      if (box.name.includes('初学者')) {
        // 初学者盲盒：只包含易培育的蘑菇
        selectedMushrooms = mushrooms.filter(m => 
          m.cultivationDifficulty === 'easy'
        );
      } else if (box.name.includes('冬季')) {
        // 冬季盲盒：包含适合冬季的蘑菇
        selectedMushrooms = mushrooms.filter(m => 
          m.season.includes('冬季') || m.season.includes('秋季')
        );
      } else if (box.name.includes('夏季')) {
        // 夏季盲盒：包含适合夏季的蘑菇
        selectedMushrooms = mushrooms.filter(m => 
          m.season.includes('夏季') || m.season.includes('春季')
        );
      } else if (box.name.includes('春季')) {
        // 春季盲盒：包含适合春季的蘑菇
        selectedMushrooms = mushrooms.filter(m => 
          m.season.includes('春季')
        );
      } else if (box.name.includes('秋季')) {
        // 秋季盲盒：包含适合秋季的蘑菇
        selectedMushrooms = mushrooms.filter(m => 
          m.season.includes('秋季')
        );
      } else {
        // 其他盲盒：包含所有蘑菇
        selectedMushrooms = mushrooms;
      }
      
      // 确保至少有2个蘑菇
      if (selectedMushrooms.length < 2) {
        selectedMushrooms = mushrooms.slice(0, 2);
      }
      
      // 添加蘑菇到盲盒
      for (let j = 0; j < Math.min(3, selectedMushrooms.length); j++) {
        const mushroom = selectedMushrooms[j];
        const item = await MushroomBoxItem.create({
          boxId: box.id,
          mushroomId: mushroom.id,
          quantity: j + 1
        });
        boxItems.push(item);
        console.log(`为盲盒 ${box.name} 添加蘑菇: ${mushroom.name}, 数量: ${j + 1}`);
      }
    }
    
    console.log(`盲盒内容数据填充完成，共 ${boxItems.length} 个盲盒内容`);
    console.log('数据初始化完成！');
    
  } catch (error) {
    console.error('数据初始化失败:', error);
  } finally {
    // 关闭数据库连接
    await sequelize.close();
    console.log('数据库连接已关闭');
  }
}

// 运行初始化
if (require.main === module) {
  initData();
}

module.exports = initData;