const axios = require('axios');
const { Op } = require('sequelize');
const Recipe = require('../models/Recipe');
const RecipeIngredient = require('../models/RecipeIngredient');
const RecipeStep = require('../models/RecipeStep');
const Mushroom = require('../models/Mushroom');
const MushroomBox = require('../models/MushroomBox');
const MushroomBoxItem = require('../models/MushroomBoxItem');

// 外部食谱数据源配置
const recipeDataSources = {
  spoonacular: {
    baseUrl: 'https://api.spoonacular.com/recipes',
    apiKey: process.env.SPOONACULAR_API_KEY,
    enabled: true
  },
  edamam: {
    baseUrl: 'https://api.edamam.com/search',
    appId: process.env.EDAMAM_APP_ID,
    appKey: process.env.EDAMAM_APP_KEY,
    enabled: true
  },
  theMealDB: {
    baseUrl: 'https://www.themealdb.com/api/json/v1/1',
    enabled: true
  }
};

// 外部食谱控制器
class ExternalRecipeController {
  // 从外部API获取食谱数据
  static async fetchExternalRecipes(req, res) {
    try {
      const { query, mushroomName, limit = 5 } = req.query;
      
      if (!query && !mushroomName) {
        return res.status(400).json({
          success: false,
          error: '必须提供查询关键词或菌菇名称'
        });
      }
      
      // 从多个数据源获取食谱
      const recipes = [];
      
      // 尝试从Spoonacular获取
      if (recipeDataSources.spoonacular.enabled && recipeDataSources.spoonacular.apiKey) {
        try {
          const spoonacularRecipes = await ExternalRecipeController.fetchFromSpoonacular(query || mushroomName, limit);
          recipes.push(...spoonacularRecipes);
        } catch (error) {
          console.error('从Spoonacular获取食谱失败:', error);
        }
      }
      
      // 尝试从TheMealDB获取
      if (recipeDataSources.theMealDB.enabled) {
        try {
          const mealDbRecipes = await ExternalRecipeController.fetchFromTheMealDB(query || mushroomName, limit);
          recipes.push(...mealDbRecipes);
        } catch (error) {
          console.error('从TheMealDB获取食谱失败:', error);
        }
      }
      
      // 尝试从Edamam获取
      if (recipeDataSources.edamam.enabled && recipeDataSources.edamam.appId && recipeDataSources.edamam.appKey) {
        try {
          const edamamRecipes = await ExternalRecipeController.fetchFromEdamam(query || mushroomName, limit);
          recipes.push(...edamamRecipes);
        } catch (error) {
          console.error('从Edamam获取食谱失败:', error);
        }
      }
      
      if (recipes.length === 0) {
        return res.status(404).json({
          success: false,
          error: '未找到相关食谱'
        });
      }
      
      res.status(200).json({
        success: true,
        data: recipes
      });
    } catch (error) {
      console.error('获取外部食谱失败:', error);
      res.status(500).json({
        success: false,
        error: '获取外部食谱失败'
      });
    }
  }
  
  // 从Spoonacular获取食谱
  static async fetchFromSpoonacular(query, limit) {
    const { baseUrl, apiKey } = recipeDataSources.spoonacular;
    
    const response = await axios.get(`${baseUrl}/complexSearch`, {
      params: {
        query,
        number: limit,
        addRecipeInformation: true,
        fillIngredients: true,
        apiKey
      }
    });
    
    return response.data.results.map(recipe => ({
      id: recipe.id,
      name: recipe.title,
      description: recipe.summary.replace(/<[^>]*>/g, ''),
      difficulty: recipe.difficulty || 'intermediate',
      prepTime: recipe.preparationMinutes || 0,
      cookTime: recipe.cookingMinutes || 0,
      totalTime: recipe.readyInMinutes || 0,
      servings: recipe.servings || 4,
      image: recipe.image,
      imageGallery: recipe.images?.length ? recipe.images : undefined,
      ingredients: recipe.extendedIngredients?.map(ingredient => ({
        ingredientName: ingredient.name,
        quantity: ingredient.amount,
        unit: ingredient.unit
      })) || [],
      steps: recipe.analyzedInstructions?.[0]?.steps?.map((step, index) => ({
        stepNumber: index + 1,
        description: step.step,
        imageUrl: step.image
      })) || [],
      source: `Spoonacular: ${recipe.sourceUrl}`,
      dataSource: 'spoonacular'
    }));
  }
  
