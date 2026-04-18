const { Op } = require('sequelize');
const MushroomBox = require('../models/MushroomBox');
const MushroomBoxItem = require('../models/MushroomBoxItem');
const UserBoxOrder = require('../models/UserBoxOrder');
const Mushroom = require('../models/Mushroom');
const Product = require('../models/Product');
const DrawResult = require('../models/DrawResult');
const { sequelize } = require('../config/db');

// 获取商品的最新信息（从 Product 或 Mushroom 表）
const getLatestItemInfo = async (item) => {
  if (!item || !item.mushroomId) {
    return item;
  }
  
  try {
    // 先尝试从 Product 表获取
    let product = await Product.findByPk(item.mushroomId);
    if (product) {
      return {
        ...item,
        mushroomName: product.name || item.mushroomName,
        image: product.images?.[0] || product.image || item.image
      };
    }
    
    // 如果 Product 表没有，尝试从 Mushroom 表获取
    let mushroom = await Mushroom.findByPk(item.mushroomId);
    if (mushroom) {
      return {
        ...item,
        mushroomName: mushroom.name || item.mushroomName,
        image: mushroom.image || item.image
      };
    }
    
    // 都没找到，返回原数据
    return item;
  } catch (error) {
    console.error('获取商品最新信息失败:', error);
    return item;
  }
};

// 盲盒相关控制器
// 输入验证函数

// 根据概率和总数量计算每个商品的数量
/**
 * 基于概率的随机分配算法
 * @param {Array} items - 商品列表，包含每个商品的概率、最小数量和最大数量
 * @param {number} totalQuantity - 盲盒商品总数
 * @returns {Array} - 计算后的商品列表，包含每个商品的分配数量
 */
const calculateItemQuantities = (items, totalQuantity) => {
  // 边界情况处理
  if (!items || !Array.isArray(items) || items.length === 0 || totalQuantity <= 0 || typeof totalQuantity !== 'number') {
    console.log('边界情况: items或totalQuantity无效:', { items: items ? items.length : 'null', totalQuantity });
    return [];
  }
  
  console.log(`计算商品数量: items=${items.length}, totalQuantity=${totalQuantity}`);
  
  // 验证并清理items数组
  const cleanedItems = items.map((item, index) => {
    // 确保item是对象
    if (!item || typeof item !== 'object') {
      console.warn(`第${index}个item不是有效对象，跳过`);
      return null;
    }
    
    // 确保mushroomId存在
    if (!item.mushroomId) {
      console.warn(`第${index}个item缺少mushroomId，跳过`);
      return null;
    }
    
    // 确保概率值有效
    const probability = typeof item.probability === 'number' ? item.probability : parseFloat(item.probability) || 0;
    
    // 确保数量值有效
    const minQuantity = typeof item.minQuantity === 'number' ? item.minQuantity : parseInt(item.minQuantity) || 0;
    const maxQuantity = typeof item.maxQuantity === 'number' ? item.maxQuantity : parseInt(item.maxQuantity) || totalQuantity;
    
    return {
      ...item,
      probability: Math.max(0, Math.min(100, probability)),
      minQuantity: Math.max(0, minQuantity),
      maxQuantity: Math.max(item.minQuantity || 0, maxQuantity)
    };
  }).filter(Boolean);
  
  if (cleanedItems.length === 0) {
    console.warn('没有有效的items，返回空数组');
    return [];
  }
  
  // 使用清理后的items数组
  items = cleanedItems;
  
  // 过滤掉概率为0的商品
  const validItems = items.filter(item => (item.probability || 0) > 0);
  if (validItems.length === 0) {
    // 如果所有商品概率都为0，平均分配
    const avgQuantity = Math.floor(totalQuantity / items.length);
    const remainder = totalQuantity % items.length;
    
    return items.map((item, index) => ({
      ...item,
      calculatedQuantity: avgQuantity + (index < remainder ? 1 : 0)
    }));
  }
  
  // 计算概率总和
  const totalProbability = validItems.reduce((sum, item) => sum + (item.probability || 0), 0);
  
  if (totalProbability === 0) {
    // 如果概率总和为0，平均分配
    const avgQuantity = Math.floor(totalQuantity / validItems.length);
    const remainder = totalQuantity % validItems.length;
    
    // 确保每个商品至少分配1个，然后平均分配剩余数量
    return validItems.map((item, index) => {
      const baseQuantity = Math.max(1, avgQuantity);
      const extraItem = index < remainder ? 1 : 0;
      return {
        ...item,
        calculatedQuantity: baseQuantity + extraItem
      };
    });
  }
  
  // 检查最小数量总和是否超过总数量
  const minQuantitySum = validItems.reduce((sum, item) => sum + (item.minQuantity || 1), 0);
  if (minQuantitySum > totalQuantity) {
    // 如果最小数量总和超过总数量，按比例缩减
    const ratio = totalQuantity / minQuantitySum;
    let remainingQuantity = totalQuantity;
    const calculatedItems = validItems.map(item => {
      const minQuantity = item.minQuantity || 1;
      const adjustedQuantity = Math.max(1, Math.floor(minQuantity * ratio));
      remainingQuantity -= adjustedQuantity;
      
      return {
        ...item,
        calculatedQuantity: adjustedQuantity
      };
    });
    
    // 处理剩余数量
    let index = 0;
    while (remainingQuantity > 0 && index < calculatedItems.length) {
      calculatedItems[index].calculatedQuantity += 1;
      remainingQuantity -= 1;
      index += 1;
      if (index >= calculatedItems.length) {
        index = 0;
      }
    }
    
    // 处理概率为0的商品
    const zeroProbabilityItems = items.filter(item => (item.probability || 0) <= 0);
    if (zeroProbabilityItems.length > 0) {
      zeroProbabilityItems.forEach(item => {
        calculatedItems.push({
          ...item,
          calculatedQuantity: 0
        });
      });
    }
    
    return calculatedItems;
  }
  
  // 根据概率分配数量
  let remainingQuantity = totalQuantity;
  const calculatedItems = validItems.map(item => {
    const probability = item.probability || 0;
    // 更精确的基础数量计算，使用适当的随机调整范围
    const expectedQuantity = (probability / totalProbability) * totalQuantity;
    const baseQuantity = Math.round(expectedQuantity + (Math.random() * 2 - 1)); // -1 到 1 的随机调整，增加随机性
    // 确保不小于最小数量，不大于最大数量
    const minQuantity = item.minQuantity || 1;
    const maxQuantity = item.maxQuantity || totalQuantity;
    let finalQuantity = Math.max(minQuantity, Math.min(maxQuantity, baseQuantity));
    remainingQuantity -= finalQuantity;
    
    console.log(`商品${item.mushroomId}概率:${probability}%, 预期数量:${expectedQuantity.toFixed(2)}, 基础数量:${baseQuantity}, 最终数量:${finalQuantity}, 剩余数量:${remainingQuantity}`);
    
    return {
      ...item,
      calculatedQuantity: finalQuantity
    };
  });
  
  // 处理剩余数量，确保不超过最大数量，根据概率权重分配
  let loopCount = 0;
  const maxLoops = calculatedItems.length * 3; // 增加最大循环次数，确保有足够机会分配剩余数量
  
  while (remainingQuantity > 0 && loopCount < maxLoops) {
    // 基于概率随机选择商品，使用更精确的权重计算
    const totalWeight = calculatedItems.reduce((sum, item) => {
      const maxQuantity = item.maxQuantity || totalQuantity;
      return sum + (item.calculatedQuantity < maxQuantity ? (item.probability || 0) : 0);
    }, 0);
    
    if (totalWeight <= 0) break;
    
    let randomWeight = Math.random() * totalWeight;
    let selectedItem = null;
    
    for (const item of calculatedItems) {
      const maxQuantity = item.maxQuantity || totalQuantity;
      if (item.calculatedQuantity < maxQuantity) {
        randomWeight -= (item.probability || 0);
        if (randomWeight <= 0) {
          selectedItem = item;
          break;
        }
      }
    }
    
    if (selectedItem) {
      selectedItem.calculatedQuantity += 1;
      remainingQuantity -= 1;
      console.log(`随机分配剩余数量: 商品${selectedItem.mushroomId}数量+1，剩余数量:${remainingQuantity}`);
    }
    
    loopCount++;
  }
  
  // 如果还有剩余数量，尝试重新分配，优先分配给高概率商品
  if (remainingQuantity > 0) {
    console.warn(`无法完全分配剩余数量，剩余 ${remainingQuantity} 个，尝试重新分配`);
    
    // 按概率从高到低排序
    const sortedItems = [...calculatedItems].sort((a, b) => (b.probability || 0) - (a.probability || 0));
    
    for (const item of sortedItems) {
      if (remainingQuantity <= 0) break;
      
      const maxQuantity = item.maxQuantity || totalQuantity;
      const canAdd = maxQuantity - item.calculatedQuantity;
      
      if (canAdd > 0) {
        const addAmount = Math.min(canAdd, remainingQuantity);
        item.calculatedQuantity += addAmount;
        remainingQuantity -= addAmount;
        console.log(`重新分配剩余数量: 商品${item.mushroomId}数量+${addAmount}，剩余数量:${remainingQuantity}`);
      }
    }
  }
  
  // 如果还有剩余数量，按顺序分配
  if (remainingQuantity > 0) {
    console.warn(`仍有剩余数量，尝试按顺序分配`);
    let index = 0;
    while (remainingQuantity > 0 && index < calculatedItems.length) {
      const item = calculatedItems[index];
      const maxQuantity = item.maxQuantity || totalQuantity;
      
      if (item.calculatedQuantity < maxQuantity) {
        item.calculatedQuantity += 1;
        remainingQuantity -= 1;
        console.log(`顺序分配剩余数量: 商品${item.mushroomId}数量+1，剩余数量:${remainingQuantity}`);
      }
      
      index++;
    }
  }
  
  // 如果还有剩余数量无法分配，按比例缩减商品数量以适应总数量
  if (remainingQuantity > 0) {
    console.warn(`无法分配所有剩余数量，剩余 ${remainingQuantity} 个`);
    // 计算需要缩减的总量
    const totalToReduce = remainingQuantity;
    let reduced = 0;
    
    // 按概率从低到高排序，优先缩减概率低的商品
    const sortedItems = calculatedItems
      .map((item, idx) => ({ item, idx, probability: item.probability || 0 }))
      .sort((a, b) => a.probability - b.probability);
    
    for (const { item, idx } of sortedItems) {
      if (reduced >= totalToReduce) break;
      
      const canReduce = Math.max(0, item.calculatedQuantity - (item.minQuantity || 1));
      const reduceAmount = Math.min(canReduce, totalToReduce - reduced);
      
      if (reduceAmount > 0) {
        calculatedItems[idx].calculatedQuantity -= reduceAmount;
        reduced += reduceAmount;
      }
    }
  }
  
  // 处理概率为0的商品
  const zeroProbabilityItems = items.filter(item => (item.probability || 0) <= 0);
  if (zeroProbabilityItems.length > 0) {
    zeroProbabilityItems.forEach(item => {
      calculatedItems.push({
        ...item,
        calculatedQuantity: 0
      });
    });
  }
  
  // 验证计算结果
  const totalCalculatedQuantity = calculatedItems.reduce((sum, item) => sum + (item.calculatedQuantity || 0), 0);
  if (totalCalculatedQuantity !== totalQuantity) {
    console.warn(`计算结果验证失败: 总数量应为 ${totalQuantity}，实际为 ${totalCalculatedQuantity}`);
  }
  
  return calculatedItems;
};
const adjustProbabilities = (items) => {
  if (!items || !Array.isArray(items) || items.length === 0) {
    return [];
  }
  
  const adjustedItems = items.map(item => ({ ...item }));
  const totalProbability = adjustedItems.reduce((sum, item) => sum + (parseFloat(item.probability) || 0), 0);
  
  if (Math.abs(totalProbability - 100) <= 0.01) {
    return adjustedItems;
  }
  
  console.log(`概率总和为${totalProbability}%，自动调整为100%`);
  
  if (totalProbability === 0) {
    const avgProbability = 100 / adjustedItems.length;
    adjustedItems.forEach((item, index) => {
      if (index === adjustedItems.length - 1) {
        const sum = adjustedItems.slice(0, -1).reduce((s, i) => s + i.probability, 0);
        item.probability = Math.round((100 - sum) * 100) / 100;
      } else {
        item.probability = Math.round(avgProbability * 100) / 100;
      }
    });
  } else {
    const ratio = 100 / totalProbability;
    let sum = 0;
    
    adjustedItems.forEach((item, index) => {
      if (index === adjustedItems.length - 1) {
        item.probability = Math.round((100 - sum) * 100) / 100;
      } else {
        item.probability = Math.round((parseFloat(item.probability) || 0) * ratio * 100) / 100;
        sum += item.probability;
      }
    });
  }
  
  return adjustedItems;
};

