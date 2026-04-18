const cookingVideoService = require('../services/cookingVideoService');

// 烹饪视频推送控制器

// 基于用户口味偏好推荐视频
exports.recommendVideosByUser = async (req, res) => {
  try {
    const { id: userId } = req.user;
    const { mushroomName, recipeId, limit } = req.query;
    
    // 获取用户偏好（假设UserPreference模型存在）
    const UserPreference = require('../models/UserPreference');
    const userPreference = await UserPreference.findOne({ where: { userId } });
    
    const videos = await cookingVideoService.recommendVideosByUserPreference(userPreference, {
      mushroomName,
      recipeId: recipeId ? parseInt(recipeId) : null,
      limit: limit ? parseInt(limit) : 10
    });
    
    res.status(200).json({
      success: true,
      data: videos
    });
  } catch (error) {
    console.error('基于用户偏好推荐视频失败:', error);
    res.status(500).json({
      success: false,
      error: '基于用户偏好推荐视频失败' + (error.message ? `: ${error.message}` : '')
    });
  }
};

// 获取与食谱匹配的视频
exports.getVideosForRecipe = async (req, res) => {
  try {
    const { recipeId } = req.params;
    const { userId, limit } = req.query;
    
    const videos = await cookingVideoService.getVideosForRecipe(parseInt(recipeId), {
      userId: userId ? parseInt(userId) : null,
      limit: limit ? parseInt(limit) : 5
    });
    
    res.status(200).json({
      success: true,
      data: videos
    });
  } catch (error) {
    console.error('获取与食谱匹配的视频失败:', error);
    res.status(500).json({
      success: false,
      error: '获取与食谱匹配的视频失败' + (error.message ? `: ${error.message}` : '')
    });
  }
};

// 基于蘑菇品种推荐视频
exports.recommendVideosByMushroom = async (req, res) => {
  try {
    const { mushroomName } = req.params;
    const { userId, limit } = req.query;
    
    const videos = await cookingVideoService.recommendVideosByMushroom(mushroomName, {
      userId: userId ? parseInt(userId) : null,
      limit: limit ? parseInt(limit) : 10
    });
    
    res.status(200).json({
      success: true,
      data: videos
    });
  } catch (error) {
    console.error('基于蘑菇品种推荐视频失败:', error);
    res.status(500).json({
      success: false,
      error: '基于蘑菇品种推荐视频失败' + (error.message ? `: ${error.message}` : '')
    });
  }
};

// 搜索烹饪视频
exports.searchCookingVideos = async (req, res) => {
  try {
    const { keyword, mushroomName, limit } = req.query;
    
    // 模拟搜索逻辑，实际项目中应扩展fetchCookingVideos方法支持关键词搜索
    const videos = await cookingVideoService.fetchCookingVideos({
      mushroomName,
      limit: limit ? parseInt(limit) : 10
    });
    
    // 简单的关键词过滤
    const filteredVideos = keyword 
      ? videos.filter(video => 
          video.title.includes(keyword) || 
          video.description.includes(keyword) || 
          video.tags.some(tag => tag.includes(keyword))
        )
      : videos;
    
    res.status(200).json({
      success: true,
      data: filteredVideos
    });
  } catch (error) {
    console.error('搜索烹饪视频失败:', error);
    res.status(500).json({
      success: false,
      error: '搜索烹饪视频失败' + (error.message ? `: ${error.message}` : '')
    });
  }
};