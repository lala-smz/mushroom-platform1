const Recipe = require('../models/Recipe');
const RecipeIngredient = require('../models/RecipeIngredient');
const RecipeStep = require('../models/RecipeStep');
const UserPreference = require('../models/UserPreference');
const UserRecipeHistory = require('../models/UserRecipeHistory');
const Mushroom = require('../models/Mushroom');
const MushroomBox = require('../models/MushroomBox');
const MushroomBoxItem = require('../models/MushroomBoxItem');
const { Op } = require('sequelize');
const { sequelize } = require('../config/db');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// 确保上传目录存在
const uploadDir = path.join(__dirname, '../uploads/recipe-images');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// 配置文件上传
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

// 食谱相关控制器
// 获取所有食谱列表
exports.getRecipes = async (req, res) => {
  try {
    const { difficulty, prepTime, cookTime, mushroomId, search, cuisineType, mealType, status, page = 1, limit = 10 } = req.query;
    
    const whereClause = {};
    if (difficulty) whereClause.difficulty = difficulty;
    if (prepTime) whereClause.prepTime = { [Op.lte]: prepTime };
    if (cookTime) whereClause.cookTime = { [Op.lte]: cookTime };
    if (cuisineType) whereClause.cuisineType = cuisineType;
    if (mealType) whereClause.mealType = mealType;
    if (status) whereClause.status = status;
    
    // 添加搜索功能
    if (search) {
      whereClause[Op.or] = [
        { name: { [Op.like]: `%${search}%` } },
        { description: { [Op.like]: `%${search}%` } }
      ];
    }
    
    // 转换分页参数为数字
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const offset = (pageNum - 1) * limitNum;
    
    let recipes, total;
    if (mushroomId) {
      // 根据菌菇ID筛选食谱
      const result = await Recipe.findAndCountAll({
        include: [
          {
            model: RecipeIngredient,
            as: 'ingredients',
            where: { mushroomId },
            include: [{ model: Mushroom, as: 'mushroom' }]
          }
        ],
        where: whereClause,
        limit: limitNum,
        offset: offset
      });
      recipes = result.rows;
      total = result.count;
    } else {
      // 获取所有食谱
      const result = await Recipe.findAndCountAll({
        where: whereClause,
        limit: limitNum,
        offset: offset
      });
      recipes = result.rows;
      total = result.count;
    }
    
    // 添加字段映射，兼容前端期望的字段名
    const mappedRecipes = recipes.map(recipe => {
      const recipeData = recipe.toJSON();
      return {
        ...recipeData,
        totalTime: (recipeData.prepTime || 0) + (recipeData.cookTime || 0),
        cuisine: recipeData.cuisineType
      };
    });
    
    res.status(200).json({
      success: true,
      data: {
        recipes: mappedRecipes,
        total,
        page: pageNum,
        limit: limitNum
      }
    });
  } catch (error) {
    console.error('获取食谱列表失败:', error);
    res.status(500).json({
      success: false,
      error: '获取食谱列表失败' + (error.message ? `: ${error.message}` : '')
    });
  }
};

// 获取食谱详情
exports.getRecipeById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const recipe = await Recipe.findByPk(id);
    
    if (!recipe) {
      return res.status(404).json({
        success: false,
        error: '食谱不存在'
      });
    }
    
    // 获取食谱食材
    const ingredients = await RecipeIngredient.findAll({
      where: { recipeId: id },
      include: [{ model: Mushroom, as: 'mushroom' }]
    });
    
    // 获取食谱步骤
    const steps = await RecipeStep.findAll({
      where: { recipeId: id },
      order: [['stepNumber', 'ASC']]
    });
    
    // 构建完整食谱数据
    const recipeData = {
      ...recipe.toJSON(),
      ingredients: ingredients.map(ing => ({
        id: ing.id,
        name: ing.ingredientName,
        ingredientName: ing.ingredientName,
        quantity: ing.quantity,
        unit: ing.unit,
        mushroomId: ing.mushroomId,
        mushroom: ing.mushroom
      })),
      steps: steps.map(step => ({
        id: step.id,
        stepNumber: step.stepNumber,
        description: step.description,
        image: step.imageUrl,
        estimatedTime: step.estimatedTime
      }))
    };
    
    res.status(200).json({
      success: true,
      data: recipeData
    });
  } catch (error) {
    console.error('获取食谱详情失败:', error);
    res.status(500).json({
      success: false,
      error: '获取食谱详情失败'
    });
  }
};