const validateBoxInput = (data) => {
  const errors = [];
  
  // 验证其他必填字段
  if (!data.name || data.name.trim() === '') {
    errors.push('盲盒名称不能为空');
  }
  
  if (data.name && data.name.length > 100) {
    errors.push('盲盒名称长度不能超过100个字符');
  }
  
  if (data.price === undefined || data.price === null || (typeof data.price === 'string' && data.price.trim() === '') || isNaN(parseFloat(data.price)) || parseFloat(data.price) < 0) {
    errors.push('盲盒价格必须是大于等于0的数字');
  }
  
  if (data.stock !== undefined) {
    if (isNaN(data.stock) || parseInt(data.stock) <= 0 || !Number.isInteger(parseFloat(data.stock))) {
      errors.push('盲盒库存必须是大于0的整数');
    }
  }
  
  if (data.totalQuantity !== undefined) {
    if (isNaN(data.totalQuantity) || parseInt(data.totalQuantity) <= 0 || !Number.isInteger(parseFloat(data.totalQuantity))) {
      errors.push('盲盒总数量必须是大于0的整数');
    }
  }
  
  // 验证商品数量范围
  if (data.minTotalQuantity !== undefined && data.minTotalQuantity !== null) {
    if (isNaN(data.minTotalQuantity) || parseInt(data.minTotalQuantity) <= 0 || !Number.isInteger(parseFloat(data.minTotalQuantity))) {
      errors.push('商品数量最小值必须是大于0的整数');
    }
  }
  
  if (data.maxTotalQuantity !== undefined && data.maxTotalQuantity !== null) {
    if (isNaN(data.maxTotalQuantity) || parseInt(data.maxTotalQuantity) <= 0 || !Number.isInteger(parseFloat(data.maxTotalQuantity))) {
      errors.push('商品数量最大值必须是大于0的整数');
    }
  }
  
  // 验证最大值大于等于最小值
  if (data.minTotalQuantity !== undefined && data.minTotalQuantity !== null && data.maxTotalQuantity !== undefined && data.maxTotalQuantity !== null) {
    if (parseInt(data.maxTotalQuantity) < parseInt(data.minTotalQuantity)) {
      errors.push('商品数量最大值必须大于等于最小值');
    }
  }
  
  return errors;
};

