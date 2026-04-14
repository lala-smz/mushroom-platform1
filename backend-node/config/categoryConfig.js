// 菌菇类商品三级分类配置

const CATEGORY_CONFIG = {
  // 一级分类
  level1: [
    { key: 'edible', label: '食用菌', description: '日常烹饪食用的菌菇' },
    { key: 'medicinal', label: '药用菌', description: '具有药用价值的菌菇' },
    { key: 'wild', label: '野生菌', description: '野生采摘的珍稀菌菇' },
    { key: 'mushroomBag', label: '菌包', description: '家庭种植菌包' },
    { key: 'spawn', label: '菌种', description: '菌种种苗' },
    { key: 'seasonalBox', label: '时令菌菇盲盒', description: '季节性盲盒产品' },
    { key: 'other', label: '菌菇（兜底）', description: '特殊/定制商品' }
  ],

  // 二级分类
  level2: {
    edible: [
      { key: 'shiitake', label: '香菇类', description: '香菇相关产品' },
      { key: 'oyster', label: '平菇类', description: '平菇相关产品' },
      { key: 'enoki', label: '金针菇类', description: '金针菇相关产品' },
      { key: 'woodEar', label: '木耳类', description: '木耳相关产品' },
      { key: 'kingOyster', label: '杏鲍菇类', description: '杏鲍菇相关产品' },
      { key: 'crabFlavor', label: '蟹味菇类', description: '蟹味菇相关产品' },
      { key: 'bambooFungus', label: '竹荪类', description: '竹荪相关产品' },
      { key: 'mixed', label: '混合菌菇', description: '多种菌菇组合' }
    ],
    medicinal: [
      { key: 'ganoderma', label: '灵芝类', description: '灵芝相关产品' },
      { key: 'cordyceps', label: '冬虫夏草', description: '冬虫夏草相关产品' },
      { key: 'antler', label: '鹿茸菇', description: '鹿茸菇相关产品' },
      { key: 'poria', label: '茯苓类', description: '茯苓相关产品' },
      { key: 'otherMedicinal', label: '其他药用菌', description: '其他药用菌菇' }
    ],
    wild: [
      { key: 'matsutake', label: '松茸类', description: '松茸相关产品' },
      { key: 'bolete', label: '牛肝菌类', description: '牛肝菌相关产品' },
      { key: 'morel', label: '羊肚菌类', description: '羊肚菌相关产品' },
      { key: 'chanterelle', label: '鸡油菌类', description: '鸡油菌相关产品' },
      { key: 'truffle', label: '松露类', description: '松露相关产品' },
      { key: 'otherWild', label: '其他野生菌', description: '其他野生菌菇' }
    ],
    mushroomBag: [
      { key: 'shiitakeBag', label: '香菇菌包', description: '香菇种植菌包' },
      { key: 'oysterBag', label: '平菇菌包', description: '平菇种植菌包' },
      { key: 'enokiBag', label: '金针菇菌包', description: '金针菇种植菌包' },
      { key: 'woodEarBag', label: '木耳菌包', description: '木耳种植菌包' },
      { key: 'kingOysterBag', label: '杏鲍菇菌包', description: '杏鲍菇种植菌包' },
      { key: 'funBag', label: '趣味菌包', description: '趣味种植套装' }
    ],
    spawn: [
      { key: 'shiitakeSpawn', label: '香菇菌种', description: '香菇菌种' },
      { key: 'oysterSpawn', label: '平菇菌种', description: '平菇菌种' },
      { key: 'enokiSpawn', label: '金针菇菌种', description: '金针菇菌种' },
      { key: 'woodEarSpawn', label: '木耳菌种', description: '木耳菌种' },
      { key: 'otherSpawn', label: '其他菌种', description: '其他珍稀菌种' }
    ],
    seasonalBox: [
      { key: 'springBox', label: '春季盲盒', description: '春季限定盲盒' },
      { key: 'summerBox', label: '夏季盲盒', description: '夏季限定盲盒' },
      { key: 'autumnBox', label: '秋季盲盒', description: '秋季限定盲盒' },
      { key: 'winterBox', label: '冬季盲盒', description: '冬季限定盲盒' }
    ],
    other: [
      { key: 'custom', label: '定制商品', description: '客户定制商品' },
      { key: 'processed', label: '加工食品', description: '菌菇深加工产品' },
      { key: 'misc', label: '其他', description: '无法归入其他分类的商品' }
    ]
  },

  // 三级分类
  level3: {
    // 食用菌
    shiitake: ['干香菇', '鲜香菇', '花菇', '香菇片', '香菇酱'],
    oyster: ['平菇', '秀珍菇', '白平菇', '灰平菇', '平菇干货'],
    enoki: ['金针菇', '黄金针菇', '白金针菇', '金针菇干货'],
    woodEar: ['黑木耳', '白木耳', '毛木耳', '小碗耳', '木耳干货'],
    kingOyster: ['杏鲍菇', '白灵菇', '杏鲍菇切片', '杏鲍菇干货'],
    crabFlavor: ['蟹味菇', '白玉菇', '海鲜菇', '真姬菇'],
    bambooFungus: ['竹荪', '长裙竹荪', '短裙竹荪', '竹荪干货'],
    mixed: ['菌菇拼盘', '火锅菌菇组合', '煲汤菌菇包', '菌菇礼盒'],
    
    // 药用菌
    ganoderma: ['赤灵芝', '紫灵芝', '灵芝切片', '灵芝孢子粉', '灵芝茶'],
    cordyceps: ['冬虫夏草', '虫草花', '虫草粉', '虫草胶囊'],
    antler: ['鹿茸菇', '鹿茸菇干货', '鹿茸菇粉'],
    poria: ['茯苓块', '茯苓粉', '茯苓皮', '茯神'],
    otherMedicinal: ['猴头菇', '天麻', '铁皮石斛', '蛹虫草'],
    
    // 野生菌
    matsutake: ['新鲜松茸', '冻干松茸', '松茸干片', '松茸酱'],
    bolete: ['黄牛肝菌', '黑牛肝菌', '白牛肝菌', '牛肝菌干货'],
    morel: ['新鲜羊肚菌', '干羊肚菌', '羊肚菌粉'],
    chanterelle: ['鸡油菌', '鸡油菌干货', '鸡油菌酱'],
    truffle: ['黑松露', '白松露', '松露酱', '松露油'],
    otherWild: ['虎掌菌', '老人头菌', '鸡枞菌', '竹荪蛋'],
    
    // 菌包
    shiitakeBag: ['香菇菌包', '花菇菌包', '黑香菇菌包'],
    oysterBag: ['平菇菌包', '秀珍菇菌包', '姬菇菌包'],
    enokiBag: ['金针菇菌包', '黄金针菌包'],
    woodEarBag: ['黑木耳菌包', '白木耳菌包'],
    kingOysterBag: ['杏鲍菇菌包', '白灵菇菌包'],
    funBag: ['蘑菇乐园组合', '儿童种植套装', 'DIY种植礼盒'],
    
    // 菌种
    shiitakeSpawn: ['香菇母种', '香菇原种', '香菇栽培种'],
    oysterSpawn: ['平菇母种', '平菇原种', '平菇栽培种'],
    enokiSpawn: ['金针菇母种', '金针菇原种', '金针菇栽培种'],
    woodEarSpawn: ['黑木耳菌种', '白木耳菌种'],
    otherSpawn: ['杏鲍菇菌种', '猴头菇菌种', '灵芝菌种'],
    
    // 时令盲盒
    springBox: ['春季尝鲜盒', '春笋菌菇组合', '清明菌菇礼包'],
    summerBox: ['夏季清凉菌菇盒', '消暑菌菇组合'],
    autumnBox: ['秋季丰收盒', '野生菌菇盲盒', '中秋礼盒'],
    winterBox: ['冬季滋补盒', '暖冬菌菇礼包', '年货礼盒'],
    
    // 兜底分类
    custom: ['企业定制礼盒', '专属定制包装'],
    processed: ['菌菇零食', '菌菇调味品', '菌菇罐头'],
    misc: ['菌菇工艺品', '菌菇相关周边']
  }
};