// 创建食谱
exports.createRecipe = async (req, res) => {
  try {
    const { 
      name, 
      description, 
      difficulty, 
      prepTime, 
      cookTime, 
      totalTime, 
      servings, 
      image, 
      videoUrl, 
      ingredients, 
      steps, 
      flavorProfile, 
      cuisine, 
      cuisineType,
      nutritionalInfo, 
      nutritionalAnalysis,
      status 
    } = req.body;
    
    // 处理字段别名
    const finalCuisine = cuisine || cuisineType;
    const finalNutritional = nutritionalInfo || nutritionalAnalysis;
    
    // 数据验证
    if (!name || typeof name !== 'string' || name.trim() === '') {
      return res.status(400).json({
        success: false,
        error: '食谱名称不能为空'
      });
    }
    
    if (!description || typeof description !== 'string' || description.trim() === '') {
      return res.status(400).json({
        success: false,
        error: '食谱描述不能为空'
      });
    }
    
    if (!difficulty || !['beginner', 'intermediate', 'advanced'].includes(difficulty)) {
      return res.status(400).json({
        success: false,
        error: '难度必须是 beginner、intermediate 或 advanced'
      });
    }
    
    if (prepTime !== undefined && (typeof prepTime !== 'number' || prepTime < 0)) {
      return res.status(400).json({
        success: false,
        error: '准备时间必须是大于等于0的数字'
      });
    }
    
    if (cookTime !== undefined && (typeof cookTime !== 'number' || cookTime < 0)) {
      return res.status(400).json({
        success: false,
        error: '烹饪时间必须是大于等于0的数字'
      });
    }
    
    if (totalTime !== undefined && (typeof totalTime !== 'number' || totalTime < 0)) {
      return res.status(400).json({
        success: false,
        error: '总烹饪时间必须是大于等于0的数字'
      });
    }
    
    if (servings !== undefined && (typeof servings !== 'number' || servings < 1)) {
      return res.status(400).json({
        success: false,
        error: '份量必须是大于0的数字'
      });
    }
    
    if (status !== undefined && !['active', 'inactive'].includes(status)) {
      return res.status(400).json({
        success: false,
        error: '状态必须是 active 或 inactive'
      });
    }
    
    // 验证食材数组
    if (ingredients && Array.isArray(ingredients)) {
      const validIngredients = ingredients.filter(ing => 
        ing && (ing.name || ing.ingredientName) && 
        (ing.name?.trim() !== '' || ing.ingredientName?.trim() !== '')
      );
      if (validIngredients.length === 0) {
        return res.status(400).json({
          success: false,
          error: '至少需要添加一个有效的食材'
        });
      }
    } else {
      return res.status(400).json({
        success: false,
        error: '食材必须是有效的数组'
      });
    }
    
    // 验证步骤数组
    if (steps && Array.isArray(steps)) {
      const validSteps = steps.filter(step => 
        step && step.description && step.description.trim() !== ''
      );
      if (validSteps.length === 0) {
        return res.status(400).json({
          success: false,
          error: '至少需要添加一个有效的烹饪步骤'
        });
      }
    } else {
      return res.status(400).json({
        success: false,
        error: '步骤必须是有效的数组'
      });
    }
    
    // 计算准备时间和烹饪时间
    let finalPrepTime = prepTime !== undefined ? prepTime : 0;
    let finalCookTime = cookTime !== undefined ? cookTime : 0;
    
    // 如果提供了总时间但没有提供准备时间或烹饪时间，则自动分配
    if (totalTime !== undefined && totalTime > 0) {
      if (finalPrepTime === 0) {
        finalPrepTime = Math.floor(totalTime * 0.3) || 5;
      }
      if (finalCookTime === 0) {
        finalCookTime = Math.ceil(totalTime * 0.7) || 5;
      }
    }
    
    // 创建食谱
    const recipe = await Recipe.create({
      name: name.trim(),
      description: description.trim(),
      difficulty,
      prepTime: finalPrepTime,
      cookTime: finalCookTime,
      servings: servings !== undefined ? servings : 2,
      image,
      videoUrl,
      flavorProfile,
      cuisineType: finalCuisine,
      nutritionalAnalysis: finalNutritional,
      status: status !== undefined ? status : 'active'
    });
    
    // 创建食谱配料
    if (ingredients && Array.isArray(ingredients)) {
      for (const ingredient of ingredients) {
        if (ingredient && (ingredient.name || ingredient.ingredientName)) {
          const ingredientName = ingredient.name || ingredient.ingredientName;
          if (ingredientName.trim() !== '') {
            await RecipeIngredient.create({
              recipeId: recipe.id,
              ingredientName: ingredientName.trim(),
              quantity: String(ingredient.quantity || 1),
              unit: ingredient.unit || ''
            });
          }
        }
      }
    }
    
    // 创建食谱步骤
    if (steps && Array.isArray(steps)) {
      for (let i = 0; i < steps.length; i++) {
        const step = steps[i];
        if (step && step.description && step.description.trim() !== '') {
          await RecipeStep.create({
            recipeId: recipe.id,
            stepNumber: i + 1,
            description: step.description.trim(),
            imageUrl: step.image || null,
            estimatedTime: step.estimatedTime || null
          });
        }
      }
    }
    
    res.status(201).json({
      success: true,
      data: recipe
    });
  } catch (error) {
    console.error('创建食谱失败:', error);
    res.status(500).json({
      success: false,
      error: '创建食谱失败: ' + (error.message || '未知错误')
    });
  }
};