  // 从TheMealDB获取食谱
  static async fetchFromTheMealDB(query, limit) {
    const { baseUrl } = recipeDataSources.theMealDB;
    
    const response = await axios.get(`${baseUrl}/search.php`, {
      params: {
        s: query
      }
    });
    
    if (!response.data.meals) {
      return [];
    }
    
    return response.data.meals.slice(0, limit).map(meal => {
      // 提取配料和步骤
      const ingredients = [];
      for (let i = 1; i <= 20; i++) {
        const ingredient = meal[`strIngredient${i}`];
        const measure = meal[`strMeasure${i}`];
        if (ingredient && ingredient.trim()) {
          ingredients.push({
            ingredientName: ingredient,
            quantity: measure || 1,
            unit: ''
          });
        }
      }
      
      const steps = meal.strInstructions
        ? meal.strInstructions.split('\n')
            .filter(step => step.trim())
            .map((step, index) => ({
              stepNumber: index + 1,
              description: step,
              imageUrl: meal.strMealThumb
            }))
        : [];
      
      return {
        id: meal.idMeal,
        name: meal.strMeal,
        description: meal.strInstructions?.substring(0, 200) || '',
        difficulty: 'intermediate',
        prepTime: 30,
        cookTime: 30,
        totalTime: 60,
        servings: 4,
        image: meal.strMealThumb,
        ingredients,
        steps,
        source: meal.strSource || meal.strYoutube,
        dataSource: 'themealdb'
      };
    });
  }
  
  // 从Edamam获取食谱
  static async fetchFromEdamam(query, limit) {
    const { baseUrl, appId, appKey } = recipeDataSources.edamam;
    
    const response = await axios.get(baseUrl, {
      params: {
        q: query,
        app_id: appId,
        app_key: appKey,
        from: 0,
        to: limit
      }
    });
    
    return response.data.hits.map(hit => {
      const recipe = hit.recipe;
      
      return {
        id: recipe.uri.split('#recipe_')[1],
        name: recipe.label,
        description: '',
        difficulty: 'intermediate',
        prepTime: Math.round(recipe.totalTime / 2) || 0,
        cookTime: Math.round(recipe.totalTime / 2) || 0,
        totalTime: recipe.totalTime || 0,
        servings: recipe.yield || 4,
        image: recipe.image,
        ingredients: recipe.ingredients.map(ingredient => ({
          ingredientName: ingredient.text,
          quantity: ingredient.weight || 1,
          unit: 'g'
        })),
        steps: [], // Edamam API不提供步骤
        source: recipe.url,
        dataSource: 'edamam'
      };
    });
  }
  