// 获取所有盲盒列表
exports.getMushroomBoxes = async (req, res) => {
  try {
    const { page, limit, search = '', status } = req.query;
    
    // 构建查询条件
    const where = {};
    if (search) {
      where.name = {
        [Op.like]: `%${search}%`
      };
    }
    // 添加状态筛选
    if (status) {
      where.status = status;
    }
    
    // 查询盲盒总数
    const total = await MushroomBox.count({ where });
    
    // 构建查询选项
    const queryOptions = {
      where,
      attributes: ['id', 'name', 'description', 'price', 'stock', 'totalQuantity', 'season', 'image', 'status'],
      include: [
        {
          model: MushroomBoxItem,
          as: 'items'
          // 移除对Mushroom的关联，因为不再有外键约束
        }
      ]
    };
    
    // 只有当page和limit都提供时才应用分页
    if (page && limit) {
      queryOptions.offset = (parseInt(page) - 1) * parseInt(limit);
      queryOptions.limit = parseInt(limit);
    }
    
    // 查询盲盒基本信息，包含状态和关联的菌菇数据
    const boxes = await MushroomBox.findAll(queryOptions);
    
    // 为每个盲盒更新商品的最新信息
    const boxesWithLatestInfo = await Promise.all(boxes.map(async (box) => {
      const boxData = box.toJSON();
      // 添加 images 字段的降级处理
      boxData.images = boxData.image ? [boxData.image] : [];
      if (boxData.items && Array.isArray(boxData.items)) {
        boxData.items = await Promise.all(boxData.items.map(getLatestItemInfo));
      }
      return boxData;
    }));
    
    res.status(200).json({
      success: true,
      data: boxesWithLatestInfo,
      total
    });
  } catch (error) {
    console.error('获取盲盒列表失败:', error);
    res.status(500).json({
      success: false,
      error: '获取盲盒列表失败'
    });
  }
};

// 获取盲盒详情
exports.getMushroomBoxById = async (req, res) => {
  try {
    const { id } = req.params;
    console.log('获取盲盒详情请求:', { id }); // 添加调试日志
    
    // 查询盲盒基本信息，包含关联的商品数据（移除了Mushroom关联）
    const box = await MushroomBox.findByPk(id, {
      attributes: ['id', 'name', 'description', 'price', 'stock', 'totalQuantity', 'season', 'image', 'status', 'cultivationService', 'cultivationPrice', 'cultivationDuration', 'cultivationInclusions', 'cultivationDescription'],
      include: [
        {
          model: MushroomBoxItem,
          as: 'items',
          // 确保加载所有商品，不限制数量
          limit: undefined // 明确设置不限制数量
          // 移除对Mushroom的关联，因为不再有外键约束
        }
      ]
    });
    
    console.log('查询到的盲盒:', box ? box.name : '未找到'); // 记录查询结果
    if (box) {
      console.log('盲盒中的items:', box.items); // 记录items数据
      console.log('items长度:', box.items ? box.items.length : 0); // 记录items长度
    }
    
    if (!box) {
      console.warn('盲盒不存在:', id);
      return res.status(404).json({
        success: false,
        error: '盲盒不存在'
      });
    }
    
    // 手动构建不包含循环引用的数据结构
    const boxData = {
      id: box.id || '',
      name: box.name || '盲盒',
      description: box.description || '',
      price: box.price || 0,
      stock: box.stock || 0,
      totalQuantity: box.totalQuantity || 10,
      season: box.season || '时令',
      image: box.image || '',
      images: box.image ? [box.image] : [],
      status: box.status || 'inactive',
      cultivationService: box.cultivationService || false,
      cultivationPrice: box.cultivationPrice || null,
      cultivationDuration: box.cultivationDuration || null,
      cultivationInclusions: box.cultivationInclusions || '',
      cultivationDescription: box.cultivationDescription || '',
      items: []
    };
    
    // 处理items数组，获取最新的商品信息
    if (box.items && Array.isArray(box.items)) {
      console.log('盲盒中的items:', box.items); // 记录items数据
      console.log('items长度:', box.items.length); // 记录items长度
      
      // 获取每个item的最新信息
      boxData.items = await Promise.all(box.items.map(async (item, index) => {
        console.log(`处理第${index}个item:`, item); // 记录每个item的处理
        const basicItem = {
          id: item.id || '',
          boxId: item.boxId || box.id,
          mushroomId: item.mushroomId,
          quantity: item.quantity || 1,
          minQuantity: item.minQuantity || 1,
          maxQuantity: item.maxQuantity || 1,
          probability: item.probability || 0,
          mushroomName: item.mushroomName || '商品',
          mushroomType: item.mushroomType || 'common',
          image: item.image || ''
        };
        // 获取最新的商品信息
        return await getLatestItemInfo(basicItem);
      }));
    }
    
    console.log('返回的boxData:', boxData); // 记录返回的数据
    console.log('返回的items长度:', boxData.items.length); // 记录返回的items长度
    
    console.log('处理后的items长度:', boxData.items.length); // 记录处理后的items长度
    
    res.status(200).json({
      success: true,
      data: boxData
    });
  } catch (error) {
    console.error('获取盲盒详情失败:', error);
    console.error('错误堆栈:', error.stack); // 记录完整错误堆栈
    res.status(500).json({
      success: false,
      error: '获取盲盒详情失败: ' + error.message
    });
  }
};

// 创建盲盒
exports.createMushroomBox = async (req, res) => {
  try {
    console.log('=== 收到创建盲盒请求 ===');
    console.log('请求体:', req.body);
    
    // 直接使用 req.body，因为 express.json() 中间件已经解析过了
    const { name, description, price, stock, totalQuantity, season, image, images, status, items, cultivationService, cultivationPrice, cultivationDuration, cultivationInclusions, cultivationDescription } = req.body;
    
    // 验证输入数据
    const validationErrors = validateBoxInput({ name, price, stock, totalQuantity });
    if (validationErrors.length > 0) {
      return res.status(400).json({
        success: false,
        error: validationErrors.join('; ')
      });
    }
    
    // 验证items
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        error: '请添加盲盒内容'
      });
    }
    
    // 自动调整概率总和为100%
    console.log('调整前的items:', items.map(i => ({ mushroomId: i.mushroomId, probability: i.probability })));
    const adjustedItems = adjustProbabilities(items);
    console.log('调整后的items:', adjustedItems.map(i => ({ mushroomId: i.mushroomId, probability: i.probability })));
    
    // 开始事务
    const result = await sequelize.transaction(async (t) => {
      // 创建盲盒
      const box = await MushroomBox.create({
        name,
        description,
        price,
        stock: stock || 1,
        totalQuantity: totalQuantity || 10,
        season: season || '时令盲盒',
        image: images?.[0] || image,
        status,
        cultivationService: cultivationService === true,
        cultivationPrice: cultivationPrice ? parseFloat(cultivationPrice) : null,
        cultivationDuration: cultivationDuration ? parseInt(cultivationDuration) : null,
        cultivationInclusions: cultivationInclusions || '',
        cultivationDescription: cultivationDescription || ''
      }, { transaction: t });
      
      console.log('盲盒创建成功:', box.id);
      
      // 处理items，不再使用try-catch容错，确保失败时事务回滚
      const boxItems = adjustedItems.map(item => {
        // 验证mushroomId
        if (!item.mushroomId) {
          throw new Error('商品缺少mushroomId');
        }
        
        // 验证数量区间
        let validMinQuantity = item.minQuantity || item.quantity || 1;
        if (typeof validMinQuantity !== 'number' || validMinQuantity <= 0 || !Number.isInteger(validMinQuantity)) {
          validMinQuantity = 1;
        }
        
        let validMaxQuantity = item.maxQuantity || item.quantity || validMinQuantity;
        if (typeof validMaxQuantity !== 'number' || validMaxQuantity <= 0 || !Number.isInteger(validMaxQuantity)) {
          validMaxQuantity = validMinQuantity;
        }
        
        // 确保最大值不小于最小值
        if (validMaxQuantity < validMinQuantity) {
          validMaxQuantity = validMinQuantity;
        }
        
        return {
          boxId: box.id,
          mushroomId: item.mushroomId,
          quantity: item.quantity || 1,
          minQuantity: validMinQuantity,
          maxQuantity: validMaxQuantity,
          probability: item.probability || 0,
          mushroomName: item.mushroomName || '',
          mushroomType: item.mushroomType || '',
          image: item.image || ''
        };
      });
      
      // 批量创建items
      const createdItems = await MushroomBoxItem.bulkCreate(boxItems, { transaction: t });
      console.log('成功创建商品数量:', createdItems.length);
      
      return box;
    });
    
    res.status(201).json({
      success: true,
      data: result,
      message: '盲盒创建成功'
    });
  } catch (error) {
    console.error('创建盲盒失败:', error);
    res.status(500).json({
      success: false,
      error: '创建盲盒失败: ' + error.message
    });
  }
};