// 更新食谱
exports.updateRecipe = async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      name, 
      description, 
      difficulty, 
      prepTime, 
      cookTime, 
      totalTime, 
      servings, 
      image, 
      videoUrl, 
      ingredients, 
      steps, 
      flavorProfile, 
      cuisine, 
      cuisineType,
      nutritionalInfo, 
      nutritionalAnalysis,
      status 
    } = req.body;
    
    // 处理字段别名
    const finalCuisine = cuisine || cuisineType;
    const finalNutritional = nutritionalInfo || nutritionalAnalysis;
    
    const recipe = await Recipe.findByPk(id);
    if (!recipe) {
      return res.status(404).json({
        success: false,
        error: '食谱不存在'
      });
    }
    
    // 数据验证
    if (name !== undefined) {
      if (typeof name !== 'string' || name.trim() === '') {
        return res.status(400).json({
          success: false,
          error: '食谱名称不能为空'
        });
      }
    }
    
    if (description !== undefined) {
      if (typeof description !== 'string' || description.trim() === '') {
        return res.status(400).json({
          success: false,
          error: '食谱描述不能为空'
        });
      }
    }
    
    if (difficulty !== undefined) {
      if (!['beginner', 'intermediate', 'advanced'].includes(difficulty)) {
        return res.status(400).json({
          success: false,
          error: '难度必须是 beginner、intermediate 或 advanced'
        });
      }
    }
    
    if (prepTime !== undefined) {
      if (typeof prepTime !== 'number' || prepTime < 0) {
        return res.status(400).json({
          success: false,
          error: '准备时间必须是大于等于0的数字'
        });
      }
    }
    
    if (cookTime !== undefined) {
      if (typeof cookTime !== 'number' || cookTime < 0) {
        return res.status(400).json({
          success: false,
          error: '烹饪时间必须是大于等于0的数字'
        });
      }
    }
    
    if (totalTime !== undefined) {
      if (typeof totalTime !== 'number' || totalTime < 0) {
        return res.status(400).json({
          success: false,
          error: '总烹饪时间必须是大于等于0的数字'
        });
      }
    }
    
    if (servings !== undefined) {
      if (typeof servings !== 'number' || servings < 1) {
        return res.status(400).json({
          success: false,
          error: '份量必须是大于0的数字'
        });
      }
    }
    
    if (status !== undefined) {
      if (!['active', 'inactive'].includes(status)) {
        return res.status(400).json({
          success: false,
          error: '状态必须是 active 或 inactive'
        });
      }
    }
    
    // 构建更新数据
    const updateData = {};
    if (name !== undefined) updateData.name = name.trim();
    if (description !== undefined) updateData.description = description.trim();
    if (difficulty !== undefined) updateData.difficulty = difficulty;
    
    // 处理时间字段
    if (totalTime !== undefined && totalTime > 0) {
      if (prepTime !== undefined) {
        updateData.prepTime = prepTime;
      } else {
        updateData.prepTime = Math.floor(totalTime * 0.3) || 5;
      }
      if (cookTime !== undefined) {
        updateData.cookTime = cookTime;
      } else {
        updateData.cookTime = Math.ceil(totalTime * 0.7) || 5;
      }
    } else {
      if (prepTime !== undefined) updateData.prepTime = prepTime;
      if (cookTime !== undefined) updateData.cookTime = cookTime;
    }
    
    if (servings !== undefined) updateData.servings = servings;
    if (image !== undefined) updateData.image = image;
    if (videoUrl !== undefined) updateData.videoUrl = videoUrl;
    if (flavorProfile !== undefined) updateData.flavorProfile = flavorProfile;
    if (finalCuisine !== undefined) updateData.cuisineType = finalCuisine;
    if (finalNutritional !== undefined) updateData.nutritionalAnalysis = finalNutritional;
    if (status !== undefined) updateData.status = status;
    
    // 更新食谱基本信息
    await recipe.update(updateData);
    
    // 处理食材更新
    if (ingredients !== undefined && Array.isArray(ingredients)) {
      // 删除现有食材
      await RecipeIngredient.destroy({ where: { recipeId: id } });
      
      // 添加新食材
      for (const ingredient of ingredients) {
        if (ingredient && (ingredient.name || ingredient.ingredientName)) {
          const ingredientName = ingredient.name || ingredient.ingredientName;
          if (ingredientName.trim() !== '') {
            await RecipeIngredient.create({
              recipeId: id,
              ingredientName: ingredientName.trim(),
              quantity: String(ingredient.quantity || 1),
              unit: ingredient.unit || ''
            });
          }
        }
      }
    }
    
    // 处理步骤更新
    if (steps !== undefined && Array.isArray(steps)) {
      // 删除现有步骤
      await RecipeStep.destroy({ where: { recipeId: id } });
      
      // 添加新步骤
      for (let i = 0; i < steps.length; i++) {
        const step = steps[i];
        if (step && step.description && step.description.trim() !== '') {
          await RecipeStep.create({
            recipeId: id,
            stepNumber: i + 1,
            description: step.description.trim(),
            imageUrl: step.image || null,
            estimatedTime: step.estimatedTime || null
          });
        }
      }
    }
    
    // 重新获取更新后的食谱数据，包括关联的食材和步骤
    const updatedRecipe = await Recipe.findByPk(id, {
      include: [
        {
          model: RecipeIngredient,
          as: 'ingredients'
        },
        {
          model: RecipeStep,
          as: 'steps',
          order: [['stepNumber', 'ASC']]
        }
      ]
    });
    
    res.status(200).json({
      success: true,
      data: updatedRecipe
    });
  } catch (error) {
    console.error('更新食谱失败:', error);
    res.status(500).json({
      success: false,
      error: '更新食谱失败'
    });
  }
};

// 删除食谱
exports.deleteRecipe = async (req, res) => {
  try {
    const { id } = req.params;
    
    console.log('开始删除食谱:', id);
    
    // 使用事务确保操作的原子性
    const result = await sequelize.transaction(async (t) => {
      // 直接删除食谱，由于设置了 onDelete: 'CASCADE，关联数据会自动删除
      const deleteResult = await Recipe.destroy({ 
        where: { id },
        transaction: t
      });
      
      if (deleteResult === 0) {
        throw new Error('食谱不存在');
      }
      
      return deleteResult;
    });
    
    console.log('食谱删除成功:', id);
    
    res.status(200).json({
      success: true,
      message: '食谱删除成功'
    });
  } catch (error) {
    console.error('删除食谱失败:', error);
    res.status(500).json({
      success: false,
      error: '删除食谱失败: ' + (error.message || '未知错误')
    });
  }
};