// 获取一级分类列表
const getLevel1Categories = () => CATEGORY_CONFIG.level1;

// 根据一级分类获取二级分类列表
const getLevel2Categories = (level1Key) => {
  return CATEGORY_CONFIG.level2[level1Key] || [];
};

// 根据二级分类获取三级分类列表
const getLevel3Categories = (level2Key) => {
  return CATEGORY_CONFIG.level3[level2Key] || [];
};

// 根据一级分类key获取一级分类信息
const getLevel1Category = (key) => {
  return CATEGORY_CONFIG.level1.find(cat => cat.key === key);
};

// 根据二级分类key获取二级分类信息（需要一级分类key）
const getLevel2Category = (level1Key, level2Key) => {
  const level2List = CATEGORY_CONFIG.level2[level1Key];
  return level2List ? level2List.find(cat => cat.key === level2Key) : null;
};

// 验证分类是否有效
const validateCategory = (level1, level2, level3) => {
  // 验证一级分类
  if (!CATEGORY_CONFIG.level1.some(cat => cat.key === level1)) {
    return { valid: false, message: '无效的一级分类' };
  }
  
  // 验证二级分类
  const level2List = CATEGORY_CONFIG.level2[level1];
  if (!level2List || !level2List.some(cat => cat.key === level2)) {
    return { valid: false, message: '无效的二级分类' };
  }
  
  // 验证三级分类
  const level3List = CATEGORY_CONFIG.level3[level2];
  if (level3 && (!level3List || !level3List.includes(level3))) {
    return { valid: false, message: '无效的三级分类' };
  }
  
  return { valid: true, message: '分类验证通过' };
};

// 获取完整的分类路径
const getCategoryPath = (level1, level2, level3) => {
  const level1Cat = getLevel1Category(level1);
  const level2Cat = getLevel2Category(level1, level2);
  
  const path = [];
  if (level1Cat) path.push(level1Cat.label);
  if (level2Cat) path.push(level2Cat.label);
  if (level3) path.push(level3);
  
  return path.join(' > ');
};

module.exports = {
  CATEGORY_CONFIG,
  getLevel1Categories,
  getLevel2Categories,
  getLevel3Categories,
  getLevel1Category,
  getLevel2Category,
  validateCategory,
  getCategoryPath
};