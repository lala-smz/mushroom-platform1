const Mushroom = require('../models/Mushroom');
const { Op } = require('sequelize');

/**
 * 菌菇管理控制器
 */

// 获取菌菇列表
exports.getMushrooms = async (req, res) => {
  try {
    const mushrooms = await Mushroom.findAll({
      attributes: ['id', 'name', 'scientificName', 'description', 'category', 'season', 'image', 'cultivationDifficulty', 'type']
    });
    
    res.status(200).json({
      success: true,
      data: mushrooms
    });
  } catch (error) {
    console.error('获取菌菇列表失败:', error);
    res.status(500).json({
      success: false,
      error: '获取菌菇列表失败' + (error.message ? `: ${error.message}` : '')
    });
  }
};

// 获取菌菇详情
exports.getMushroomById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const mushroom = await Mushroom.findByPk(id, {
      attributes: ['id', 'name', 'scientificName', 'description', 'category', 'season', 'image', 'cultivationDifficulty', 'cultivationGuide', 'type']
    });
    
    if (!mushroom) {
      return res.status(404).json({
        success: false,
        error: '菌菇信息不存在'
      });
    }
    
    res.status(200).json({
      success: true,
      data: mushroom
    });
  } catch (error) {
    console.error('获取菌菇详情失败:', error);
    res.status(500).json({
      success: false,
      error: '获取菌菇详情失败' + (error.message ? `: ${error.message}` : '')
    });
  }
};

// 创建菌菇（管理员）
exports.createMushroom = async (req, res) => {
  try {
    const { name, scientificName, description, category, season, image, cultivationDifficulty, cultivationGuide, type } = req.body;
    
    // 验证必填字段
    if (!name || !category) {
      return res.status(400).json({
        success: false,
        error: '菌菇名称和分类为必填字段'
      });
    }
    
    // 验证type字段
    const validTypes = ['common', 'product'];
    if (type && !validTypes.includes(type)) {
      return res.status(400).json({
        success: false,
        error: '菌菇类型必须是common或product'
      });
    }
    
    const mushroom = await Mushroom.create({
      name,
      scientificName,
      description,
      category,
      season,
      image,
      cultivationDifficulty,
      cultivationGuide,
      type: type || 'common' // 默认为常见菌菇
    });
    
    res.status(201).json({
      success: true,
      data: mushroom
    });
  } catch (error) {
    console.error('创建菌菇失败:', error);
    res.status(500).json({
      success: false,
      error: '创建菌菇失败' + (error.message ? `: ${error.message}` : '')
    });
  }
};

// 更新菌菇（管理员）
exports.updateMushroom = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, scientificName, description, category, season, image, cultivationDifficulty, cultivationGuide, type } = req.body;
    
    const mushroom = await Mushroom.findByPk(id);
    
    if (!mushroom) {
      return res.status(404).json({
        success: false,
        error: '菌菇信息不存在'
      });
    }
    
    // 验证type字段
    if (type) {
      const validTypes = ['common', 'product'];
      if (!validTypes.includes(type)) {
        return res.status(400).json({
          success: false,
          error: '菌菇类型必须是common或product'
        });
      }
    }
    
    await mushroom.update({
      name,
      scientificName,
      description,
      category,
      season,
      image,
      cultivationDifficulty,
      cultivationGuide,
      type: type !== undefined ? type : mushroom.type
    });
    
    res.status(200).json({
      success: true,
      data: mushroom
    });
  } catch (error) {
    console.error('更新菌菇失败:', error);
    res.status(500).json({
      success: false,
      error: '更新菌菇失败' + (error.message ? `: ${error.message}` : '')
    });
  }
};

// 删除菌菇（管理员）
exports.deleteMushroom = async (req, res) => {
  try {
    const { id } = req.params;
    
    const mushroom = await Mushroom.findByPk(id);
    
    if (!mushroom) {
      return res.status(404).json({
        success: false,
        error: '菌菇信息不存在'
      });
    }
    
    await mushroom.destroy();
    
    res.status(200).json({
      success: true,
      message: '菌菇信息删除成功'
    });
  } catch (error) {
    console.error('删除菌菇失败:', error);
    res.status(500).json({
      success: false,
      error: '删除菌菇失败' + (error.message ? `: ${error.message}` : '')
    });
  }
};

// 搜索菌菇
exports.searchMushrooms = async (req, res) => {
  try {
    const { keyword, category, season, cultivationDifficulty } = req.query;
    
    const where = {};
    
    if (keyword) {
      where[Op.or] = [
        { name: { [Op.like]: `%${keyword}%` } },
        { scientificName: { [Op.like]: `%${keyword}%` } },
        { description: { [Op.like]: `%${keyword}%` } }
      ];
    }
    
    if (category) {
      where.category = category;
    }
    
    if (season) {
      where.season = season;
    }
    
    if (cultivationDifficulty) {
      where.cultivationDifficulty = cultivationDifficulty;
    }
    
    const mushrooms = await Mushroom.findAll({
      where,
      attributes: ['id', 'name', 'scientificName', 'description', 'category', 'season', 'image', 'cultivationDifficulty', 'type']
    });
    
    res.status(200).json({
      success: true,
      data: mushrooms
    });
  } catch (error) {
    console.error('搜索菌菇失败:', error);
    res.status(500).json({
      success: false,
      error: '搜索菌菇失败' + (error.message ? `: ${error.message}` : '')
    });
  }
};