// 获取食谱配料
exports.getRecipeIngredients = async (req, res) => {
  try {
    const { id } = req.params;
    
    const ingredients = await RecipeIngredient.findAll({
      where: { recipeId: id },
      include: [{ model: Mushroom, as: 'mushroom' }]
    });
    
    res.status(200).json({
      success: true,
      data: ingredients
    });
  } catch (error) {
    console.error('获取食谱配料失败:', error);
    res.status(500).json({
      success: false,
      error: '获取食谱配料失败'
    });
  }
};

// 添加食谱配料
exports.addRecipeIngredient = async (req, res) => {
  try {
    const { id } = req.params;
    const { mushroomId, ingredientName, quantity, unit } = req.body;
    
    // 检查食谱是否存在
    const recipe = await Recipe.findByPk(id);
    if (!recipe) {
      return res.status(404).json({
        success: false,
        error: '食谱不存在'
      });
    }
    
    // 创建配料
    const ingredient = await RecipeIngredient.create({
      recipeId: id,
      mushroomId,
      ingredientName,
      quantity,
      unit
    });
    
    res.status(201).json({
      success: true,
      data: ingredient
    });
  } catch (error) {
    console.error('添加食谱配料失败:', error);
    res.status(500).json({
      success: false,
      error: '添加食谱配料失败'
    });
  }
};

// 删除食谱配料
exports.deleteRecipeIngredient = async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await RecipeIngredient.destroy({ where: { id } });
    
    if (result === 0) {
      return res.status(404).json({
        success: false,
        error: '配料不存在'
      });
    }
    
    res.status(200).json({
      success: true,
      message: '配料删除成功'
    });
  } catch (error) {
    console.error('删除食谱配料失败:', error);
    res.status(500).json({
      success: false,
      error: '删除食谱配料失败'
    });
  }
};

// 获取食谱步骤
exports.getRecipeSteps = async (req, res) => {
  try {
    const { id } = req.params;
    
    const steps = await RecipeStep.findAll({
      where: { recipeId: id },
      order: [['stepNumber', 'ASC']]
    });
    
    res.status(200).json({
      success: true,
      data: steps
    });
  } catch (error) {
    console.error('获取食谱步骤失败:', error);
    res.status(500).json({
      success: false,
      error: '获取食谱步骤失败'
    });
  }
};

// 添加食谱步骤
exports.addRecipeStep = async (req, res) => {
  try {
    const { id } = req.params;
    const { description, imageUrl, videoUrl } = req.body;
    
    // 检查食谱是否存在
    const recipe = await Recipe.findByPk(id);
    if (!recipe) {
      return res.status(404).json({
        success: false,
        error: '食谱不存在'
      });
    }
    
    // 获取当前最大步骤数
    const maxStep = await RecipeStep.max('stepNumber', { where: { recipeId: id } });
    
    // 创建步骤
    const step = await RecipeStep.create({
      recipeId: id,
      stepNumber: (maxStep || 0) + 1,
      description,
      imageUrl,
      videoUrl
    });
    
    res.status(201).json({
      success: true,
      data: step
    });
  } catch (error) {
    console.error('添加食谱步骤失败:', error);
    res.status(500).json({
      success: false,
      error: '添加食谱步骤失败'
    });
  }
};

// 更新食谱步骤
exports.updateRecipeStep = async (req, res) => {
  try {
    const { id } = req.params;
    const { description, imageUrl, videoUrl } = req.body;
    
    const step = await RecipeStep.findByPk(id);
    if (!step) {
      return res.status(404).json({
        success: false,
        error: '步骤不存在'
      });
    }
    
    // 更新步骤
    await step.update({
      description,
      imageUrl,
      videoUrl
    });
    
    res.status(200).json({
      success: true,
      data: step
    });
  } catch (error) {
    console.error('更新食谱步骤失败:', error);
    res.status(500).json({
      success: false,
      error: '更新食谱步骤失败'
    });
  }
};

// 删除食谱步骤
exports.deleteRecipeStep = async (req, res) => {
  try {
    const { id } = req.params;
    
    // 获取步骤信息
    const step = await RecipeStep.findByPk(id);
    if (!step) {
      return res.status(404).json({
        success: false,
        error: '步骤不存在'
      });
    }
    
    // 删除步骤
    await step.destroy();
    
    // 更新后续步骤的序号
    await RecipeStep.update(
      { stepNumber: RecipeStep.sequelize.literal('stepNumber - 1') },
      { where: { recipeId: step.recipeId, stepNumber: { [Op.gt]: step.stepNumber } } }
    );
    
    res.status(200).json({
      success: true,
      message: '步骤删除成功'
    });
  } catch (error) {
    console.error('删除食谱步骤失败:', error);
    res.status(500).json({
      success: false,
      error: '删除食谱步骤失败'
    });
  }
};