// 更新盲盒
exports.updateMushroomBox = async (req, res) => {
  try {
    console.log('=== 收到更新盲盒请求 ===');
    console.log('请求ID:', req.params.id);
    console.log('请求体:', req.body);
    
    // 直接使用 req.body，因为 express.json() 中间件已经解析过了
    const { id } = req.params;
    const { name, description, price, stock, totalQuantity, season, image, images, status, items, cultivationService, cultivationPrice, cultivationDuration, cultivationInclusions, cultivationDescription } = req.body;
    
    // 验证输入数据
    const validationErrors = validateBoxInput({ name, price, stock, totalQuantity });
    if (validationErrors.length > 0) {
      return res.status(400).json({
        success: false,
        error: validationErrors.join('; ')
      });
    }
    
    // 验证items
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        error: '请添加盲盒内容'
      });
    }
    
    // 自动调整概率总和为100%
    console.log('调整前的items:', items.map(i => ({ mushroomId: i.mushroomId, probability: i.probability })));
    const adjustedItems = adjustProbabilities(items);
    console.log('调整后的items:', adjustedItems.map(i => ({ mushroomId: i.mushroomId, probability: i.probability })));
    
    // 开始事务
    const result = await sequelize.transaction(async (t) => {
      // 查找盲盒
      const box = await MushroomBox.findByPk(id, { transaction: t });
      if (!box) {
        throw new Error('盲盒不存在');
      }
      
      // 更新盲盒基本信息
      await box.update({
        name,
        description,
        price,
        stock: stock || 1,
        totalQuantity: totalQuantity || 10,
        season,
        image: images?.[0] || image,
        status,
        cultivationService: cultivationService === true,
        cultivationPrice: cultivationPrice ? parseFloat(cultivationPrice) : null,
        cultivationDuration: cultivationDuration ? parseInt(cultivationDuration) : null,
        cultivationInclusions: cultivationInclusions || '',
        cultivationDescription: cultivationDescription || ''
      }, { transaction: t });
      
      console.log('盲盒基本信息更新成功:', box.id);
      
      // 删除原有items
      await MushroomBoxItem.destroy({
        where: { boxId: id },
        transaction: t
      });
      
      console.log('原有items已删除');
      
      // 处理新items，不再使用try-catch容错，确保失败时事务回滚
      const boxItems = adjustedItems.map(item => {
        // 验证mushroomId
        if (!item.mushroomId) {
          throw new Error('商品缺少mushroomId');
        }
        
        // 验证数量区间
        let validMinQuantity = item.minQuantity || item.quantity || 1;
        if (typeof validMinQuantity !== 'number' || validMinQuantity <= 0 || !Number.isInteger(validMinQuantity)) {
          validMinQuantity = 1;
        }
        
        let validMaxQuantity = item.maxQuantity || item.quantity || validMinQuantity;
        if (typeof validMaxQuantity !== 'number' || validMaxQuantity <= 0 || !Number.isInteger(validMaxQuantity)) {
          validMaxQuantity = validMinQuantity;
        }
        
        // 确保最大值不小于最小值
        if (validMaxQuantity < validMinQuantity) {
          validMaxQuantity = validMinQuantity;
        }
        
        return {
          boxId: id,
          mushroomId: item.mushroomId,
          quantity: item.quantity || 1,
          minQuantity: validMinQuantity,
          maxQuantity: validMaxQuantity,
          probability: item.probability || 0,
          mushroomName: item.mushroomName || '',
          mushroomType: item.mushroomType || '',
          image: item.image || ''
        };
      });
      
      // 批量创建items
      const createdItems = await MushroomBoxItem.bulkCreate(boxItems, { transaction: t });
      console.log('成功创建商品数量:', createdItems.length);
      
      return box;
    });
    
    res.status(200).json({
      success: true,
      data: result,
      message: '盲盒更新成功'
    });
  } catch (error) {
    console.error('更新盲盒失败:', error);
    res.status(500).json({
      success: false,
      error: '更新盲盒失败: ' + error.message
    });
  }
};

// 删除盲盒
exports.deleteMushroomBox = async (req, res) => {
  try {
    const { id } = req.params;
    
    // 开始事务
    await sequelize.transaction(async (t) => {
      // 删除盲盒包含的菌菇
      await MushroomBoxItem.destroy({
        where: { boxId: id },
        transaction: t
      });
      
      // 删除盲盒
      const result = await MushroomBox.destroy({
        where: { id },
        transaction: t
      });
      
      if (result === 0) {
        throw new Error('盲盒不存在');
      }
    });
    
    res.status(200).json({
      success: true,
      message: '盲盒删除成功'
    });
  } catch (error) {
    console.error('删除盲盒失败:', error);
    res.status(500).json({
      success: false,
      error: '删除盲盒失败'
    });
  }
};

// 创建盲盒订单
exports.createBoxOrder = async (req, res) => {
  try {
    const { boxId, address, phone, receiver, paymentMethod, cultivationService } = req.body;
    const { id: userId } = req.user;
    
    // 查找盲盒
    const box = await MushroomBox.findByPk(boxId);
    if (!box) {
      return res.status(404).json({
        success: false,
        error: '盲盒不存在'
      });
    }
    
    // 计算订单总价格
    let totalPrice = parseFloat(box.price);
    if (cultivationService && box.cultivationPrice) {
      totalPrice += parseFloat(box.cultivationPrice);
    }
    
    // 创建订单
    const order = await UserBoxOrder.create({
      userId,
      boxId,
      status: 'pending',
      address,
      phone,
      receiver,
      paymentMethod,
      paymentTime: paymentMethod ? new Date() : null,
      totalPrice: totalPrice
    });
    
    res.status(201).json({
      success: true,
      data: order
    });
  } catch (error) {
    console.error('创建盲盒订单失败:', error);
    res.status(500).json({
      success: false,
      error: '创建盲盒订单失败'
    });
  }
};

