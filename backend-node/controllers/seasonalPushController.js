const seasonalPushService = require('../services/seasonalPushService');

// 季节信息推送控制器

// 手动触发季节信息推送
exports.sendSeasonalPush = async (req, res) => {
  try {
    const result = await seasonalPushService.sendSeasonalPush();
    
    res.status(200).json({
      success: true,
      data: {
        pushedCount: result
      },
      message: `已向 ${result} 个用户发送季节信息推送`
    });
  } catch (error) {
    console.error('发送季节信息推送失败:', error);
    res.status(500).json({
      success: false,
      error: '发送季节信息推送失败' + (error.message ? `: ${error.message}` : '')
    });
  }
};

// 手动触发当季食谱推送
exports.sendSeasonalRecipesPush = async (req, res) => {
  try {
    const result = await seasonalPushService.sendSeasonalRecipesPush();
    
    res.status(200).json({
      success: true,
      data: {
        pushedCount: result
      },
      message: `已向 ${result} 个用户发送当季食谱推送`
    });
  } catch (error) {
    console.error('发送当季食谱推送失败:', error);
    res.status(500).json({
      success: false,
      error: '发送当季食谱推送失败' + (error.message ? `: ${error.message}` : '')
    });
  }
};

// 手动触发当季视频推送
exports.sendSeasonalVideosPush = async (req, res) => {
  try {
    const result = await seasonalPushService.sendSeasonalVideosPush();
    
    res.status(200).json({
      success: true,
      data: {
        pushedCount: result
      },
      message: `已向 ${result} 个用户发送当季视频推送`
    });
  } catch (error) {
    console.error('发送当季视频推送失败:', error);
    res.status(500).json({
      success: false,
      error: '发送当季视频推送失败' + (error.message ? `: ${error.message}` : '')
    });
  }
};

// 执行所有季节推送任务
exports.executeAllPushTasks = async (req, res) => {
  try {
    const result = await seasonalPushService.executeAllPushTasks();
    
    res.status(200).json({
      success: true,
      data: result,
      message: `季节推送任务执行完成，共向 ${result.seasonalInfo + result.seasonalRecipes + result.seasonalVideos} 个用户发送推送`
    });
  } catch (error) {
    console.error('执行季节推送任务失败:', error);
    res.status(500).json({
      success: false,
      error: '执行季节推送任务失败' + (error.message ? `: ${error.message}` : '')
    });
  }
};