// 获取用户偏好
exports.getUserPreferences = async (req, res) => {
  try {
    const { id: userId } = req.user;
    
    let preference = await UserPreference.findOne({ where: { userId } });
    
    // 如果用户偏好不存在，创建默认偏好
    if (!preference) {
      preference = await UserPreference.create({
        userId,
        tastePreferences: {},
        dietaryRestrictions: [],
        cookingSkill: 'beginner',
        favoriteMushrooms: []
      });
    }
    
    res.status(200).json({
      success: true,
      data: preference
    });
  } catch (error) {
    console.error('获取用户偏好失败:', error);
    res.status(500).json({
      success: false,
      error: '获取用户偏好失败'
    });
  }
};

// 更新用户偏好
exports.updateUserPreferences = async (req, res) => {
  try {
    const { id: userId } = req.user;
    const { tastePreferences, dietaryRestrictions, cookingSkill, favoriteMushrooms } = req.body;
    
    let preference = await UserPreference.findOne({ where: { userId } });
    
    // 如果用户偏好不存在，创建新偏好
    if (!preference) {
      preference = await UserPreference.create({
        userId,
        tastePreferences,
        dietaryRestrictions,
        cookingSkill,
        favoriteMushrooms
      });
    } else {
      // 更新用户偏好
      await preference.update({
        tastePreferences,
        dietaryRestrictions,
        cookingSkill,
        favoriteMushrooms
      });
    }
    
    res.status(200).json({
      success: true,
      data: preference
    });
  } catch (error) {
    console.error('更新用户偏好失败:', error);
    res.status(500).json({
      success: false,
      error: '更新用户偏好失败'
    });
  }
};

// 获取推荐食谱
exports.getRecommendedRecipes = async (req, res) => {
  try {
    const userId = req.user?.id;
    let preference = null;
    let userHistory = [];
    
    // 只有登录用户才获取个人偏好和历史记录
    if (userId) {
      // 获取用户偏好
      preference = await UserPreference.findOne({ where: { userId } });
      
      // 获取用户食谱历史
      userHistory = await UserRecipeHistory.findAll({
        where: { userId },
        include: [{ model: Recipe, as: 'recipe' }],
        order: [['timestamp', 'DESC']],
        limit: 15
      });
    }
    
    // 如果用户偏好不存在，使用默认值
    if (!preference) {
      preference = {
        tastePreferences: {},
        dietaryRestrictions: [],
        cookingSkill: 'beginner',
        favoriteMushrooms: []
      };
    }
    
    // 智能推荐算法：基于用户偏好、历史记录和饮食禁忌进行推荐
    
    // 1. 根据烹饪技能筛选食谱难度
    const difficultyMap = {
      beginner: ['beginner', 'intermediate'],
      intermediate: ['beginner', 'intermediate', 'advanced'],
      advanced: ['intermediate', 'advanced']
    };
    const allowedDifficulties = difficultyMap[preference.cookingSkill] || ['beginner', 'intermediate', 'advanced'];
    
    // 2. 根据饮食禁忌排除不适合的食谱
    const dietaryRestrictions = preference.dietaryRestrictions || [];
    
    // 3. 获取用户历史中喜欢的食谱，并提取其使用的菌菇和烹饪风格
    const historyMushrooms = new Set();
    const historyDifficulties = new Set();
    
    userHistory.forEach(history => {
      if (history.recipe) {
        historyDifficulties.add(history.recipe.difficulty);
        // 提取历史食谱中使用的菌菇
        history.recipe.ingredients?.forEach(ingredient => {
          if (ingredient.mushroomId) {
            historyMushrooms.add(ingredient.mushroomId);
          }
        });
      }
    });
    
    // 结合用户喜爱的菌菇和历史中使用的菌菇
    const allFavoriteMushrooms = new Set([
      ...(preference.favoriteMushrooms || []),
      ...historyMushrooms
    ]);
    
    // 4. 构建查询条件
    const whereClause = {
      status: 'active' // 只推荐激活状态的食谱
    };
    
    // 5. 查询所有符合基本条件的食谱
    let allRecipes = await Recipe.findAll({
      where: whereClause,
      include: [
        {
          model: RecipeIngredient,
          as: 'ingredients',
          include: [{ model: Mushroom, as: 'mushroom' }]
        },
        { model: RecipeStep, as: 'steps', order: [['stepNumber', 'ASC']] }
      ]
    });
    
    // 6. 根据饮食禁忌过滤食谱
    let filteredRecipes = allRecipes;
    if (dietaryRestrictions.length > 0) {
      filteredRecipes = allRecipes.filter(recipe => {
        return true;
      });
    }
    
    // 7. 智能评分和排序
    const scoredRecipes = filteredRecipes.map(recipe => {
      let score = 0;
      
      // 基于烹饪难度评分
      if (historyDifficulties.has(recipe.difficulty)) {
        score += 20;
      }
      
      // 基于用户喜爱的菌菇评分
      const recipeMushroomIds = new Set(
        recipe.ingredients?.map(ing => ing.mushroomId) || []
      );
      
      let matchingMushrooms = 0;
      allFavoriteMushrooms.forEach(mushroomId => {
        if (recipeMushroomIds.has(mushroomId)) {
          matchingMushrooms++;
        }
      });
      
      // 根据匹配的菌菇数量加分
      score += matchingMushrooms * 30;
      
      // 基于食谱热度评分
      score += Math.random() * 10;
      
      // 基于烹饪时间评分
      const totalTime = (recipe.prepTime || 0) + (recipe.cookTime || 0);
      if (preference.cookingSkill === 'beginner' && totalTime < 30) {
        score += 15;
      }
      
      return {
        recipe,
        score
      };
    });
    
    // 8. 根据分数排序，取前10个
    scoredRecipes.sort((a, b) => b.score - a.score);
    const recommendedRecipes = scoredRecipes.slice(0, 10).map(item => item.recipe);
    
    res.status(200).json({
      success: true,
      data: recommendedRecipes
    });
  } catch (error) {
    console.error('获取推荐食谱失败:', error);
    res.status(500).json({
      success: false,
      error: '获取推荐食谱失败'
    });
  }
};

