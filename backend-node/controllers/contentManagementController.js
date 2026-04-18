const Mushroom = require('../models/Mushroom');
const Recipe = require('../models/Recipe');
const CookingVideo = require('../models/CookingVideo');
const ContentReview = require('../models/ContentReview');
const { Op } = require('sequelize');
const { sequelize } = require('../config/db');

// 内容管理控制器

// 菌菇相关API

// 上传菌菇资料
exports.uploadMushroom = async (req, res) => {
  try {
    const { name, scientificName, description, morphology, growthEnvironment, nutritionalValue, safetyInfo, cookingMethods, selectionTips, season, cultivationGuide, cultivationDifficulty, category, originInfo, storageMethods, healthBenefits, culturalInfo, marketInfo, dataSource, image } = req.body;
    
    const mushroom = await Mushroom.create({
      name,
      scientificName,
      description,
      morphology,
      growthEnvironment,
      nutritionalValue,
      safetyInfo,
      cookingMethods,
      selectionTips,
      season,
      cultivationGuide,
      cultivationDifficulty,
      category,
      originInfo,
      storageMethods,
      healthBenefits,
      culturalInfo,
      marketInfo,
      dataSource,
      image,
      status: 'active',
      dataUpdatedAt: new Date()
    });
    
    // 创建初始审核记录
    await ContentReview.create({
      contentId: mushroom.id,
      contentType: 'mushroom',
      status: 'pending',
      reviewNote: '新上传的菌菇资料，等待审核'
    });
    
    res.status(201).json({
      success: true,
      data: mushroom
    });
  } catch (error) {
    console.error('上传菌菇资料失败:', error);
    res.status(500).json({
      success: false,
      error: '上传菌菇资料失败'
    });
  }
};

// 删除菌菇资料
exports.deleteMushroom = async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await Mushroom.destroy({
      where: { id }
    });
    
    if (result === 0) {
      return res.status(404).json({
        success: false,
        error: '菌菇资料不存在'
      });
    }
    
    res.status(200).json({
      success: true,
      message: '菌菇资料删除成功'
    });
  } catch (error) {
    console.error('删除菌菇资料失败:', error);
    res.status(500).json({
      success: false,
      error: '删除菌菇资料失败'
    });
  }
};

// 菜谱相关API

// 上传菜谱
exports.uploadRecipe = async (req, res) => {
  try {
    const { name, description, difficulty, prepTime, cookTime, servings, image, videoUrl, nutritionalAnalysis, suitableFor, flavorProfile, cuisineType, mealType, mushroomCount, ingredients, steps } = req.body;
    
    const recipe = await Recipe.create({
      name,
      description,
      difficulty,
      prepTime,
      cookTime,
      servings,
      rating: 0,
      image,
      videoUrl,
      status: 'active',
      nutritionalAnalysis,
      suitableFor,
      flavorProfile,
      cuisineType,
      mealType,
      mushroomCount,
      popularity: 0,
      reviewCount: 0
    });
    
    // 创建初始审核记录
    await ContentReview.create({
      contentId: recipe.id,
      contentType: 'recipe',
      status: 'pending',
      reviewNote: '新上传的菜谱，等待审核'
    });
    
    res.status(201).json({
      success: true,
      data: recipe
    });
  } catch (error) {
    console.error('上传菜谱失败:', error);
    res.status(500).json({
      success: false,
      error: '上传菜谱失败'
    });
  }
};

// 删除菜谱
exports.deleteRecipe = async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await Recipe.destroy({
      where: { id }
    });
    
    if (result === 0) {
      return res.status(404).json({
        success: false,
        error: '菜谱不存在'
      });
    }
    
    res.status(200).json({
      success: true,
      message: '菜谱删除成功'
    });
  } catch (error) {
    console.error('删除菜谱失败:', error);
    res.status(500).json({
      success: false,
      error: '删除菜谱失败'
    });
  }
};

// 烹饪视频相关API

const multer = require('multer');
const path = require('path');
const fs = require('fs');

// 确保视频上传目录存在
const videoUploadDir = path.join(__dirname, '../uploads/videos');
const thumbnailUploadDir = path.join(__dirname, '../uploads/thumbnails');
if (!fs.existsSync(videoUploadDir)) {
  fs.mkdirSync(videoUploadDir, { recursive: true });
}
if (!fs.existsSync(thumbnailUploadDir)) {
  fs.mkdirSync(thumbnailUploadDir, { recursive: true });
}

// 配置文件上传
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    if (file.fieldname === 'video') {
      cb(null, videoUploadDir);
    } else if (file.fieldname === 'thumbnail') {
      cb(null, thumbnailUploadDir);
    } else {
      cb(new Error('Invalid file field'));
    }
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