  // 保存外部食谱到本地数据库
  static async saveExternalRecipe(req, res) {
    try {
      const { recipeData } = req.body;
      
      if (!recipeData) {
        return res.status(400).json({
          success: false,
          error: '必须提供食谱数据'
        });
      }
      
      // 检查是否已存在
      const existingRecipe = await Recipe.findOne({ where: { name: recipeData.name } });
      if (existingRecipe) {
        return res.status(409).json({
          success: false,
          error: '食谱已存在'
        });
      }
      
      // 创建食谱
      const recipe = await Recipe.create({
        name: recipeData.name,
        description: recipeData.description,
        difficulty: recipeData.difficulty,
        prepTime: recipeData.prepTime,
        cookTime: recipeData.cookTime,
        totalTime: recipeData.totalTime,
        servings: recipeData.servings,
        image: recipeData.image,
        imageGallery: recipeData.imageGallery,
        source: recipeData.source,
        status: 'active'
      });
      
      // 创建配料
      if (recipeData.ingredients && Array.isArray(recipeData.ingredients)) {
        for (const ingredient of recipeData.ingredients) {
          // 尝试匹配菌菇
          let mushroomId = null;
          const mushroom = await Mushroom.findOne({ 
            where: {
              name: {
                [Op.like]: `%${ingredient.ingredientName}%`
              }
            }
          });
          
          if (mushroom) {
            mushroomId = mushroom.id;
          }
          
          await RecipeIngredient.create({
            recipeId: recipe.id,
            mushroomId,
            ingredientName: ingredient.ingredientName,
            quantity: ingredient.quantity,
            unit: ingredient.unit
          });
        }
      }
      
      // 创建步骤
      if (recipeData.steps && Array.isArray(recipeData.steps)) {
        for (const step of recipeData.steps) {
          await RecipeStep.create({
            recipeId: recipe.id,
            stepNumber: step.stepNumber,
            description: step.description,
            imageUrl: step.imageUrl,
            videoUrl: step.videoUrl
          });
        }
      }
      
      res.status(201).json({
        success: true,
        data: recipe
      });
    } catch (error) {
      console.error('保存外部食谱失败:', error);
      res.status(500).json({
        success: false,
        error: '保存外部食谱失败'
      });
    }
  }
  
  // 更新外部食谱数据
  static async updateExternalRecipes(req, res) {
    try {
      const { mushroomName, limit = 10 } = req.query;
      
      // 获取菌菇信息
      let mushroom;
      if (mushroomName) {
        mushroom = await Mushroom.findOne({ where: { name: mushroomName } });
        if (!mushroom) {
          return res.status(404).json({
            success: false,
            error: '菌菇不存在'
          });
        }
      }
      
      // 从外部API获取最新食谱
      const externalRecipes = await ExternalRecipeController.fetchExternalRecipes({
        query: mushroom ? mushroom.name : 'mushroom',
        limit
      });
      
      // 保存或更新食谱
      const savedRecipes = [];
      for (const recipeData of externalRecipes) {
        try {
          // 检查是否已存在
          let recipe = await Recipe.findOne({ where: { name: recipeData.name } });
          
          if (recipe) {
            // 更新现有食谱
            await recipe.update({
              description: recipeData.description,
              difficulty: recipeData.difficulty,
              prepTime: recipeData.prepTime,
              cookTime: recipeData.cookTime,
              totalTime: recipeData.totalTime,
              servings: recipeData.servings,
              image: recipeData.image,
              imageGallery: recipeData.imageGallery,
              source: recipeData.source,
              dataUpdatedAt: new Date()
            });
          } else {
            // 创建新食谱
            recipe = await Recipe.create({
              name: recipeData.name,
              description: recipeData.description,
              difficulty: recipeData.difficulty,
              prepTime: recipeData.prepTime,
              cookTime: recipeData.cookTime,
              totalTime: recipeData.totalTime,
              servings: recipeData.servings,
              image: recipeData.image,
              imageGallery: recipeData.imageGallery,
              source: recipeData.source,
              status: 'active',
              dataUpdatedAt: new Date()
            });
          }
          
          savedRecipes.push(recipe);
        } catch (error) {
          console.error(`保存食谱 ${recipeData.name} 失败:`, error);
        }
      }
      
      res.status(200).json({
        success: true,
        data: savedRecipes,
        message: `成功更新 ${savedRecipes.length} 个食谱`
      });
    } catch (error) {
      console.error('更新外部食谱失败:', error);
      res.status(500).json({
        success: false,
        error: '更新外部食谱失败'
      });
    }
  }
}

module.exports = ExternalRecipeController;