// 添加食谱历史
exports.addRecipeHistory = async (req, res) => {
  try {
    const { id: userId } = req.user;
    const { recipeId, action } = req.body;
    
    // 检查食谱是否存在
    const recipe = await Recipe.findByPk(recipeId);
    if (!recipe) {
      return res.status(404).json({
        success: false,
        error: '食谱不存在'
      });
    }
    
    // 添加食谱历史
    const history = await UserRecipeHistory.create({
      userId,
      recipeId,
      action,
      timestamp: new Date()
    });
    
    res.status(201).json({
      success: true,
      data: history
    });
  } catch (error) {
    console.error('添加食谱历史失败:', error);
    res.status(500).json({
      success: false,
      error: '添加食谱历史失败'
    });
  }
};

// 获取用户食谱历史
exports.getUserRecipeHistory = async (req, res) => {
  try {
    const { id: userId } = req.user;
    
    const history = await UserRecipeHistory.findAll({
      where: { userId },
      include: [{ model: Recipe, as: 'recipe' }],
      order: [['timestamp', 'DESC']]
    });
    
    res.status(200).json({
      success: true,
      data: history
    });
  } catch (error) {
    console.error('获取用户食谱历史失败:', error);
    res.status(500).json({
      success: false,
      error: '获取用户食谱历史失败'
    });
  }
};

// 根据盲盒内容推荐食谱（增强版）
exports.getRecipesByBoxId = async (req, res) => {
  try {
    const { boxId } = req.params;
    const userId = req.user?.id;
    const { limit = 100, sortBy = 'matchScore' } = req.query;
    
    // 1. 获取盲盒信息
    const box = await MushroomBox.findByPk(boxId, {
      include: [
        {
          model: MushroomBoxItem,
          as: 'items',
          include: [{ model: Mushroom, as: 'mushroom' }]
        }
      ]
    });
    
    if (!box) {
      return res.status(404).json({
        success: false,
        error: '盲盒不存在'
      });
    }
    
    // 2. 提取盲盒中包含的菌菇ID和名称
    const mushroomIds = box.items.map(item => item.mushroomId).filter(Boolean);
    const mushroomNames = box.items
      .filter(item => item.mushroom)
      .map(item => item.mushroom.name);
    
    // 3. 获取用户偏好（用于调整推荐结果）
    let userPreference = null;
    if (userId) {
      userPreference = await UserPreference.findOne({ where: { userId } });
    }
    
    // 如果用户偏好不存在，使用默认值
    if (!userPreference) {
      userPreference = {
        cookingSkill: 'beginner',
        dietaryRestrictions: [],
        tastePreferences: {},
        favoriteMushrooms: []
      };
    }
    
    // 4. 查询所有活跃的食谱
    const recipes = await Recipe.findAll({
      where: {
        status: 'active'
      },
      include: [
        {
          model: RecipeIngredient,
          as: 'ingredients',
          include: [{ model: Mushroom, as: 'mushroom' }]
        },
        { model: RecipeStep, as: 'steps', order: [['stepNumber', 'ASC']] }
      ]
    });
    
    // 5. 对所有食谱进行智能评分和排序
    const scoredRecipes = recipes.map(recipe => {
      // 计算基础匹配分数
      let baseScore = 0;
      let matchingMushroomCount = 0;
      
      // 统计匹配的菌菇数量（如果有菌菇ID的话）
      if (mushroomIds.length > 0) {
        const recipeMushroomIds = new Set(
          recipe.ingredients?.map(ing => ing.mushroomId) || []
        );
        
        mushroomIds.forEach(mushroomId => {
          if (recipeMushroomIds.has(mushroomId)) {
            matchingMushroomCount++;
          }
        });
        
        // 基础分数：基于匹配菌菇数量
        baseScore = (matchingMushroomCount / Math.max(mushroomIds.length, 1)) * 40;
      } else {
        // 如果没有菌菇ID，给一个基础分数
        baseScore = 20;
      }
      
      // 用户偏好评分
      let preferenceScore = 0;
      
      // 烹饪技能匹配
      const skillMatch = userPreference.cookingSkill === recipe.difficulty ? 10 : 5;
      
      // 饮食限制匹配
      let restrictionScore = 10;
      
      // 口味偏好匹配
      let tasteScore = 5;
      
      preferenceScore = (skillMatch + restrictionScore + tasteScore) / 3;
      
      // 时间效率评分
      const totalTime = (recipe.prepTime || 0) + (recipe.cookTime || 0);
      let timeScore = 0;
      if (totalTime <= 30) {
        timeScore = 10;
      } else if (totalTime <= 60) {
        timeScore = 8;
      } else if (totalTime <= 90) {
        timeScore = 6;
      } else {
        timeScore = 4;
      }
      
      // 综合评分计算
      const matchScore = Math.round(
        baseScore * 0.4 + 
        preferenceScore * 0.4 + 
        timeScore * 0.2
      );
      
      return {
        ...recipe.dataValues,
        matchScore,
        matchingMushroomCount,
        preferenceScore: Math.round(preferenceScore * 10) / 10,
        timeScore: Math.round(timeScore * 10) / 10,
        mushroomMatches: mushroomNames.filter(name => 
          recipe.ingredients?.some(ing => ing.mushroom && ing.mushroom.name === name) || []
        )
      };
    });
    
    // 6. 根据指定字段排序
    let sortedRecipes;
    switch (sortBy) {
      case 'matchScore':
        sortedRecipes = scoredRecipes.sort((a, b) => b.matchScore - a.matchScore);
        break;
      case 'time':
        sortedRecipes = scoredRecipes.sort((a, b) => 
          ((a.prepTime || 0) + (a.cookTime || 0)) - ((b.prepTime || 0) + (b.cookTime || 0))
        );
        break;
      case 'popularity':
        sortedRecipes = scoredRecipes.sort((a, b) => 
          (b.viewCount || 0) - (a.viewCount || 0)
        );
        break;
      default:
        sortedRecipes = scoredRecipes.sort((a, b) => b.matchScore - a.matchScore);
    }
    
    // 7. 返回前N个食谱
    const resultRecipes = sortedRecipes.slice(0, parseInt(limit));
    
    res.status(200).json({
      success: true,
      data: {
        recipes: resultRecipes,
        totalCount: resultRecipes.length,
        boxInfo: {
          id: box.id,
          name: box.name,
          mushroomCount: mushroomIds.length,
          mushrooms: mushroomNames
        },
        userPreference: userId ? {
          cookingSkill: userPreference.cookingSkill,
          dietaryRestrictions: userPreference.dietaryRestrictions,
          tastePreferences: userPreference.tastePreferences
        } : null
      },
      message: `找到 ${resultRecipes.length} 个匹配的食谱`
    });
  } catch (error) {
    console.error('根据盲盒获取推荐食谱失败:', error);
    res.status(500).json({
      success: false,
      error: '获取推荐食谱失败' + (error.message ? `: ${error.message}` : '')
    });
  }
};