// 获取用户的盲盒订单
exports.getUserBoxOrders = async (req, res) => {
  try {
    const { id: userId } = req.user;
    
    const orders = await UserBoxOrder.findAll({
      where: { userId },
      attributes: ['id', 'boxId', 'status', 'address', 'phone', 'receiver', 'paymentMethod', 'paymentTime', 'createdAt', 'updatedAt'],
      include: [
        {
          model: MushroomBox,
          as: 'box',
          attributes: ['id', 'name', 'description', 'price', 'season', 'image', 'status']
        }
      ],
      order: [['createdAt', 'DESC']]
    });
    
    res.status(200).json({
      success: true,
      data: orders
    });
  } catch (error) {
    console.error('获取用户盲盒订单失败:', error);
    res.status(500).json({
      success: false,
      error: '获取用户盲盒订单失败'
    });
  }
};

// 获取盲盒订单详情
exports.getBoxOrderById = async (req, res) => {
  try {
    const { id } = req.params;
    const { id: userId } = req.user;
    
    const order = await UserBoxOrder.findOne({
      where: { id, userId },
      attributes: ['id', 'boxId', 'status', 'address', 'phone', 'receiver', 'paymentMethod', 'paymentTime', 'createdAt', 'updatedAt'],
      include: [
        {
          model: MushroomBox,
          as: 'box',
          attributes: ['id', 'name', 'description', 'price', 'season', 'image', 'status'],
          include: [
            {
              model: MushroomBoxItem,
              as: 'items',
              attributes: ['id', 'boxId', 'mushroomId', 'quantity'],
              include: [{
                model: Mushroom,
                as: 'mushroom',
                attributes: ['id', 'name', 'scientificName', 'description', 'image']
              }]
            }
          ]
        }
      ]
    });
    
    if (!order) {
      return res.status(404).json({
        success: false,
        error: '订单不存在'
      });
    }
    
    res.status(200).json({
      success: true,
      data: order
    });
  } catch (error) {
    console.error('获取盲盒订单详情失败:', error);
    res.status(500).json({
      success: false,
      error: '获取盲盒订单详情失败'
    });
  }
};

// 更新盲盒订单状态
exports.updateBoxOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    const order = await UserBoxOrder.findByPk(id);
    if (!order) {
      return res.status(404).json({
        success: false,
        error: '订单不存在'
      });
    }
    
    // 更新状态
    order.status = status;
    if (status === 'paid') {
      order.paymentTime = new Date();
    } else if (status === 'shipped') {
      order.deliveryDate = new Date();
    }
    
    await order.save();
    
    res.status(200).json({
      success: true,
      data: order
    });
  } catch (error) {
    console.error('更新盲盒订单状态失败:', error);
    res.status(500).json({
      success: false,
      error: '更新盲盒订单状态失败'
    });
  }
};

// 获取抽取信息
exports.getDrawInfo = async (req, res) => {
  try {
    const { id: userId } = req.user;
    
    // 从数据库获取用户的抽取信息
    // 修改为不限次数抽取
    const drawInfo = {
      remainingDraws: 999, // 修改为不限次数
      totalDraws: 0,
      userLevel: 1
    };
    
    res.status(200).json({
      success: true,
      data: drawInfo
    });
  } catch (error) {
    console.error('获取抽取信息失败:', error);
    res.status(500).json({
      success: false,
      error: '获取抽取信息失败'
    });
  }
};



// 保存抽取结果
exports.saveDrawResult = async (req, res) => {
  try {
    const { id: userId } = req.user;
    const { boxId } = req.body;
    
    // 验证必要参数
    if (!boxId) {
      return res.status(400).json({
        success: false,
        error: '盲盒ID不能为空'
      });
    }
    
    // 查找盲盒信息
    const box = await MushroomBox.findByPk(boxId, {
      include: [
        {
          model: MushroomBoxItem,
          as: 'items'
          // 移除对Mushroom的关联
        }
      ]
    });
    
    if (!box) {
      return res.status(404).json({
        success: false,
        error: '盲盒不存在'
      });
    }
    
    // 准备抽取结果数据
    const drawResultData = {
      userId,
      boxId,
      boxName: box.name,
      boxImage: box.image,
      boxPrice: box.price,
      items: box.items ? box.items.map(item => ({
        id: item.id,
        mushroomId: item.mushroomId,
        mushroomName: item.mushroomName,
        mushroomType: item.mushroomType,
        quantity: item.quantity,
        image: item.image
      })) : []
    };
    
    // 保存到数据库
    const savedResult = await DrawResult.create(drawResultData);
    
    res.status(201).json({
      success: true,
      data: savedResult
    });
  } catch (error) {
    console.error('保存抽取结果失败:', error);
    res.status(500).json({
      success: false,
      error: '保存抽取结果失败'
    });
  }
};

// 获取抽取历史
exports.getDrawHistory = async (req, res) => {
  try {
    const { id: userId } = req.user;
    
    // 从数据库获取用户的抽取历史记录
    const drawHistory = await DrawResult.findAll({
      where: { userId },
      order: [['drawTime', 'DESC']],
      limit: 50 // 限制返回最近50条记录
    });
    
    res.status(200).json({
      success: true,
      data: drawHistory
    });
  } catch (error) {
    console.error('获取抽取历史失败:', error);
    res.status(500).json({
      success: false,
      error: '获取抽取历史失败'
    });
  }
};

// 删除单个抽取记录
exports.deleteDrawResult = async (req, res) => {
  try {
    const { id: userId } = req.user;
    const { resultId } = req.params;
    
    // 验证参数
    if (!resultId) {
      return res.status(400).json({
        success: false,
        error: '抽取记录ID不能为空'
      });
    }
    
    // 查找并删除抽取记录，确保只能删除自己的记录
    const result = await DrawResult.destroy({
      where: {
        id: resultId,
        userId
      }
    });
    
    if (result === 0) {
      return res.status(404).json({
        success: false,
        error: '抽取记录不存在或无权删除'
      });
    }
    
    res.status(200).json({
      success: true,
      message: '抽取记录删除成功'
    });
  } catch (error) {
    console.error('删除抽取记录失败:', error);
    res.status(500).json({
      success: false,
      error: '删除抽取记录失败'
    });
  }
};

// 删除全部抽取记录
exports.deleteAllDrawResults = async (req, res) => {
  try {
    const { id: userId } = req.user;
    
    // 删除用户的所有抽取记录
    await DrawResult.destroy({
      where: {
        userId
      }
    });
    
    res.status(200).json({
      success: true,
      message: '所有抽取记录删除成功'
    });
  } catch (error) {
    console.error('删除全部抽取记录失败:', error);
    res.status(500).json({
      success: false,
      error: '删除全部抽取记录失败'
    });
  }
};

// 获取代培服务进度
exports.getCultivationProgress = async (req, res) => {
  try {
    const { id: userId } = req.user;
    const { orderId } = req.params;
    
    // 查询用户的代培订单
    const order = await UserBoxOrder.findOne({
      where: { 
        id: orderId, 
        userId, 
        cultivationService: true 
      },
      include: [
        {
          model: MushroomBox,
          as: 'box'
        }
      ]
    });
    
    if (!order) {
      return res.status(404).json({
        success: false,
        error: '代培订单不存在'
      });
    }
    
    res.status(200).json({
      success: true,
      data: {
        orderId: order.id,
        boxName: order.box.name,
        cultivationStatus: order.cultivationStatus,
        cultivationProgress: order.cultivationProgress || 0,
        cultivationStartDate: order.cultivationStartDate,
        cultivationEndDate: order.cultivationEndDate,
        cultivationUpdates: order.cultivationUpdates || [],
        cultivationNotes: order.cultivationNotes
      }
    });
  } catch (error) {
    console.error('获取代培进度失败:', error);
    res.status(500).json({
      success: false,
      error: '获取代培进度失败'
    });
  }
};

