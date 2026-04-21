const { sequelize } = require('../config/db');
const Category = require('../models/Category');
const Product = require('../models/Product');
const Recipe = require('../models/Recipe');
const RecipeIngredient = require('../models/RecipeIngredient');
const RecipeStep = require('../models/RecipeStep');
const CookingVideo = require('../models/CookingVideo');
const MushroomBox = require('../models/MushroomBox');
const ProductCategory = require('../models/ProductCategory');
const User = require('../models/User');

async function initFullData() {
  try {
    await sequelize.authenticate();
    console.log('数据库连接成功');

    // ==============================================
    // 1. 确保卖家用户存在
    // ==============================================
    console.log('正在检查卖家用户...');
    let seller = await User.findOne({ where: { username: 'seller' } });
    if (!seller) {
      seller = await User.create({
        username: 'seller',
        password: 'seller123',
        email: 'seller@example.com',
        role: 'seller',
        status: true
      });
      console.log('卖家用户创建成功');
    }
    const sellerId = seller.id;

    // ==============================================
    // 2. 商品数据（使用新的三级分类结构）
    // ==============================================
    console.log('正在插入商品数据...');
    const products = await Product.bulkCreate([
      // 新鲜食用菌
      { name: '新鲜香菇', description: '精选优质香菇，肉质肥厚，香气浓郁', price: 19.99, stock: 100, level1Category: 'edible', level2Category: 'shiitake', level3Category: 'freshShiitake', images: '["/mushrooms/xianggu.jpg"]', status: 'approved', sellerId: sellerId, isHot: true },
      { name: '新鲜平菇', description: '鲜嫩可口的平菇', price: 15.99, stock: 150, level1Category: 'edible', level2Category: 'oyster', level3Category: 'freshOyster', images: '["/mushrooms/pinggu.jpg"]', status: 'approved', sellerId: sellerId, isHot: true },
      { name: '新鲜杏鲍菇', description: '肉质脆嫩的杏鲍菇', price: 22.99, stock: 80, level1Category: 'edible', level2Category: 'kingOyster', level3Category: 'freshKingOyster', images: '["/mushrooms/xingbaogu.jpg"]', status: 'approved', sellerId: sellerId, isHot: true },
      { name: '新鲜金针菇', description: '细长鲜嫩的金针菇', price: 12.99, stock: 200, level1Category: 'edible', level2Category: 'enoki', level3Category: 'freshEnoki', images: '["/mushrooms/jinzhengu.jpg"]', status: 'approved', sellerId: sellerId, isHot: true },
      { name: '新鲜木耳', description: '脆嫩爽口的木耳', price: 14.99, stock: 120, level1Category: 'edible', level2Category: 'woodEar', level3Category: 'blackWoodEar', images: '["/mushrooms/muer.jpg"]', status: 'approved', sellerId: sellerId, isHot: false },
      { name: '新鲜竹荪', description: '天然竹荪，口感脆嫩', price: 35.99, stock: 40, level1Category: 'edible', level2Category: 'bambooFungus', level3Category: 'bambooFungusFresh', images: '["/mushrooms/zhusun.jpg"]', status: 'approved', sellerId: sellerId, isHot: false },
      
      // 干货食用菌
      { name: '干香菇', description: '精选香菇干货，香味浓郁', price: 39.99, stock: 60, level1Category: 'edible', level2Category: 'shiitake', level3Category: 'driedShiitake', images: '["/mushrooms/xianggu-dry.jpg"]', status: 'approved', sellerId: sellerId, isHot: true },
      { name: '平菇干货', description: '脱水平菇', price: 29.99, stock: 80, level1Category: 'edible', level2Category: 'oyster', level3Category: 'driedOyster', images: '["/mushrooms/pinggu-dry.jpg"]', status: 'approved', sellerId: sellerId, isHot: false },
      { name: '杏鲍菇干货', description: '干制杏鲍菇', price: 45.99, stock: 50, level1Category: 'edible', level2Category: 'kingOyster', level3Category: 'driedKingOyster', images: '["/mushrooms/xingbaogu-dry.jpg"]', status: 'approved', sellerId: sellerId, isHot: false },
      { name: '金针菇干货', description: '脱水金针菇', price: 25.99, stock: 90, level1Category: 'edible', level2Category: 'enoki', level3Category: 'driedEnoki', images: '["/mushrooms/jinzhengu-dry.jpg"]', status: 'approved', sellerId: sellerId, isHot: false },
      { name: '木耳干货', description: '木耳干货', price: 28.99, stock: 70, level1Category: 'edible', level2Category: 'woodEar', level3Category: 'driedWoodEar', images: '["/mushrooms/muer-dry.jpg"]', status: 'approved', sellerId: sellerId, isHot: false },
      
      // 野生菌
      { name: '新鲜羊肚菌', description: '名贵羊肚菌', price: 89.99, stock: 20, level1Category: 'wild', level2Category: 'morel', level3Category: 'freshMorel', images: '["/mushrooms/yangdumjun.jpg"]', status: 'approved', sellerId: sellerId, isHot: false },
      { name: '干羊肚菌', description: '干羊肚菌', price: 168.00, stock: 15, level1Category: 'wild', level2Category: 'morel', level3Category: 'driedMorel', images: '["/mushrooms/yangdumjun-dry.jpg"]', status: 'approved', sellerId: sellerId, isHot: false },
      { name: '新鲜松茸', description: '珍贵新鲜松茸', price: 199.99, stock: 10, level1Category: 'wild', level2Category: 'matsutake', level3Category: 'freshMatsutake', images: '["/mushrooms/songrong.jpg"]', status: 'approved', sellerId: sellerId, isHot: false },
      { name: '冻干松茸', description: '冻干松茸', price: 299.99, stock: 8, level1Category: 'wild', level2Category: 'matsutake', level3Category: 'freezeDriedMatsutake', images: '["/mushrooms/songrong-freeze.jpg"]', status: 'approved', sellerId: sellerId, isHot: false },
      
      // 菌菇制品
      { name: '香菇酱', description: '美味香菇酱', price: 18.99, stock: 200, level1Category: 'edible', level2Category: 'shiitake', level3Category: 'shiitakeSauce', images: '["/mushrooms/xianggu-jiang.jpg"]', status: 'approved', sellerId: sellerId, isHot: true },
      { name: '菌菇罐头', description: '即食菌菇罐头', price: 15.99, stock: 150, level1Category: 'other', level2Category: 'processed', images: '["/mushrooms/mushroom-canned.jpg"]', status: 'approved', sellerId: sellerId, isHot: false },
      { name: '菌菇汤料包', description: '方便快捷的菌菇汤料', price: 22.99, stock: 100, level1Category: 'edible', level2Category: 'mixed', level3Category: 'soupMix', images: '["/mushrooms/soup-mix.jpg"]', status: 'approved', sellerId: sellerId, isHot: true },
      { name: '菌菇礼盒', description: '精选干货组合礼盒', price: 128.00, stock: 30, level1Category: 'edible', level2Category: 'mixed', level3Category: 'giftBox', images: '["/mushrooms/gift-box-dry.jpg"]', status: 'approved', sellerId: sellerId, isHot: false },
      { name: '火锅菌菇组合', description: '火锅专用菌菇拼盘', price: 45.99, stock: 80, level1Category: 'edible', level2Category: 'mixed', level3Category: 'hotpotMix', images: '["/mushrooms/hotpot-mix.jpg"]', status: 'approved', sellerId: sellerId, isHot: true }
    ], { ignoreDuplicates: true });
    console.log(`商品数据插入完成，共 ${products.length} 条`);

    // ==============================================
    // 3. 食谱数据
    // ==============================================
    console.log('正在插入食谱数据...');
    const recipes = await Recipe.bulkCreate([
      { name: '香菇炒青菜', description: '经典家常菜', difficulty: 'beginner', prepTime: 10, cookTime: 15, servings: 2, rating: 4.8, image: 'https://via.placeholder.com/400x300?text=香菇炒青菜', status: 'active', cuisineType: 'Chinese', mealType: 'Lunch', mushroomCount: 1, popularity: 95.5, reviewCount: 328 },
      { name: '杏鲍菇炒肉', description: '杏鲍菇与猪肉完美搭配', difficulty: 'intermediate', prepTime: 15, cookTime: 20, servings: 3, rating: 4.7, image: 'https://via.placeholder.com/400x300?text=杏鲍菇炒肉', status: 'active', cuisineType: 'Chinese', mealType: 'Dinner', mushroomCount: 1, popularity: 88.2, reviewCount: 256 },
      { name: '金针菇肥牛卷', description: '火锅经典', difficulty: 'intermediate', prepTime: 10, cookTime: 10, servings: 2, rating: 4.9, image: 'https://via.placeholder.com/400x300?text=金针菇肥牛卷', status: 'active', cuisineType: 'Chinese', mealType: 'Dinner', mushroomCount: 1, popularity: 92.8, reviewCount: 412 },
      { name: '菌菇豆腐煲', description: '多种菌菇与豆腐的完美结合', difficulty: 'beginner', prepTime: 15, cookTime: 30, servings: 3, rating: 4.6, image: 'https://via.placeholder.com/400x300?text=菌菇豆腐煲', status: 'active', cuisineType: 'Chinese', mealType: 'Lunch', mushroomCount: 3, popularity: 85.3, reviewCount: 176 },
      { name: '平菇炒鸡蛋', description: '简单美味的家常菜', difficulty: 'beginner', prepTime: 8, cookTime: 12, servings: 2, rating: 4.7, image: 'https://via.placeholder.com/400x300?text=平菇炒鸡蛋', status: 'active', cuisineType: 'Chinese', mealType: 'Breakfast', mushroomCount: 1, popularity: 87.6, reviewCount: 245 },
      { name: '香菇炖排骨', description: '经典炖菜', difficulty: 'intermediate', prepTime: 20, cookTime: 90, servings: 4, rating: 4.8, image: 'https://via.placeholder.com/400x300?text=香菇炖排骨', status: 'active', cuisineType: 'Chinese', mealType: 'Dinner', mushroomCount: 1, popularity: 89.4, reviewCount: 312 },
      { name: '凉拌木耳', description: '爽口凉拌菜', difficulty: 'beginner', prepTime: 15, cookTime: 5, servings: 4, rating: 4.5, image: 'https://via.placeholder.com/400x300?text=凉拌木耳', status: 'active', cuisineType: 'Chinese', mealType: 'Appetizer', mushroomCount: 1, popularity: 82.1, reviewCount: 198 },
      { name: '羊肚菌炖排骨', description: '高端滋补菜肴', difficulty: 'advanced', prepTime: 30, cookTime: 150, servings: 4, rating: 4.9, image: 'https://via.placeholder.com/400x300?text=羊肚菌炖排骨', status: 'active', cuisineType: 'Chinese', mealType: 'Dinner', mushroomCount: 1, popularity: 94.2, reviewCount: 156 },
      { name: '竹荪鸡汤', description: '清香滋补的竹荪鸡汤', difficulty: 'intermediate', prepTime: 25, cookTime: 100, servings: 4, rating: 4.8, image: 'https://via.placeholder.com/400x300?text=竹荪鸡汤', status: 'active', cuisineType: 'Chinese', mealType: 'Dinner', mushroomCount: 1, popularity: 86.7, reviewCount: 145 },
      { name: '菌菇火锅', description: '美味菌菇火锅', difficulty: 'intermediate', prepTime: 30, cookTime: 60, servings: 4, rating: 4.8, image: 'https://via.placeholder.com/400x300?text=菌菇火锅', status: 'active', cuisineType: 'Chinese', mealType: 'Dinner', mushroomCount: 4, popularity: 91.3, reviewCount: 289 }
    ], { ignoreDuplicates: true });
    console.log(`食谱数据插入完成，共 ${recipes.length} 条`);

    // ==============================================
    // 4. 食谱配料数据
    // ==============================================
    console.log('正在插入食谱配料数据...');
    const ingredients = await RecipeIngredient.bulkCreate([
      { recipeId: 1, mushroomId: null, ingredientName: '香菇', quantity: '100', unit: 'g' },
      { recipeId: 1, ingredientName: '青菜', quantity: '200', unit: 'g' },
      { recipeId: 1, ingredientName: '蒜末', quantity: '10', unit: 'g' },
      { recipeId: 2, mushroomId: null, ingredientName: '杏鲍菇', quantity: '200', unit: 'g' },
      { recipeId: 2, ingredientName: '猪肉', quantity: '150', unit: 'g' },
      { recipeId: 2, ingredientName: '青椒', quantity: '1', unit: '个' },
      { recipeId: 3, mushroomId: null, ingredientName: '金针菇', quantity: '200', unit: 'g' },
      { recipeId: 3, ingredientName: '肥牛片', quantity: '200', unit: 'g' },
      { recipeId: 4, mushroomId: null, ingredientName: '香菇', quantity: '50', unit: 'g' },
      { recipeId: 4, mushroomId: null, ingredientName: '平菇', quantity: '50', unit: 'g' },
      { recipeId: 4, mushroomId: null, ingredientName: '杏鲍菇', quantity: '50', unit: 'g' },
      { recipeId: 4, ingredientName: '豆腐', quantity: '200', unit: 'g' },
      { recipeId: 5, mushroomId: null, ingredientName: '平菇', quantity: '150', unit: 'g' },
      { recipeId: 5, ingredientName: '鸡蛋', quantity: '3', unit: '个' },
      { recipeId: 6, mushroomId: null, ingredientName: '香菇', quantity: '150', unit: 'g' },
      { recipeId: 6, ingredientName: '排骨', quantity: '500', unit: 'g' },
      { recipeId: 7, mushroomId: null, ingredientName: '木耳', quantity: '100', unit: 'g' },
      { recipeId: 7, ingredientName: '黄瓜', quantity: '1', unit: '根' },
      { recipeId: 8, mushroomId: null, ingredientName: '羊肚菌', quantity: '50', unit: 'g' },
      { recipeId: 8, ingredientName: '排骨', quantity: '500', unit: 'g' },
      { recipeId: 9, mushroomId: null, ingredientName: '竹荪', quantity: '50', unit: 'g' },
      { recipeId: 9, ingredientName: '鸡肉', quantity: '400', unit: 'g' },
      { recipeId: 10, mushroomId: null, ingredientName: '香菇', quantity: '80', unit: 'g' },
      { recipeId: 10, mushroomId: null, ingredientName: '金针菇', quantity: '80', unit: 'g' }
    ], { ignoreDuplicates: true });
    console.log(`食谱配料数据插入完成，共 ${ingredients.length} 条`);

    // ==============================================
    // 5. 食谱步骤数据
    // ==============================================
    console.log('正在插入食谱步骤数据...');
    const steps = await RecipeStep.bulkCreate([
      { recipeId: 1, stepNumber: 1, description: '香菇洗净切片，青菜洗净备用' },
      { recipeId: 1, stepNumber: 2, description: '热锅凉油，爆香蒜末' },
      { recipeId: 1, stepNumber: 3, description: '加入香菇翻炒至变软' },
      { recipeId: 1, stepNumber: 4, description: '加入青菜翻炒，加盐调味' },
      { recipeId: 2, stepNumber: 1, description: '杏鲍菇切片，猪肉切片，青椒切块' },
      { recipeId: 2, stepNumber: 2, description: '猪肉用生抽腌制10分钟' },
      { recipeId: 2, stepNumber: 3, description: '热锅倒油，炒香猪肉至变色' },
      { recipeId: 2, stepNumber: 4, description: '加入杏鲍菇和青椒翻炒' },
      { recipeId: 3, stepNumber: 1, description: '金针菇洗净，肥牛片备用' },
      { recipeId: 3, stepNumber: 2, description: '锅中加水烧开，放入火锅底料' },
      { recipeId: 3, stepNumber: 3, description: '将金针菇和肥牛片卷在一起' },
      { recipeId: 3, stepNumber: 4, description: '放入锅中煮熟即可' },
      { recipeId: 4, stepNumber: 1, description: '香菇、平菇、杏鲍菇洗净切块' },
      { recipeId: 4, stepNumber: 2, description: '豆腐切块备用' },
      { recipeId: 4, stepNumber: 3, description: '热锅倒油，炒香菌菇' },
      { recipeId: 4, stepNumber: 4, description: '加入豆腐和高汤，慢炖15分钟' },
      { recipeId: 5, stepNumber: 1, description: '平菇洗净撕成小片' },
      { recipeId: 5, stepNumber: 2, description: '鸡蛋打散备用' },
      { recipeId: 5, stepNumber: 3, description: '热锅倒油，炒平菇至软' },
      { recipeId: 5, stepNumber: 4, description: '倒入鸡蛋液翻炒' }
    ], { ignoreDuplicates: true });
    console.log(`食谱步骤数据插入完成，共 ${steps.length} 条`);

    // ==============================================
    // 6. 烹饪视频数据
    // ==============================================
    console.log('正在插入烹饪视频数据...');
    const videos = await CookingVideo.bulkCreate([
      { title: '香菇炒青菜做法教程', description: '详细讲解香菇炒青菜的烹饪步骤', videoUrl: 'https://example.com/videos/xianggu-chao-qingcai.mp4', thumbnailUrl: 'https://via.placeholder.com/400x300?text=香菇炒青菜教程', duration: 300, mushroomType: '香菇', difficulty: 'easy', views: 12500, likes: 890, category: 'cooking', tags: '["家常菜", "香菇", "素食"]', status: 'active' },
      { title: '杏鲍菇炒肉技巧', description: '教你做出美味的杏鲍菇炒肉', videoUrl: 'https://example.com/videos/xingbaogu-chao-rou.mp4', thumbnailUrl: 'https://via.placeholder.com/400x300?text=杏鲍菇炒肉教程', duration: 360, mushroomType: '杏鲍菇', difficulty: 'medium', views: 9800, likes: 720, category: 'cooking', tags: '["家常菜", "杏鲍菇", "肉类"]', status: 'active' },
      { title: '金针菇肥牛卷制作', description: '火锅必点菜品制作教程', videoUrl: 'https://example.com/videos/jinzhengu-feiniu.mp4', thumbnailUrl: 'https://via.placeholder.com/400x300?text=金针菇肥牛卷', duration: 280, mushroomType: '金针菇', difficulty: 'easy', views: 15600, likes: 1200, category: 'cooking', tags: '["火锅", "金针菇", "肥牛"]', status: 'active' },
      { title: '菌菇豆腐煲做法', description: '鲜美菌菇煲制作教程', videoUrl: 'https://example.com/videos/jungu-doufu-bao.mp4', thumbnailUrl: 'https://via.placeholder.com/400x300?text=菌菇豆腐煲', duration: 420, mushroomType: '多种菌菇', difficulty: 'medium', views: 7500, likes: 580, category: 'cooking', tags: '["素食", "煲汤", "菌菇"]', status: 'active' },
      { title: '平菇炒鸡蛋教程', description: '简单快手家常菜', videoUrl: 'https://example.com/videos/pinggu-chao-jidan.mp4', thumbnailUrl: 'https://via.placeholder.com/400x300?text=平菇炒鸡蛋', duration: 240, mushroomType: '平菇', difficulty: 'easy', views: 11200, likes: 850, category: 'cooking', tags: '["家常菜", "平菇", "鸡蛋"]', status: 'active' },
      { title: '菌菇火锅制作', description: '家庭菌菇火锅教程', videoUrl: 'https://example.com/videos/jungu-huoguo.mp4', thumbnailUrl: 'https://via.placeholder.com/400x300?text=菌菇火锅', duration: 480, mushroomType: '多种菌菇', difficulty: 'medium', views: 14200, likes: 980, category: 'cooking', tags: '["火锅", "菌菇", "家庭"]', status: 'active' }
    ], { ignoreDuplicates: true });
    console.log(`烹饪视频数据插入完成，共 ${videos.length} 条`);

    // ==============================================
    // 7. 更新盲盒数据
    // ==============================================
    console.log('正在更新盲盒数据...');
    await MushroomBox.update(
      { image: 'https://via.placeholder.com/300x200?text=春季时令盲盒', status: 'active' },
      { where: { id: 1 } }
    );
    await MushroomBox.update(
      { image: 'https://via.placeholder.com/300x200?text=夏季清凉盲盒', status: 'active' },
      { where: { id: 2 } }
    );
    await MushroomBox.update(
      { image: 'https://via.placeholder.com/300x200?text=秋季丰收盲盒', status: 'active' },
      { where: { id: 3 } }
    );
    await MushroomBox.update(
      { image: 'https://via.placeholder.com/300x200?text=冬季滋补盲盒', status: 'active' },
      { where: { id: 4 } }
    );
    await MushroomBox.update(
      { image: 'https://via.placeholder.com/300x200?text=初学者体验盲盒', status: 'active' },
      { where: { id: 5 } }
    );
    console.log('盲盒数据更新完成');

    console.log('==============================================');
    console.log('所有数据初始化完成！');
    console.log('==============================================');
    console.log('插入记录统计：');
    console.log('- 商品：20条');
    console.log('- 食谱：10条');
    console.log('- 食谱配料：24条');
    console.log('- 食谱步骤：20条');
    console.log('- 烹饪视频：6条');

    await sequelize.close();
    process.exit(0);
  } catch (error) {
    console.error('数据初始化失败:', error);
    process.exit(1);
  }
}

initFullData();