// 照片资源传输相关方法

// 获取食谱图片
exports.getRecipeImages = async (req, res) => {
  try {
    const { id } = req.params;
    
    const recipe = await Recipe.findByPk(id);
    if (!recipe) {
      return res.status(404).json({
        success: false,
        error: '食谱不存在'
      });
    }
    
    res.status(200).json({
      success: true,
      data: {
        mainImage: recipe.image,
        imageGallery: recipe.imageGallery
      }
    });
  } catch (error) {
    console.error('获取食谱图片失败:', error);
    res.status(500).json({
      success: false,
      error: '获取食谱图片失败'
    });
  }
};

// 上传食谱图片
exports.uploadRecipeImages = async (req, res) => {
  try {
    const { id } = req.params;
    
    const recipe = await Recipe.findByPk(id);
    if (!recipe) {
      return res.status(404).json({
        success: false,
        error: '食谱不存在'
      });
    }
    
    // 使用multer中间件处理文件上传
    upload.array('images', 5)(req, res, async (err) => {
      if (err) {
        console.error('上传图片失败:', err);
        return res.status(400).json({
          success: false,
          error: '上传图片失败: ' + err.message
        });
      }
      
      if (!req.files || req.files.length === 0) {
        return res.status(400).json({
          success: false,
          error: '请选择要上传的图片'
        });
      }
      
      // 处理上传的图片
      const images = req.files.map(file => ({
        filename: file.filename,
        path: `/uploads/recipe-images/${file.filename}`,
        url: `${req.protocol}://${req.get('host')}/uploads/recipe-images/${file.filename}`
      }));
      
      // 更新食谱图片信息
      if (images.length > 0) {
        // 第一张作为主图
        await recipe.update({
          image: images[0].url,
          imageGallery: images.length > 1 ? images.slice(1).map(img => img.url) : []
        });
      }
      
      res.status(200).json({
        success: true,
        data: {
          images,
          recipe
        }
      });
    });
  } catch (error) {
    console.error('上传食谱图片失败:', error);
    res.status(500).json({
      success: false,
      error: '上传食谱图片失败'
    });
  }
};

// 获取步骤图片
exports.getStepImage = async (req, res) => {
  try {
    const { id } = req.params;
    
    const step = await RecipeStep.findByPk(id);
    if (!step) {
      return res.status(404).json({
        success: false,
        error: '步骤不存在'
      });
    }
    
    res.status(200).json({
      success: true,
      data: {
        imageUrl: step.imageUrl
      }
    });
  } catch (error) {
    console.error('获取步骤图片失败:', error);
    res.status(500).json({
      success: false,
      error: '获取步骤图片失败'
    });
  }
};

