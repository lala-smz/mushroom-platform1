const mushroomDataService = require('../services/mushroomDataService');

// 蘑菇数据相关控制器

// 获取当季蘑菇列表
exports.getSeasonalMushrooms = async (req, res) => {
  try {
    const { season } = req.query;
    const mushrooms = await mushroomDataService.getSeasonalMushrooms(season);
    
    res.status(200).json({
      success: true,
      data: mushrooms
    });
  } catch (error) {
    console.error('获取当季蘑菇列表失败:', error);
    res.status(500).json({
      success: false,
      error: '获取当季蘑菇列表失败'
    });
  }
};

// 手动触发蘑菇数据更新
exports.updateMushroomData = async (req, res) => {
  try {
    const updateResult = await mushroomDataService.executeUpdate();
    
    res.status(200).json({
      success: updateResult.success,
      message: updateResult.message,
      data: updateResult
    });
  } catch (error) {
    console.error('更新蘑菇数据失败:', error);
    res.status(500).json({
      success: false,
      error: '更新蘑菇数据失败'
    });
  }
};

// 获取蘑菇详细信息
exports.getMushroomDetails = async (req, res) => {
  try {
    const { id } = req.params;
    const mushrooms = await mushroomDataService.fetchMushroomData();
    const mushroom = mushrooms.find(m => m.id === parseInt(id));
    
    if (!mushroom) {
      return res.status(404).json({
        success: false,
        error: '蘑菇不存在'
      });
    }
    
    res.status(200).json({
      success: true,
      data: mushroom
    });
  } catch (error) {
    console.error('获取蘑菇详细信息失败:', error);
    res.status(500).json({
      success: false,
      error: '获取蘑菇详细信息失败'
    });
  }
};

// 获取蘑菇食材搭配建议
exports.getIngredientSuggestions = async (req, res) => {
  try {
    const { mushroomName } = req.params;
    const recipeMatchingService = require('../services/recipeMatchingService');
    const suggestions = recipeMatchingService.generateIngredientSuggestions(mushroomName);
    
    res.status(200).json({
      success: true,
      data: suggestions
    });
  } catch (error) {
    console.error('获取食材搭配建议失败:', error);
    res.status(500).json({
      success: false,
      error: '获取食材搭配建议失败'
    });
  }
};