// 更新代培服务进度
exports.updateCultivationProgress = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { progress, status, notes, updateContent } = req.body;
    
    // 查询订单
    const order = await UserBoxOrder.findByPk(orderId);
    
    if (!order) {
      return res.status(404).json({
        success: false,
        error: '订单不存在'
      });
    }
    
    // 更新代培进度
    const updates = order.cultivationUpdates || [];
    if (updateContent) {
      updates.push({
        timestamp: new Date(),
        content: updateContent,
        progress: progress || order.cultivationProgress
      });
    }
    
    await order.update({
      cultivationProgress: progress || order.cultivationProgress,
      cultivationStatus: status || order.cultivationStatus,
      cultivationNotes: notes || order.cultivationNotes,
      cultivationUpdates: updates
    });
    
    res.status(200).json({
      success: true,
      data: order
    });
  } catch (error) {
    console.error('更新代培进度失败:', error);
    res.status(500).json({
      success: false,
      error: '更新代培进度失败'
    });
  }
};

// 获取培育指导
exports.getCultivationGuide = async (req, res) => {
  try {
    const { boxId } = req.params;
    
    // 查询盲盒信息
    const box = await MushroomBox.findByPk(boxId, {
      include: [
        {
          model: MushroomBoxItem,
          as: 'items',
          include: [{
            model: Mushroom,
            as: 'mushroom'
          }]
        }
      ]
    });
    
    if (!box) {
      return res.status(404).json({
        success: false,
        error: '盲盒不存在'
      });
    }
    
    // 生成培育指导信息
    const guide = {
      boxName: box.name,
      cultivationDuration: box.cultivationDuration,
      cultivationInclusions: box.cultivationInclusions,
      mushroomGuides: box.items.map(item => ({
        name: item.mushroom.name,
        cultivationGuide: item.mushroom.cultivationGuide,
        image: item.mushroom.image
      })),
      tips: [
        '保持菌包湿润，但避免过度浇水',
        '放置在通风良好的环境中',
        '避免阳光直射',
        '保持适宜的温度（通常18-25℃）'
      ]
    };
    
    res.status(200).json({
      success: true,
      data: guide
    });
  } catch (error) {
    console.error('获取培育指导失败:', error);
    res.status(500).json({
      success: false,
      error: '获取培育指导失败'
    });
  }
};

// 获取盲盒数据统计
exports.getBoxStatistics = async (req, res) => {
  try {
    console.log('开始获取盲盒统计数据...');
    
    // 获取所有盲盒的基本统计数据
    const totalBoxes = await MushroomBox.count();
    const activeBoxes = await MushroomBox.count({ where: { status: 'active' } });
    const inactiveBoxes = await MushroomBox.count({ where: { status: 'inactive' } });
    
    console.log('盲盒基本统计数据获取成功:', { totalBoxes, activeBoxes, inactiveBoxes });
    
    // 获取每个盲盒的销售统计
    let boxSales = [];
    let totalSalesAmount = 0;
    let totalSalesCount = 0;
    
    try {
      // 先获取所有盲盒信息
      const allBoxes = await MushroomBox.findAll({
        attributes: ['id', 'name', 'price'],
        raw: true
      });
      
      // 获取订单统计
      const orderStats = await UserBoxOrder.findAll({
        attributes: [
          'boxId',
          [sequelize.fn('COUNT', sequelize.col('id')), 'orderCount'],
          [sequelize.fn('SUM', sequelize.col('totalPrice')), 'totalSales']
        ],
        group: ['boxId'],
        raw: true
      });
      
      console.log('订单统计数据获取成功，共', orderStats.length, '条记录');
      
      // 合并数据
      boxSales = allBoxes.map(box => {
        const stat = orderStats.find(s => s.boxId === box.id) || {};
        const orderCount = parseInt(stat.orderCount || 0);
        const salesAmount = parseFloat(stat.totalSales || 0);
        
        totalSalesCount += orderCount;
        totalSalesAmount += salesAmount;
        
        return {
          boxId: box.id,
          boxName: box.name || '未知盲盒',
          orderCount: orderCount,
          totalSales: salesAmount,
          price: box.price || 0
        };
      });
      
      // 按销售额排序
      boxSales.sort((a, b) => b.totalSales - a.totalSales);
      
    } catch (salesError) {
      console.error('获取销售统计数据失败:', salesError);
      boxSales = [];
    }
    
    // 获取菌菇分类统计
    let mushroomTypeStats = {};
    try {
      // 获取所有菌菇类型统计
      const mushroomTypes = await Mushroom.findAll({
        attributes: [
          'type',
          [sequelize.fn('COUNT', sequelize.col('id')), 'count']
        ],
        group: ['type'],
        raw: true
      });
      
      console.log('菌菇分类统计数据获取成功，共', mushroomTypes.length, '条记录');
      
      // 转换为对象格式
      mushroomTypeStats = mushroomTypes.reduce((acc, item) => {
        if (item.type) {
          acc[item.type] = parseInt(item.count || 0);
        }
        return acc;
      }, {});
      
      // 确保有基本类型
      if (!mushroomTypeStats.common) mushroomTypeStats.common = 0;
      if (!mushroomTypeStats.rare) mushroomTypeStats.rare = 0;
      if (!mushroomTypeStats.epic) mushroomTypeStats.epic = 0;
      if (!mushroomTypeStats.legendary) mushroomTypeStats.legendary = 0;
      
    } catch (mushroomError) {
      console.error('获取菌菇分类统计数据失败:', mushroomError);
      mushroomTypeStats = {
        common: 0,
        rare: 0,
        epic: 0,
        legendary: 0
      };
    }
    
    // 获取库存统计
    let stockStats = {
      totalStock: 0,
      activeStock: 0,
      lowStockBoxes: []
    };
    
    try {
      const stockData = await MushroomBox.findAll({
        attributes: ['id', 'name', 'stock', 'status'],
        raw: true
      });
      
      stockData.forEach(box => {
        const stock = parseInt(box.stock || 0);
        stockStats.totalStock += stock;
        
        if (box.status === 'active') {
          stockStats.activeStock += stock;
          
          // 库存少于10的盲盒
          if (stock > 0 && stock < 10) {
            stockStats.lowStockBoxes.push({
              id: box.id,
              name: box.name,
              stock: stock
            });
          }
        }
      });
      
      // 按库存排序
      stockStats.lowStockBoxes.sort((a, b) => a.stock - b.stock);
      
    } catch (stockError) {
      console.error('获取库存统计数据失败:', stockError);
    }
    
    // 构建统计数据
    const statistics = {
      boxCounts: {
        total: totalBoxes,
        active: activeBoxes,
        inactive: inactiveBoxes
      },
      salesStatistics: boxSales,
      salesSummary: {
        totalSalesAmount: totalSalesAmount,
        totalSalesCount: totalSalesCount,
        averageOrderValue: totalSalesCount > 0 ? totalSalesAmount / totalSalesCount : 0
      },
      mushroomTypeStatistics: mushroomTypeStats,
      stockStatistics: stockStats,
      // 添加时间戳
      lastUpdated: new Date().toISOString()
    };
    
    console.log('统计数据构建成功，准备返回响应');
    console.log('销售汇总:', statistics.salesSummary);
    console.log('库存汇总:', stockStats);
    
    res.status(200).json({
      success: true,
      data: statistics
    });
  } catch (error) {
    console.error('获取盲盒统计数据失败:', error.message);
    console.error('错误堆栈:', error.stack);
    res.status(500).json({
      success: false,
      error: '获取盲盒统计数据失败: ' + error.message
    });
  }
};