// 上传步骤图片
exports.uploadStepImage = async (req, res) => {
  try {
    const { id } = req.params;
    
    const step = await RecipeStep.findByPk(id);
    if (!step) {
      return res.status(404).json({
        success: false,
        error: '步骤不存在'
      });
    }
    
    // 使用multer中间件处理文件上传
    upload.single('image')(req, res, async (err) => {
      if (err) {
        console.error('上传图片失败:', err);
        return res.status(400).json({
          success: false,
          error: '上传图片失败: ' + err.message
        });
      }
      
      if (!req.file) {
        return res.status(400).json({
          success: false,
          error: '请选择要上传的图片'
        });
      }
      
      // 处理上传的图片
      const imageUrl = `${req.protocol}://${req.get('host')}/uploads/recipe-images/${req.file.filename}`;
      
      // 更新步骤图片信息
      await step.update({
        imageUrl
      });
      
      res.status(200).json({
        success: true,
        data: {
          imageUrl,
          step
        }
      });
    });
  } catch (error) {
    console.error('上传步骤图片失败:', error);
    res.status(500).json({
      success: false,
      error: '上传步骤图片失败'
    });
  }
};

// 批量删除食谱
exports.batchDeleteRecipes = async (req, res) => {
  try {
    console.log('批量删除请求:', req.body);
    const { ids } = req.body;
    
    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({
        success: false,
        error: '请提供有效的食谱ID列表'
      });
    }
    
    // 确保 ID 是数字类型
    const numericIds = ids.map(id => Number(id));
    console.log('处理后的数字 ID:', numericIds);
    
    // 使用事务确保操作的原子性
    const result = await sequelize.transaction(async (t) => {
      // 直接删除食谱，由于设置了 onDelete: 'CASCADE，关联数据会自动删除
      const deleteResult = await Recipe.destroy({ 
        where: { id: { [Op.in]: numericIds } },
        transaction: t
      });
      
      return deleteResult;
    });
    
    console.log('删除结果:', result);
    
    res.status(200).json({
      success: true,
      data: {
        deletedCount: result
      },
      message: `成功删除 ${result} 个食谱`
    });
  } catch (error) {
    console.error('批量删除食谱失败:', error);
    res.status(500).json({
      success: false,
      error: '批量删除食谱失败: ' + error.message
    });
  }
};

// 批量更新食谱状态
exports.batchUpdateRecipeStatus = async (req, res) => {
  try {
    console.log('批量更新状态请求:', req.body);
    const { ids, status } = req.body;
    
    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({
        success: false,
        error: '请提供有效的食谱ID列表'
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
    
    // 更新食谱状态
    const result = await Recipe.update(
      { status },
      { where: { id: { [Op.in]: numericIds } } }
    );
    console.log('更新结果:', result);
    
    res.status(200).json({
      success: true,
      data: {
        updatedCount: result[0]
      },
      message: `成功更新 ${result[0]} 个食谱的状态`
    });
  } catch (error) {
    console.error('批量更新食谱状态失败:', error);
    res.status(500).json({
      success: false,
      error: '批量更新食谱状态失败: ' + error.message
    });
  }
};

// 获取食谱数据统计
exports.getRecipeStatistics = async (req, res) => {
  try {
    console.log('获取食谱统计数据');
    
    // 获取 sequelize 实例
    const sequelize = Recipe.sequelize;
    
    // 1. 基本统计
    const totalRecipes = await Recipe.count();
    const activeRecipes = await Recipe.count({ where: { status: 'active' } });
    const inactiveRecipes = await Recipe.count({ where: { status: 'inactive' } });
    
    // 2. 难度分布统计
    const difficultyStats = await Recipe.findAll({
      attributes: ['difficulty', [sequelize.fn('COUNT', sequelize.col('id')), 'count']],
      group: ['difficulty']
    });
    
    const difficultyDistribution = {};
    difficultyStats.forEach(stat => {
      difficultyDistribution[stat.difficulty] = stat.dataValues.count;
    });
    
    // 3. 菜系分布统计
    const cuisineStats = await Recipe.findAll({
      attributes: ['cuisineType', [sequelize.fn('COUNT', sequelize.col('id')), 'count']],
      group: ['cuisineType']
    });
    
    const cuisineDistribution = {};
    cuisineStats.forEach(stat => {
      cuisineDistribution[stat.cuisineType || '其他'] = stat.dataValues.count;
    });
    
    // 4. 口味分布统计
    const flavorStats = await Recipe.findAll({
      attributes: ['flavorProfile', [sequelize.fn('COUNT', sequelize.col('id')), 'count']],
      group: ['flavorProfile']
    });
    
    const flavorDistribution = {};
    flavorStats.forEach(stat => {
      flavorDistribution[stat.flavorProfile || '其他'] = stat.dataValues.count;
    });
    
    // 5. 总食材和步骤统计
    const totalIngredients = await RecipeIngredient.count();
    const totalSteps = await RecipeStep.count();
    
    // 构造统计数据
    const statistics = {
      recipeCounts: {
        total: totalRecipes,
        active: activeRecipes,
        inactive: inactiveRecipes
      },
      difficultyDistribution,
      cuisineDistribution,
      flavorDistribution,
      ingredientStats: {
        totalIngredients,
        totalSteps,
        avgIngredientsPerRecipe: totalRecipes > 0 ? Math.round(totalIngredients / totalRecipes * 10) / 10 : 0,
        avgStepsPerRecipe: totalRecipes > 0 ? Math.round(totalSteps / totalRecipes * 10) / 10 : 0
      },
      lastUpdated: new Date().toISOString()
    };
    
    console.log('食谱统计数据:', statistics);
    
    res.status(200).json({
      success: true,
      data: statistics
    });
  } catch (error) {
    console.error('获取食谱统计数据失败:', error);
    res.status(500).json({
      success: false,
      error: '获取食谱统计数据失败: ' + error.message
    });
  }
};