// 上传烹饪视频
exports.uploadCookingVideo = async (req, res) => {
  try {
    // 使用multer中间件处理文件上传
    upload.fields([
      { name: 'video', maxCount: 1 },
      { name: 'thumbnail', maxCount: 1 }
    ])(req, res, async (err) => {
      if (err) {
        console.error('上传视频文件失败:', err);
        return res.status(400).json({
          success: false,
          error: '上传视频文件失败: ' + err.message
        });
      }
      
      const { title, description, duration, recipeId, mushroomId, quality, source, boxId, status } = req.body;
      
      // 处理视频文件
      let videoUrl = req.body.videoUrl;
      if (req.files && req.files.video && req.files.video[0]) {
        const videoFile = req.files.video[0];
        videoUrl = `/uploads/videos/${videoFile.filename}`;
      }
      
      // 处理封面文件
      let thumbnailUrl = req.body.thumbnailUrl;
      if (req.files && req.files.thumbnail && req.files.thumbnail[0]) {
        const thumbnailFile = req.files.thumbnail[0];
        thumbnailUrl = `/uploads/thumbnails/${thumbnailFile.filename}`;
      }
      
      const video = await CookingVideo.create({
        title,
        description,
        videoUrl,
        thumbnailUrl,
        duration,
        recipeId,
        mushroomId,
        quality,
        source,
        viewCount: 0,
        likeCount: 0,
        favoriteCount: 0,
        status: status || 'active',
        reviewStatus: 'pending',
        mushroomType: req.body.mushroomType || null,
        mushroomBoxId: boxId || null,
        createdBy: req.user?.id || null
      });
      
      // 创建初始审核记录
      await ContentReview.create({
        contentId: video.id,
        contentType: 'cookingVideo',
        status: 'pending',
        reviewNote: '新上传的烹饪视频，等待审核'
      });
      
      res.status(201).json({
        success: true,
        data: video
      });
    });
  } catch (error) {
    console.error('上传烹饪视频失败:', error);
    res.status(500).json({
      success: false,
      error: '上传烹饪视频失败' + (error.message ? `: ${error.message}` : '')
    });
  }
};

// 删除烹饪视频
exports.deleteCookingVideo = async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await CookingVideo.destroy({
      where: { id }
    });
    
    if (result === 0) {
      return res.status(404).json({
        success: false,
        error: '烹饪视频不存在'
      });
    }
    
    res.status(200).json({
      success: true,
      message: '烹饪视频删除成功'
    });
  } catch (error) {
    console.error('删除烹饪视频失败:', error);
    res.status(500).json({
      success: false,
      error: '删除烹饪视频失败'
    });
  }
};

// 内容审核API

// 审核内容
exports.reviewContent = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, reviewNote, accuracyScore, professionalismScore, legalityScore, issueTypes, suggestedChanges, contentType } = req.body;
    const { id: reviewerId } = req.user;
    
    // 更新审核记录
    const review = await ContentReview.create({
      contentId: id,
      contentType,
      reviewerId,
      status,
      reviewNote,
      accuracyScore,
      professionalismScore,
      legalityScore,
      issueTypes,
      suggestedChanges
    });
    
    // 根据内容类型更新对应内容的状态
    if (contentType === 'mushroom') {
      await Mushroom.update({ status: status === 'approved' ? 'active' : 'inactive' }, { where: { id } });
    } else if (contentType === 'recipe') {
      await Recipe.update({ status: status === 'approved' ? 'active' : 'inactive' }, { where: { id } });
    } else if (contentType === 'cookingVideo') {
      await CookingVideo.update({ reviewStatus: status }, { where: { id } });
    }
    
    res.status(200).json({
      success: true,
      data: review
    });
  } catch (error) {
    console.error('审核内容失败:', error);
    res.status(500).json({
      success: false,
      error: '审核内容失败'
    });
  }
};

// 多维度筛选API

// 筛选菌菇
exports.filterMushrooms = async (req, res) => {
  try {
    const { category, season, difficulty, search } = req.query;
    
    const where = {};
    
    if (category) {
      where.category = category;
    }
    
    if (season) {
      where.season = {
        [Op.like]: `%${season}%`
      };
    }
    
    if (difficulty) {
      where.cultivationDifficulty = difficulty;
    }
    
    if (search) {
      where[Op.or] = [
        { name: { [Op.like]: `%${search}%` } },
        { scientificName: { [Op.like]: `%${search}%` } },
        { description: { [Op.like]: `%${search}%` } }
      ];
    }
    
    const mushrooms = await Mushroom.findAll({ where });
    
    res.status(200).json({
      success: true,
      data: mushrooms
    });
  } catch (error) {
    console.error('筛选菌菇失败:', error);
    res.status(500).json({
      success: false,
      error: '筛选菌菇失败'
    });
  }
};

// 筛选菜谱
exports.filterRecipes = async (req, res) => {
  try {
    const { difficulty, cuisineType, mealType, cookingTime, search } = req.query;
    
    const where = {};
    
    if (difficulty) {
      where.difficulty = difficulty;
    }
    
    if (cuisineType) {
      where.cuisineType = cuisineType;
    }
    
    if (mealType) {
      where.mealType = mealType;
    }
    
    if (cookingTime) {
      where.cookTime = {
        [Op.lte]: cookingTime
      };
    }
    
    if (search) {
      where[Op.or] = [
        { name: { [Op.like]: `%${search}%` } },
        { description: { [Op.like]: `%${search}%` } }
      ];
    }
    
    const recipes = await Recipe.findAll({ where });
    
    res.status(200).json({
      success: true,
      data: recipes
    });
  } catch (error) {
    console.error('筛选菜谱失败:', error);
    res.status(500).json({
      success: false,
      error: '筛选菜谱失败'
    });
  }
};

// 筛选烹饪视频
exports.filterCookingVideos = async (req, res) => {
  try {
    const { recipeId, mushroomId, quality, search } = req.query;
    
    const where = {};
    
    if (recipeId) {
      where.recipeId = recipeId;
    }
    
    if (mushroomId) {
      where.mushroomId = mushroomId;
    }
    
    if (quality) {
      where.quality = quality;
    }
    
    if (search) {
      where[Op.or] = [
        { title: { [Op.like]: `%${search}%` } },
        { description: { [Op.like]: `%${search}%` } }
      ];
    }
    
    const videos = await CookingVideo.findAll({ where });
    
    res.status(200).json({
      success: true,
      data: videos
    });
  } catch (error) {
    console.error('筛选烹饪视频失败:', error);
    res.status(500).json({
      success: false,
      error: '筛选烹饪视频失败'
    });
  }
};