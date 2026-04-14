const recipeMatchingService = require('../services/recipeMatchingService');
const cookingVideoService = require('../services/cookingVideoService');

// 食谱智能搭配控制器

// 基于蘑菇品种推荐食谱
exports.recommendRecipesByMushroom = async (req, res) => {
  try {
    const { mushroomId } = req.params;
    const { userId, limit } = req.query;
    
    const recipes = await recipeMatchingService.recommendRecipesByMushroom(parseInt(mushroomId), {
      userId: userId ? parseInt(userId) : null,
      limit: limit ? parseInt(limit) : 10
    });
    
    res.status(200).json({
      success: true,
      data: recipes
    });
  } catch (error) {
    console.error('基于蘑菇推荐食谱失败:', error);
    res.status(500).json({
      success: false,
      error: '基于蘑菇推荐食谱失败' + (error.message ? `: ${error.message}` : '')
    });
  }
};

// 基于用户偏好推荐食谱
exports.recommendRecipesByUser = async (req, res) => {
  try {
    const { id: userId } = req.user;
    const { limit } = req.query;
    
    const recipes = await recipeMatchingService.recommendRecipesByUserPreference(userId, {
      limit: limit ? parseInt(limit) : 10
    });
    
    res.status(200).json({
      success: true,
      data: recipes
    });
  } catch (error) {
    console.error('基于用户偏好推荐食谱失败:', error);
    res.status(500).json({
      success: false,
      error: '基于用户偏好推荐食谱失败' + (error.message ? `: ${error.message}` : '')
    });
  }
};

// 获取热门食谱
exports.getPopularRecipes = async (req, res) => {
  try {
    const { limit } = req.query;
    
    const recipes = await recipeMatchingService.getPopularRecipes(limit ? parseInt(limit) : 10);
    
    res.status(200).json({
      success: true,
      data: recipes
    });
  } catch (error) {
    console.error('获取热门食谱失败:', error);
    res.status(500).json({
      success: false,
      error: '获取热门食谱失败' + (error.message ? `: ${error.message}` : '')
    });
  }
};

// 获取食材搭配建议
exports.getIngredientSuggestions = async (req, res) => {
  try {
    const { mushroomName } = req.params;
    
    const suggestions = recipeMatchingService.generateIngredientSuggestions(mushroomName);
    
    res.status(200).json({
      success: true,
      data: suggestions
    });
  } catch (error) {
    console.error('获取食材搭配建议失败:', error);
    res.status(500).json({
      success: false,
      error: '获取食材搭配建议失败' + (error.message ? `: ${error.message}` : '')
    });
  }
};

// 执行智能匹配
exports.performSmartMatching = async (req, res) => {
  try {
    const { mushroomId, boxId, limit = 5, includeVideos = true, userPreferences, mushroomFeatures, mushroomInfo } = req.body;
    
    // 执行智能匹配
    const matchingResult = await recipeMatchingService.performSmartMatching({
      mushroomId,
      boxId,
      limit,
      includeVideos,
      userPreferences,
      mushroomFeatures,
      mushroomInfo
    });
    
    res.status(200).json({
      success: true,
      data: matchingResult
    });
  } catch (error) {
    console.error('智能匹配失败:', error);
    res.status(500).json({
      success: false,
      error: '智能匹配失败' + (error.message ? `: ${error.message}` : '')
    });
  }
};

// 推荐烹饪视频
exports.recommendVideos = async (req, res) => {
  try {
    const { mushroomId, limit = 5, userPreferences } = req.query;
    
    // 获取视频推荐
    const videos = await cookingVideoService.recommendVideos({
      mushroomId: mushroomId ? parseInt(mushroomId) : null,
      limit: parseInt(limit),
      userPreferences: userPreferences ? JSON.parse(userPreferences) : null
    });
    
    res.status(200).json({
      success: true,
      data: videos
    });
  } catch (error) {
    console.error('视频推荐失败:', error);
    res.status(500).json({
      success: false,
      error: '视频推荐失败' + (error.message ? `: ${error.message}` : '')
    });
  }
};

// 获取匹配历史
exports.getMatchingHistory = async (req, res) => {
  try {
    const { id: userId } = req.user;
    const { limit = 20, offset = 0 } = req.query;
    
    // 获取匹配历史
    const history = await recipeMatchingService.getMatchingHistory(userId, {
      limit: parseInt(limit),
      offset: parseInt(offset)
    });
    
    res.status(200).json({
      success: true,
      data: history
    });
  } catch (error) {
    console.error('获取匹配历史失败:', error);
    res.status(500).json({
      success: false,
      error: '获取匹配历史失败' + (error.message ? `: ${error.message}` : '')
    });
  }
};

// 提交用户反馈
exports.submitUserFeedback = async (req, res) => {
  try {
    const { id: userId } = req.user;
    const { matchingId, feedback } = req.body;
    
    // 提交用户反馈
    const result = await recipeMatchingService.submitUserFeedback(userId, matchingId, feedback);
    
    res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('提交用户反馈失败:', error);
    res.status(500).json({
      success: false,
      error: '提交用户反馈失败' + (error.message ? `: ${error.message}` : '')
    });
  }
};