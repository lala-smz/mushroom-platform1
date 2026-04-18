const Category = require('../models/Category');
const Tag = require('../models/Tag');
const ProductCategory = require('../models/ProductCategory');
const {
  getLevel1Categories,
  getLevel2Categories,
  getLevel3Categories,
  getLevel1Category,
  getLevel2Category,
  validateCategory,
  getCategoryPath
} = require('../config/categoryConfig');

const cache = {};
const cacheExpiry = {};

const getCache = (key) => {
  if (cacheExpiry[key] && cacheExpiry[key] > Date.now()) {
    return Promise.resolve(cache[key]);
  }
  delete cache[key];
  delete cacheExpiry[key];
  return Promise.resolve(null);
};

const setCache = (key, value, ttlSeconds = 3600) => {
  cache[key] = value;
  cacheExpiry[key] = Date.now() + (ttlSeconds * 1000);
  return Promise.resolve();
};

const clearCache = (key) => {
  delete cache[key];
  delete cacheExpiry[key];
  return Promise.resolve();
};

const generateCategoryKey = (label) => {
  const timestamp = Date.now().toString(36);
  const slug = label
    .toLowerCase()
    .replace(/[\u4e00-\u9fa5]/g, (char) => {
      const pinyinMap = {
        '食': 'shi', '用': 'yong', '菌': 'jun', '药': 'yao', '野': 'ye', '生': 'sheng',
        '包': 'bao', '种': 'zhong', '时': 'shi', '令': 'ling', '盲': 'mang', '盒': 'he',
        '其': 'qi', '他': 'ta', '香': 'xiang', '菇': 'gu', '平': 'ping', '针': 'zhen',
        '金': 'jin', '木': 'mu', '耳': 'er', '杏': 'xing', '鲍': 'bao', '蟹': 'xie',
        '味': 'wei', '竹': 'zhu', '荪': 'sun', '混': 'hun', '合': 'he', '灵': 'ling',
        '芝': 'zhi', '冬': 'dong', '虫': 'chong', '夏': 'xia', '草': 'cao', '鹿': 'lu',
        '茸': 'rong', '茯': 'fu', '苓': 'ling', '松': 'song', '茸': 'rong', '牛': 'niu',
        '肝': 'gan', '羊': 'yang', '肚': 'du', '鸡': 'ji', '油': 'you', '露': 'lu',
        '虎': 'hu', '掌': 'zhang', '老': 'lao', '人': 'ren', '头': 'tou', '枞': 'cong',
        '蛋': 'dan', '黑': 'hei', '白': 'bai', '毛': 'mao', '小': 'xiao', '碗': 'wan',
        '片': 'pian', '干': 'gan', '鲜': 'xian', '花': 'hua', '粉': 'fen', '酱': 'jiang',
        '茶': 'cha', '胶': 'jiao', '囊': 'nang', '原': 'yuan', '母': 'mu', '栽': 'zai',
        '培': 'pei', '春': 'chun', '清': 'qing', '明': 'ming', '凉': 'liang', '补': 'bu',
        '暖': 'nuan', '年': 'nian', '货': 'huo', '企': 'qi', '业': 'ye', '专': 'zhuan',
        '属': 'shu', '定': 'ding', '制': 'zhi', '零': 'ling', '食': 'shi', '调': 'tiao',
        '味': 'wei', '品': 'pin', '罐': 'guan', '头': 'tou', '工': 'gong', '艺': 'yi',
        '周': 'zhou', '边': 'bian', '珍': 'zhen', '稀': 'xi', '秀': 'xiu', '珍': 'zhen',
        '姬': 'ji', '黄': 'huang', '海': 'hai', '鲜': 'xian', '真': 'zhen', '长': 'chang',
        '裙': 'qun', '短': 'duan', '火': 'huo', '锅': 'guo', '煲': 'bao', '汤': 'tang',
        '礼': 'li', '盒': 'he', '乐': 'le', '园': 'yuan', '组': 'zu', '合': 'he',
        '儿': 'er', '童': 'tong', 'DIY': 'diy', '限': 'xian', '尝': 'chang', '鲜': 'xian'
      };
      return pinyinMap[char] || char.charCodeAt(0).toString(36);
    })
    .replace(/[^a-z0-9]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
  
  return `${slug || 'cat'}-${timestamp}`;
};

const categoryController = {
  // ==================== 原有分类管理功能 ====================
  
  // 获取分类列表
  getCategories: async (req, res) => {
    try {
      const categories = await Category.findAll({
        where: { status: 'active' },
        order: [['sortOrder', 'ASC']]
      });
      res.status(200).json({
        success: true,
        data: categories
      });
    } catch (error) {
      console.error('获取分类失败:', error);
      res.status(500).json({
        success: false,
        error: '获取分类失败'
      });
    }
  },

  // 创建分类
  createCategory: async (req, res) => {
    try {
      const { name, description, sortOrder } = req.body;
      
      if (!name) {
        return res.status(400).json({
          success: false,
          error: '分类名称不能为空'
        });
      }

      const category = await Category.create({
        name,
        description,
        sortOrder: sortOrder || 0
      });

      res.status(201).json({
        success: true,
        data: category
      });
    } catch (error) {
      console.error('创建分类失败:', error);
      res.status(500).json({
        success: false,
        error: '创建分类失败'
      });
    }
  },

  // 更新分类
  updateCategory: async (req, res) => {
    try {
      const { id } = req.params;
      const { name, description, sortOrder, status } = req.body;

      const category = await Category.findByPk(id);
      if (!category) {
        return res.status(404).json({
          success: false,
          error: '分类不存在'
        });
      }

      await category.update({
        name: name || category.name,
        description: description !== undefined ? description : category.description,
        sortOrder: sortOrder !== undefined ? sortOrder : category.sortOrder,
        status: status || category.status
      });

      res.status(200).json({
        success: true,
        data: category
      });
    } catch (error) {
      console.error('更新分类失败:', error);
      res.status(500).json({
        success: false,
        error: '更新分类失败'
      });
    }
  },

  // 删除分类
  deleteCategory: async (req, res) => {
    try {
      const { id } = req.params;

      const category = await Category.findByPk(id);
      if (!category) {
        return res.status(404).json({
          success: false,
          error: '分类不存在'
        });
      }

      await category.destroy();

      res.status(200).json({
        success: true,
        message: '分类删除成功'
      });
    } catch (error) {
      console.error('删除分类失败:', error);
      res.status(500).json({
        success: false,
        error: '删除分类失败'
      });
    }
  },

  // 获取标签列表
  getTags: async (req, res) => {
    try {
      const tags = await Tag.findAll({
        where: { status: 'active' },
        order: [['name', 'ASC']]
      });
      res.status(200).json({
        success: true,
        data: tags
      });
    } catch (error) {
      console.error('获取标签失败:', error);
      res.status(500).json({
        success: false,
        error: '获取标签失败'
      });
    }
  },

  // 创建标签
  createTag: async (req, res) => {
    try {
      const { name, description } = req.body;
      
      if (!name) {
        return res.status(400).json({
          success: false,
          error: '标签名称不能为空'
        });
      }

      const tag = await Tag.create({
        name,
        description
      });

      res.status(201).json({
        success: true,
        data: tag
      });
    } catch (error) {
      console.error('创建标签失败:', error);
      res.status(500).json({
        success: false,
        error: '创建标签失败'
      });
    }
  },

  // 更新标签
  updateTag: async (req, res) => {
    try {
      const { id } = req.params;
      const { name, description, status } = req.body;

      const tag = await Tag.findByPk(id);
      if (!tag) {
        return res.status(404).json({
          success: false,
          error: '标签不存在'
        });
      }

      await tag.update({
        name: name || tag.name,
        description: description !== undefined ? description : tag.description,
        status: status || tag.status
      });

      res.status(200).json({
        success: true,
        data: tag
      });
    } catch (error) {
      console.error('更新标签失败:', error);
      res.status(500).json({
        success: false,
        error: '更新标签失败'
      });
    }
  },

  // 删除标签
  deleteTag: async (req, res) => {
    try {
      const { id } = req.params;

      const tag = await Tag.findByPk(id);
      if (!tag) {
        return res.status(404).json({
          success: false,
          error: '标签不存在'
        });
      }

      await tag.destroy();

      res.status(200).json({
        success: true,
        message: '标签删除成功'
      });
    } catch (error) {
      console.error('删除标签失败:', error);
      res.status(500).json({
        success: false,
        error: '删除标签失败'
      });
    }
  },

  // ==================== 商品三级分类功能 ====================

  // 获取所有一级分类（商品分类）- 从数据库读取
  getProductLevel1Categories: async (req, res) => {
    try {
      const categories = await ProductCategory.findAll({
        where: { level: 1, status: 'active' },
        order: [['sortOrder', 'ASC'], ['label', 'ASC']],
        attributes: ['key', 'label', 'description']
      });
      
      res.status(200).json({
        success: true,
        data: categories
      });
    } catch (error) {
      console.error('获取商品分类失败:', error);
      res.status(500).json({
        success: false,
        error: '获取商品分类失败'
      });
    }
  },

  // 获取二级分类（根据一级分类key）- 从数据库读取
  getProductLevel2Categories: async (req, res) => {
    try {
      const { level1 } = req.query;
      
      if (!level1) {
        return res.status(400).json({
          success: false,
          error: '请提供一级分类key'
        });
      }

      const level2Categories = await ProductCategory.findAll({
        where: { parentKey: level1, level: 2, status: 'active' },
        order: [['sortOrder', 'ASC'], ['label', 'ASC']],
        attributes: ['key', 'label', 'description']
      });
      
      if (level2Categories.length === 0) {
        return res.status(404).json({
          success: false,
          error: '未找到该一级分类对应的二级分类'
        });
      }

      const level1Info = await ProductCategory.findOne({
        where: { key: level1, level: 1 },
        attributes: ['key', 'label', 'description']
      });

      res.status(200).json({
        success: true,
        data: level2Categories,
        level1Info
      });
    } catch (error) {
      console.error('获取二级分类失败:', error);
      res.status(500).json({
        success: false,
        error: '获取二级分类失败'
      });
    }
  },

  // 获取三级分类（根据二级分类key）- 从数据库读取
  getProductLevel3Categories: async (req, res) => {
    try {
      const { level2 } = req.query;
      
      if (!level2) {
        return res.status(400).json({
          success: false,
          error: '请提供二级分类key'
        });
      }

      const level3Categories = await ProductCategory.findAll({
        where: { parentKey: level2, level: 3, status: 'active' },
        order: [['sortOrder', 'ASC'], ['label', 'ASC']],
        attributes: ['key', 'label', 'description']
      });
      
      res.status(200).json({
        success: true,
        data: level3Categories.map(cat => ({ key: cat.key, label: cat.label }))
      });
    } catch (error) {
      console.error('获取三级分类失败:', error);
      res.status(500).json({
        success: false,
        error: '获取三级分类失败'
      });
    }
  },

  // 验证商品分类
  validateProductCategory: async (req, res) => {
    try {
      const { level1, level2, level3 } = req.query;
      
      if (!level1 || !level2) {
        return res.status(400).json({
          success: false,
          error: '请提供一级和二级分类'
        });
      }

      const result = validateCategory(level1, level2, level3);
      
      if (result.valid) {
        res.status(200).json({
          success: true,
          message: result.message,
          categoryPath: getCategoryPath(level1, level2, level3)
        });
      } else {
        res.status(400).json({
          success: false,
          error: result.message
        });
      }
    } catch (error) {
      console.error('验证分类失败:', error);
      res.status(500).json({
        success: false,
        error: '验证分类失败'
      });
    }
  },

  // 获取完整商品分类树（从数据库）- 优化版本
  getProductCategoryTree: async (req, res) => {
    try {
      const { refresh } = req.query;
      
      const cacheKey = 'product_category_tree';
      const cachedTree = await getCache(cacheKey);
      
      if (cachedTree && !refresh) {
        console.log('返回缓存的分类树');
        return res.status(200).json({
          success: true,
          data: JSON.parse(cachedTree),
          fromCache: true
        });
      }

      const level1Categories = await ProductCategory.scope('level1', 'active').findAll({
        order: [['sortOrder', 'ASC'], ['label', 'ASC']]
      });

      const categoryTree = [];

      for (const level1 of level1Categories) {
        const level2Categories = await ProductCategory.scope('level2', 'active').findAll({
          where: { parentKey: level1.key },
          order: [['sortOrder', 'ASC'], ['label', 'ASC']]
        });

        const level2WithChildren = [];
        for (const level2 of level2Categories) {
          const level3Categories = await ProductCategory.scope('level3', 'active').findAll({
            where: { parentKey: level2.key },
            order: [['sortOrder', 'ASC'], ['label', 'ASC']]
          });

          level2WithChildren.push({
            id: level2.id,
            key: level2.key,
            label: level2.label,
            description: level2.description,
            level: 2,
            parentKey: level2.parentKey,
            sortOrder: level2.sortOrder,
            status: level2.status,
            createdAt: level2.createdAt,
            updatedAt: level2.updatedAt,
            children: level3Categories.map(level3 => ({
              id: level3.id,
              key: level3.key,
              label: level3.label,
              description: level3.description,
              level: 3,
              parentKey: level3.parentKey,
              sortOrder: level3.sortOrder,
              status: level3.status,
              createdAt: level3.createdAt,
              updatedAt: level3.updatedAt,
              isLeaf: true
            }))
          });
        }

        categoryTree.push({
          id: level1.id,
          key: level1.key,
          label: level1.label,
          description: level1.description,
          level: 1,
          parentKey: null,
          sortOrder: level1.sortOrder,
          status: level1.status,
          createdAt: level1.createdAt,
          updatedAt: level1.updatedAt,
          children: level2WithChildren
        });
      }

      await setCache(cacheKey, JSON.stringify(categoryTree), 3600);

      res.status(200).json({
        success: true,
        data: categoryTree,
        fromCache: false,
        timestamp: Date.now()
      });
    } catch (error) {
      console.error('获取分类树失败:', error);
      res.status(500).json({
        success: false,
        error: '获取分类树失败',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  },

  // 获取分类统计信息
  getCategoryStats: async (req, res) => {
    try {
      const level1Count = await ProductCategory.scope('level1', 'active').count();
      const level2Count = await ProductCategory.scope('level2', 'active').count();
      const level3Count = await ProductCategory.scope('level3', 'active').count();

      res.status(200).json({
        success: true,
        data: {
          total: level1Count + level2Count + level3Count,
          level1: level1Count,
          level2: level2Count,
          level3: level3Count
        }
      });
    } catch (error) {
      console.error('获取分类统计失败:', error);
      res.status(500).json({
        success: false,
        error: '获取分类统计失败'
      });
    }
  },

  // 刷新分类缓存
  refreshCategoryCache: async (req, res) => {
    try {
      await clearCache('product_category_tree');
      res.status(200).json({
        success: true,
        message: '分类缓存已刷新'
      });
    } catch (error) {
      console.error('刷新分类缓存失败:', error);
      res.status(500).json({
        success: false,
        error: '刷新分类缓存失败'
      });
    }
  },

  // 批量更新分类排序
  batchUpdateSortOrder: async (req, res) => {
    try {
      const { updates } = req.body;

      if (!Array.isArray(updates)) {
        return res.status(400).json({
          success: false,
          error: '更新数据格式错误'
        });
      }

      const errors = [];
      for (const update of updates) {
        try {
          const category = await ProductCategory.findByPk(update.id);
          if (category) {
            await category.update({ sortOrder: update.sortOrder });
          }
        } catch (e) {
          errors.push({ id: update.id, error: e.message });
        }
      }

      await clearCache('product_category_tree');

      res.status(200).json({
        success: true,
        message: `成功更新 ${updates.length - errors.length} 条记录`,
        errors
      });
    } catch (error) {
      console.error('批量更新排序失败:', error);
      res.status(500).json({
        success: false,
        error: '批量更新排序失败'
      });
    }
  },

  // ==================== 商品三级分类CRUD操作 ====================

  // 创建一级分类
  createLevel1Category: async (req, res) => {
    try {
      const { label, value: key, description } = req.body;

      if (!label) {
        return res.status(400).json({
          success: false,
          error: '分类名称不能为空'
        });
      }

      const existingByLabel = await ProductCategory.findOne({ where: { label, level: 1 } });
      if (existingByLabel) {
        return res.status(400).json({
          success: false,
          error: '一级分类名称已存在'
        });
      }

      let categoryKey = key || generateCategoryKey(label);
      
      let existing = await ProductCategory.findOne({ where: { key: categoryKey } });
      while (existing) {
        categoryKey = generateCategoryKey(label);
        existing = await ProductCategory.findOne({ where: { key: categoryKey } });
      }

      const category = await ProductCategory.create({
        key: categoryKey,
        label,
        description,
        level: 1,
        parentKey: null
      });

      res.status(201).json({
        success: true,
        data: category
      });
    } catch (error) {
      console.error('创建一级分类失败:', error);
      res.status(500).json({
        success: false,
        error: '创建一级分类失败'
      });
    }
  },

  // 更新一级分类
  updateLevel1Category: async (req, res) => {
    try {
      const { key } = req.params;
      const { label, description } = req.body;

      let category;
      if (/^\d+$/.test(key)) {
        category = await ProductCategory.findByPk(parseInt(key, 10));
      } else {
        category = await ProductCategory.findOne({ where: { key, level: 1 } });
      }
      
      if (!category || category.level !== 1) {
        return res.status(404).json({
          success: false,
          error: '一级分类不存在'
        });
      }

      if (label && label !== category.label) {
        const existingByLabel = await ProductCategory.findOne({ where: { label, level: 1 } });
        if (existingByLabel && existingByLabel.id !== category.id) {
          return res.status(400).json({
            success: false,
            error: '一级分类名称已存在'
          });
        }
      }

      await category.update({
        label: label || category.label,
        description: description !== undefined ? description : category.description
      });

      res.status(200).json({
        success: true,
        data: category
      });
    } catch (error) {
      console.error('更新一级分类失败:', error);
      res.status(500).json({
        success: false,
        error: '更新一级分类失败'
      });
    }
  },

  // 删除一级分类（级联删除所有子分类）
deleteLevel1Category: async (req, res) => {
 try {
 const { key } = req.params;

 let category;
 if (/^\d+$/.test(key)) {
 category = await ProductCategory.findByPk(parseInt(key, 10));
 } else {
 category = await ProductCategory.findOne({ where: { key, level: 1 } });
 }
 
 if (!category || category.level !== 1) {
 return res.status(404).json({
 success: false,
 error: '一级分类不存在'
 });
 }

 const deletedCategoryInfo = {
 id: category.id,
 key: category.key,
 label: category.label,
 level: 1,
 deletedAt: new Date().toISOString()
 };

 const level2Categories = await ProductCategory.findAll({ where: { parentKey: category.key } });
 const deletedSubCategories = [];
 
 for (const level2 of level2Categories) {
 const level3Categories = await ProductCategory.findAll({ where: { parentKey: level2.key } });
 for (const level3 of level3Categories) {
 deletedSubCategories.push({
 id: level3.id,
 key: level3.key,
 label: level3.label,
 level: 3,
 parentKey: level3.parentKey
 });
 }
 await ProductCategory.destroy({ where: { parentKey: level2.key } });
 
 deletedSubCategories.push({
 id: level2.id,
 key: level2.key,
 label: level2.label,
 level: 2,
 parentKey: level2.parentKey
 });
 await level2.destroy();
 }
 
 await category.destroy();

 await clearCache('product_category_tree');

 res.status(200).json({
 success: true,
 message: '删除成功',
 data: {
 category: deletedCategoryInfo,
 deletedSubCategories,
 totalDeleted: 1 + deletedSubCategories.length
 }
 });
 } catch (error) {
 console.error('删除一级分类失败:', error);
 res.status(500).json({
 success: false,
 error: '删除一级分类失败'
 });
 }
 },

  // 创建二级分类
  createLevel2Category: async (req, res) => {
    try {
      const { parentKey } = req.params;
      const { label, value: key, description } = req.body;

      if (!label) {
        return res.status(400).json({
          success: false,
          error: '分类名称不能为空'
        });
      }

      let parent;
      if (/^\d+$/.test(parentKey)) {
        parent = await ProductCategory.findByPk(parseInt(parentKey, 10));
      } else {
        parent = await ProductCategory.findOne({ where: { key: parentKey, level: 1 } });
      }
      
      if (!parent || parent.level !== 1) {
        return res.status(404).json({
          success: false,
          error: '父分类不存在'
        });
      }

      const existingByLabel = await ProductCategory.findOne({ where: { label, level: 2, parentKey: parent.key } });
      if (existingByLabel) {
        return res.status(400).json({
          success: false,
          error: '该父分类下已存在同名二级分类'
        });
      }

      let categoryKey = key || generateCategoryKey(label);
      
      let existing = await ProductCategory.findOne({ where: { key: categoryKey } });
      while (existing) {
        categoryKey = generateCategoryKey(label);
        existing = await ProductCategory.findOne({ where: { key: categoryKey } });
      }

      const category = await ProductCategory.create({
        key: categoryKey,
        label,
        description,
        level: 2,
        parentKey: parent.key  // 使用父分类的key，而不是URL参数
      });

      res.status(201).json({
        success: true,
        data: category
      });
    } catch (error) {
      console.error('创建二级分类失败:', error);
      res.status(500).json({
        success: false,
        error: '创建二级分类失败'
      });
    }
  },

  // 更新二级分类
  updateLevel2Category: async (req, res) => {
    try {
      const { key } = req.params;
      const { label, description } = req.body;

      let category;
      if (/^\d+$/.test(key)) {
        category = await ProductCategory.findByPk(parseInt(key, 10));
      } else {
        category = await ProductCategory.findOne({ where: { key, level: 2 } });
      }
      
      if (!category || category.level !== 2) {
        return res.status(404).json({
          success: false,
          error: '二级分类不存在'
        });
      }

      if (label && label !== category.label) {
        const existingByLabel = await ProductCategory.findOne({ where: { label, level: 2, parentKey: category.parentKey } });
        if (existingByLabel && existingByLabel.id !== category.id) {
          return res.status(400).json({
            success: false,
            error: '该父分类下已存在同名二级分类'
          });
        }
      }

      await category.update({
        label: label || category.label,
        description: description !== undefined ? description : category.description
      });

      res.status(200).json({
        success: true,
        data: category
      });
    } catch (error) {
      console.error('更新二级分类失败:', error);
      res.status(500).json({
        success: false,
        error: '更新二级分类失败'
      });
    }
  },

  // 删除二级分类
deleteLevel2Category: async (req, res) => {
 try {
 const { key } = req.params;

 let category;
 if (/^\d+$/.test(key)) {
 category = await ProductCategory.findByPk(parseInt(key, 10));
 } else {
 category = await ProductCategory.findOne({ where: { key, level: 2 } });
 }
 
 if (!category || category.level !== 2) {
 return res.status(404).json({
 success: false,
 error: '二级分类不存在'
 });
 }

 const deletedCategoryInfo = {
 id: category.id,
 key: category.key,
 label: category.label,
 level: 2,
 parentKey: category.parentKey,
 deletedAt: new Date().toISOString()
 };

 const level3Categories = await ProductCategory.findAll({ where: { parentKey: category.key } });
 const deletedSubCategories = [];
 
 for (const level3 of level3Categories) {
 deletedSubCategories.push({
 id: level3.id,
 key: level3.key,
 label: level3.label,
 level: 3,
 parentKey: level3.parentKey
 });
 }
 
 await ProductCategory.destroy({ where: { parentKey: category.key } });
 await category.destroy();

 await clearCache('product_category_tree');

 res.status(200).json({
 success: true,
 message: '删除成功',
 data: {
 category: deletedCategoryInfo,
 deletedSubCategories,
 totalDeleted: 1 + deletedSubCategories.length
 }
 });
 } catch (error) {
 console.error('删除二级分类失败:', error);
 res.status(500).json({
 success: false,
 error: '删除二级分类失败'
 });
 }
 },

  // 创建三级分类
  createLevel3Category: async (req, res) => {
    try {
      const { parentKey } = req.params;
      const { label, value: key, description } = req.body;

      if (!label) {
        return res.status(400).json({
          success: false,
          error: '分类名称不能为空'
        });
      }

      let parent;
      if (/^\d+$/.test(parentKey)) {
        parent = await ProductCategory.findByPk(parseInt(parentKey, 10));
      } else {
        parent = await ProductCategory.findOne({ where: { key: parentKey, level: 2 } });
      }
      
      if (!parent || parent.level !== 2) {
        return res.status(404).json({
          success: false,
          error: '父分类不存在'
        });
      }

      const existingByLabel = await ProductCategory.findOne({ where: { label, level: 3, parentKey: parent.key } });
      if (existingByLabel) {
        return res.status(400).json({
          success: false,
          error: '该父分类下已存在同名三级分类'
        });
      }

      let categoryKey = key || generateCategoryKey(label);
      
      let existing = await ProductCategory.findOne({ where: { key: categoryKey } });
      while (existing) {
        categoryKey = generateCategoryKey(label);
        existing = await ProductCategory.findOne({ where: { key: categoryKey } });
      }

      const category = await ProductCategory.create({
        key: categoryKey,
        label,
        description,
        level: 3,
        parentKey: parent.key  // 使用父分类的key，而不是URL参数
      });

      res.status(201).json({
        success: true,
        data: category
      });
    } catch (error) {
      console.error('创建三级分类失败:', error);
      res.status(500).json({
        success: false,
        error: '创建三级分类失败'
      });
    }
  },

  // 更新三级分类
  updateLevel3Category: async (req, res) => {
    try {
      const { key } = req.params;
      const { label, description } = req.body;

      let category;
      if (/^\d+$/.test(key)) {
        category = await ProductCategory.findByPk(parseInt(key, 10));
      } else {
        category = await ProductCategory.findOne({ where: { key, level: 3 } });
      }
      
      if (!category || category.level !== 3) {
        return res.status(404).json({
          success: false,
          error: '三级分类不存在'
        });
      }

      if (label && label !== category.label) {
        const existingByLabel = await ProductCategory.findOne({ where: { label, level: 3, parentKey: category.parentKey } });
        if (existingByLabel && existingByLabel.id !== category.id) {
          return res.status(400).json({
            success: false,
            error: '该父分类下已存在同名三级分类'
          });
        }
      }

      await category.update({
        label: label || category.label,
        description: description !== undefined ? description : category.description
      });

      res.status(200).json({
        success: true,
        data: category
      });
    } catch (error) {
      console.error('更新三级分类失败:', error);
      res.status(500).json({
        success: false,
        error: '更新三级分类失败'
      });
    }
  },

  // 删除三级分类
deleteLevel3Category: async (req, res) => {
 try {
 const { key } = req.params;

 let category;
 if (/^\d+$/.test(key)) {
 category = await ProductCategory.findByPk(parseInt(key, 10));
 } else {
 category = await ProductCategory.findOne({ where: { key, level: 3 } });
 }
 
 if (!category || category.level !== 3) {
 return res.status(404).json({
 success: false,
 error: '三级分类不存在'
 });
 }

 const deletedCategoryInfo = {
 id: category.id,
 key: category.key,
 label: category.label,
 level: 3,
 parentKey: category.parentKey,
 deletedAt: new Date().toISOString()
 };

 await category.destroy();

 await clearCache('product_category_tree');

 res.status(200).json({
 success: true,
 message: '删除成功',
 data: {
 category: deletedCategoryInfo,
 deletedSubCategories: [],
 totalDeleted: 1
 }
 });
 } catch (error) {
 console.error('删除三级分类失败:', error);
 res.status(500).json({
 success: false,
 error: '删除三级分类失败'
 });
 }
 }
};

module.exports = categoryController;