// 批量删除盲盒
exports.batchDeleteBoxes = async (req, res) => {
  try {
    console.log('批量删除请求:', req.body);
    const { ids } = req.body;
    
    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({
        success: false,
        error: '请提供有效的盲盒ID列表'
      });
    }
    
    // 确保 ID 是数字类型
    const numericIds = ids.map(id => Number(id));
    console.log('处理后的数字 ID:', numericIds);
    
    // 开始事务
    const result = await sequelize.transaction(async (t) => {
      // 删除相关的盲盒内容
      await MushroomBoxItem.destroy({ 
        where: { boxId: { [Op.in]: numericIds } },
        transaction: t 
      });
      
      // 删除盲盒
      const deleteCount = await MushroomBox.destroy({ 
        where: { id: { [Op.in]: numericIds } },
        transaction: t 
      });
      
      return deleteCount;
    });
    
    console.log('删除结果:', result);
    
    res.status(200).json({
      success: true,
      data: {
        deletedCount: result
      },
      message: `成功删除 ${result} 个盲盒`
    });
  } catch (error) {
    console.error('批量删除盲盒失败:', error);
    res.status(500).json({
      success: false,
      error: '批量删除盲盒失败: ' + error.message
    });
  }
};

// 批量更新盲盒状态
exports.batchUpdateBoxStatus = async (req, res) => {
  try {
    console.log('批量更新状态请求:', req.body);
    const { ids, status } = req.body;
    
    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({
        success: false,
        error: '请提供有效的盲盒ID列表'
      });
    }
    
    if (!status || !['active', 'inactive'].includes(status)) {
      return res.status(400).json({
        success: false,
        error: '状态必须是 active 或 inactive'
      });
    }
    
    // 确保 ID 是数字类型
    const numericIds = ids.map(id => Number(id));
    console.log('处理后的数字 ID:', numericIds);
    
    // 更新盲盒状态
    const result = await MushroomBox.update(
      { status },
      { where: { id: { [Op.in]: numericIds } } }
    );
    console.log('更新结果:', result);
    
    res.status(200).json({
      success: true,
      data: {
        updatedCount: result[0]
      },
      message: `成功更新 ${result[0]} 个盲盒的状态`
    });
  } catch (error) {
    console.error('批量更新盲盒状态失败:', error);
    res.status(500).json({
      success: false,
      error: '批量更新盲盒状态失败: ' + error.message
    });
  }
};

// 调整商品数量，确保总和等于目标总数量
const adjustItemQuantities = (items, targetTotal) => {
  if (!items || items.length === 0) {
    return [];
  }
  
  // 计算当前总和
  const currentTotal = items.reduce((sum, item) => sum + (item.calculatedQuantity || 0), 0);
  
  // 如果已经等于目标总和，直接返回
  if (currentTotal === targetTotal) {
    return items;
  }
  
  // 创建副本进行修改
  const adjustedItems = items.map(item => ({ ...item }));
  
  if (currentTotal < targetTotal) {
    // 需要增加数量
    let remaining = targetTotal - currentTotal;
    let index = 0;
    let loopCount = 0;
    const maxLoops = adjustedItems.length * 2; // 最大循环次数限制
    
    while (remaining > 0 && loopCount < maxLoops) {
      const currentIndex = index % adjustedItems.length;
      const item = adjustedItems[currentIndex];
      const maxQuantity = item.maxQuantity || targetTotal;
      
      // 只有当商品数量小于最大数量时才增加
      if ((item.calculatedQuantity || 0) < maxQuantity) {
        item.calculatedQuantity = (item.calculatedQuantity || 0) + 1;
        remaining--;
      }
      
      index++;
      loopCount++;
    }
    
    // 如果还有剩余数量无法分配，按比例缩减商品数量以适应总数量
    if (remaining > 0) {
      console.warn(`无法分配所有剩余数量，剩余 ${remaining} 个`);
      // 计算需要缩减的总量
      const totalToReduce = remaining;
      let reduced = 0;
      
      // 按概率从低到高排序，优先缩减概率低的商品
      const sortedItems = adjustedItems
        .map((item, idx) => ({ item, idx, probability: item.probability || 0 }))
        .sort((a, b) => a.probability - b.probability);
      
      for (const { item, idx } of sortedItems) {
        if (reduced >= totalToReduce) break;
        
        const canReduce = Math.max(0, (item.calculatedQuantity || 0) - (item.minQuantity || 1));
        const reduceAmount = Math.min(canReduce, totalToReduce - reduced);
        
        if (reduceAmount > 0) {
          adjustedItems[idx].calculatedQuantity -= reduceAmount;
          reduced += reduceAmount;
        }
      }
    }
  } else {
    // 需要减少数量
    let remaining = currentTotal - targetTotal;
    
    // 按概率从低到高排序，优先减少概率低的商品
    const sortedItems = adjustedItems
      .map((item, idx) => ({ item, idx, probability: item.probability || 0 }))
      .sort((a, b) => a.probability - b.probability);
    
    for (const { item, idx } of sortedItems) {
      if (remaining <= 0) break;
      
      const minQuantity = item.minQuantity || 1;
      const canReduce = Math.max(0, (item.calculatedQuantity || 0) - minQuantity); // 至少保留最小数量
      const reduceAmount = Math.min(canReduce, remaining);
      
      if (reduceAmount > 0) {
        adjustedItems[idx].calculatedQuantity -= reduceAmount;
        remaining -= reduceAmount;
      }
    }
    
    // 如果还有剩余需要减少的数量，进一步调整
    if (remaining > 0) {
      console.warn(`无法通过减少概率低的商品达到目标数量，剩余需要减少 ${remaining} 个`);
      // 按当前数量从高到低排序，优先减少数量多的商品
      const quantitySortedItems = adjustedItems
        .map((item, idx) => ({ item, idx, quantity: item.calculatedQuantity || 0 }))
        .sort((a, b) => b.quantity - a.quantity);
      
      for (const { item, idx } of quantitySortedItems) {
        if (remaining <= 0) break;
        
        const minQuantity = item.minQuantity || 1;
        const canReduce = Math.max(0, (item.calculatedQuantity || 0) - minQuantity);
        const reduceAmount = Math.min(canReduce, remaining);
        
        if (reduceAmount > 0) {
          adjustedItems[idx].calculatedQuantity -= reduceAmount;
          remaining -= reduceAmount;
        }
      }
    }
  }
  
  return adjustedItems;
};

// 更新抽取盲盒功能，使用真实盲盒数据
exports.drawBox = async (req, res) => {
  try {
    console.log('=== 抽取盲盒 API 被调用 ===');
    
    // 获取用户ID
    const { id: userId } = req.user;
    
    // 获取所有活跃的盲盒
    const activeBoxes = await MushroomBox.findAll({
      where: { status: 'active' },
      include: [
        {
          model: MushroomBoxItem,
          as: 'items'
          // 移除对Mushroom的关联
        }
      ]
    });
    
    if (activeBoxes.length === 0) {
      return res.status(404).json({
        success: false,
        error: '当前没有可用的盲盒'
      });
    }
    
    // 随机选择一个盲盒
    const randomIndex = Math.floor(Math.random() * activeBoxes.length);
    const drawnBox = activeBoxes[randomIndex];
    
    console.log(`随机抽取到盲盒: ${drawnBox.name} (ID: ${drawnBox.id})`);
    console.log(`盲盒包含 ${drawnBox.items?.length || 0} 个内容`);
    console.log(`盲盒总数量: ${drawnBox.totalQuantity || 10}`);
    
    // 直接使用盲盒管理中定义的商品，不重新计算！
    const drawnItems = drawnBox.items || [];
    
    if (!drawnItems || drawnItems.length === 0) {
      return res.status(404).json({
        success: false,
        error: '盲盒内没有可用的商品'
      });
    }
    
    // 保存抽取结果到数据库
    let saveSuccess = false;
    try {
      // 将抽取结果转换为数据库格式
      const itemsData = drawnItems.map(item => ({
        id: item.id,
        mushroomId: item.mushroomId,
        mushroomName: item.mushroomName,
        mushroomType: item.mushroomType,
        quantity: item.quantity, // 每个商品的实际数量
        image: item.image
      }));
      
      const drawResultData = {
        userId,
        boxId: drawnBox.id,
        boxName: drawnBox.name,
        boxImage: drawnBox.image,
        boxPrice: drawnBox.price,
        items: itemsData
      };
      
      await DrawResult.create(drawResultData);
      console.log('抽取结果已保存到数据库');
      saveSuccess = true;
    } catch (saveError) {
      console.error('保存抽取结果失败:', saveError.message);
      // 保存失败不影响抽取结果返回
    }
    
    // 计算总商品数量
    const totalDrawnQuantity = drawnItems.reduce((sum, item) => sum + (item.quantity || 1), 0);
    
    // 准备返回数据
    res.status(200).json({
      success: true,
      data: {
        box: {
          id: drawnBox.id,
          name: drawnBox.name,
          image: drawnBox.image,
          price: drawnBox.price,
          totalQuantity: drawnBox.totalQuantity || 10,
          description: drawnBox.description,
          season: drawnBox.season
        },
        drawItems: drawnItems.map(item => ({
          id: item.id,
          mushroomId: item.mushroomId,
          mushroomName: item.mushroomName,
          mushroomType: item.mushroomType,
          quantity: item.quantity || 1,
          image: item.image,
          probability: item.probability
        })),
        totalQuantity: totalDrawnQuantity,
        saveSuccess: saveSuccess,
        message: `盲盒抽取成功，共获得${totalDrawnQuantity}个商品${saveSuccess ? '' : '，但保存抽取结果失败'}`
      }
    });
  } catch (error) {
    console.error('抽取盲盒失败:', error.message);
    console.error('错误堆栈:', error.stack);
    res.status(500).json({
      success: false,
      error: '抽取盲盒失败: ' + error.message
    });
  }
};

// 根据概率和盲盒总数量，计算每个商品应该拿几个
const calculateDrawnItems = (items, totalQuantity) => {
  if (!items || items.length === 0) {
    return [];
  }
  
  // 计算概率总和
  const totalProbability = items.reduce((sum, item) => sum + (item.probability || 0), 0);
  
  // 如果概率总和为0，平均分配
  if (totalProbability === 0) {
    const avgQuantity = Math.floor(totalQuantity / items.length);
    const remainder = totalQuantity % items.length;
    
    return items.map((item, index) => ({
      ...item,
      quantity: avgQuantity + (index < remainder ? 1 : 0)
    }));
  }
  
  // 根据概率计算每个商品的基础数量
  let allocatedItems = items.map(item => {
    const probability = item.probability || 0;
    const baseQuantity = Math.floor((probability / totalProbability) * totalQuantity);
    return {
      ...item,
      quantity: baseQuantity
    };
  });
  
  // 计算已分配的总数量
  let allocatedTotal = allocatedItems.reduce((sum, item) => sum + item.quantity, 0);
  let remaining = totalQuantity - allocatedTotal;
  
  // 如果还有剩余数量，按概率比例分配
  if (remaining > 0) {
    // 创建一个包含所有可能选项的数组，每个商品根据概率出现的次数
    const weightedItems = [];
    allocatedItems.forEach(item => {
      const weight = Math.max(1, Math.round((item.probability / totalProbability) * 100));
      for (let i = 0; i < weight; i++) {
        weightedItems.push(item);
      }
    });
    
    // 随机分配剩余数量
    for (let i = 0; i < remaining; i++) {
      const randomIndex = Math.floor(Math.random() * weightedItems.length);
      const selectedItem = weightedItems[randomIndex];
      const itemToIncrement = allocatedItems.find(item => item.id === selectedItem.id);
      if (itemToIncrement) {
        itemToIncrement.quantity++;
      }
    }
  }
  
  // 确保每个商品至少有1个（如果概率大于0）
  allocatedItems = allocatedItems.map(item => {
    if ((item.probability || 0) > 0 && item.quantity === 0) {
      item.quantity = 1;
    }
    return item;
  });
  
  // 最终调整，确保总和等于总数量
  allocatedTotal = allocatedItems.reduce((sum, item) => sum + item.quantity, 0);
  if (allocatedTotal !== totalQuantity) {
    // 如果总和超过总数量，按概率从低到高减少
    if (allocatedTotal > totalQuantity) {
      let excess = allocatedTotal - totalQuantity;
      const sortedItems = allocatedItems
        .map((item, index) => ({ item, index, probability: item.probability || 0 }))
        .sort((a, b) => a.probability - b.probability);
      
      for (const { item, index } of sortedItems) {
        if (excess <= 0) break;
        
        const canReduce = Math.max(0, item.quantity - 1); // 至少保留1个
        const reduceAmount = Math.min(canReduce, excess);
        
        if (reduceAmount > 0) {
          allocatedItems[index].quantity -= reduceAmount;
          excess -= reduceAmount;
        }
      }
    }
    // 如果总和小于总数量，按概率从高到低增加
    else {
      let deficit = totalQuantity - allocatedTotal;
      const sortedItems = allocatedItems
        .map((item, index) => ({ item, index, probability: item.probability || 0 }))
        .sort((a, b) => b.probability - a.probability);
      
      for (const { item, index } of sortedItems) {
        if (deficit <= 0) break;
        
        allocatedItems[index].quantity++;
        deficit--;
      }
    }
  }
  
  // 过滤掉数量为0的商品
  return allocatedItems.filter(item => item.quantity > 0);
};

// 根据概率从商品列表中随机选择一个商品（保留原函数以备其他地方使用）
const selectRandomItem = (items) => {
  if (!items || items.length === 0) {
    return null;
  }
  
  // 计算概率总和
  const totalProbability = items.reduce((sum, item) => sum + (item.probability || 0), 0);
  
  if (totalProbability === 0) {
    // 如果没有设置概率，随机选择一个
    const randomIndex = Math.floor(Math.random() * items.length);
    return items[randomIndex];
  }
  
  // 根据概率随机选择
  let randomValue = Math.random() * totalProbability;
  let cumulativeProbability = 0;
  
  for (const item of items) {
    cumulativeProbability += item.probability || 0;
    if (randomValue <= cumulativeProbability) {
      return item;
    }
  }
  
  // 兜底，返回第一个商品
  return items[0];
};