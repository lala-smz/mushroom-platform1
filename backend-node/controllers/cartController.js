const Cart = require('../models/Cart');
const Product = require('../models/Product');
const MushroomBox = require('../models/MushroomBox');
const { cache, cacheKeys } = require('../config/redis');

const cartController = {
  // 获取购物车列表
  getCart: async (req, res) => {
    try {
      const userId = req.user.id;
      const { sequelize } = require('../config/db');

      // 尝试从缓存获取
      const cacheKey = cacheKeys.cart(userId);
      let cartItems = await cache.get(cacheKey);
      if (cartItems) {
        return res.status(200).json({
          success: true,
          data: cartItems
        });
      }

      // 使用事务来清理无效商品并获取购物车
      const result = await sequelize.transaction(async (t) => {
        // 从数据库查询
        const cartItems = await Cart.findAll({
          where: { userId },
          transaction: t
        });

        const validCartItems = [];
        const invalidCartItemIds = [];

        // 将Sequelize实例转换为普通JSON对象并验证
        for (const item of cartItems) {
          let isValid = false;
          const itemJson = item.toJSON();

          if (item.type === 'box') {
            // 盲盒类型
            try {
              const box = await MushroomBox.findByPk(item.productId, {
                attributes: ['id', 'name', 'price', 'image', 'stock'],
                transaction: t
              });
              if (box) {
                itemJson.box = box.toJSON();
                isValid = true;
              }
            } catch (err) {
              console.warn('获取盲盒信息失败:', err.message);
            }
          } else {
            // 普通商品类型
            try {
              const product = await Product.findByPk(item.productId, {
                attributes: ['id', 'name', 'price', 'images', 'stock'],
                transaction: t
              });
              if (product) {
                itemJson.product = product.toJSON();
                isValid = true;
              }
            } catch (err) {
              console.warn('获取商品信息失败:', err.message);
            }
          }

          if (isValid) {
            validCartItems.push(itemJson);
          } else {
            invalidCartItemIds.push(item.id);
            console.warn(`清理购物车中的无效商品: cartId=${item.id}, productId=${item.productId}, type=${item.type}`);
          }
        }

        // 删除无效商品
        if (invalidCartItemIds.length > 0) {
          await Cart.destroy({
            where: { id: invalidCartItemIds },
            transaction: t
          });
          console.log(`已清理 ${invalidCartItemIds.length} 个无效购物车商品`);
        }

        return validCartItems;
      });

      // 缓存购物车
      await cache.set(cacheKey, result, 3600);

      res.status(200).json({
        success: true,
        data: result
      });
    } catch (error) {
      console.error('获取购物车失败:', error);
      res.status(500).json({
        success: false,
        error: '获取购物车失败'
      });
    }
  },

  // 添加商品到购物车
  addToCart: async (req, res) => {
    try {
      const userId = req.user.id;
      let { productId, quantity = 1, type = 'product' } = req.body;
      
      // 确保quantity是有效数字
      quantity = parseInt(quantity);
      if (isNaN(quantity) || quantity < 1) {
        quantity = 1;
      }

      // 验证商品/盲盒是否存在
      let item = null;
      if (type === 'product') {
        item = await Product.findByPk(productId);
        if (!item) {
          return res.status(404).json({
            success: false,
            error: '商品不存在'
          });
        }

        if (item.stock < quantity) {
          return res.status(400).json({
            success: false,
            error: '商品库存不足'
          });
        }
      } else if (type === 'box') {
        item = await MushroomBox.findByPk(productId);
        if (!item) {
          return res.status(404).json({
            success: false,
            error: '盲盒不存在'
          });
        }

        if (item.stock < quantity) {
          return res.status(400).json({
            success: false,
            error: '盲盒库存不足'
          });
        }
        console.log('添加盲盒到购物车:', { productId, quantity });
      }

      // 检查购物车是否已有该商品/盲盒
      let cartItem = await Cart.findOne({
        where: { userId, productId, type }
      });

      if (cartItem) {
        const newQuantity = cartItem.quantity + quantity;
        if (item && newQuantity > item.stock) {
          return res.status(400).json({
            success: false,
            error: `库存不足，当前库存: ${item.stock}，已在购物车: ${cartItem.quantity}，尝试添加: ${quantity}，总计: ${newQuantity}`
          });
        }
        await cartItem.update({ quantity: newQuantity });
      } else {
        if (item && quantity > item.stock) {
          return res.status(400).json({
            success: false,
            error: `库存不足，当前库存: ${item.stock}，尝试添加: ${quantity}`
          });
        }
        cartItem = await Cart.create({
          userId,
          productId,
          type,
          quantity,
          selected: true
        });
      }

      // 清除缓存
      await cache.del(cacheKeys.cart(userId));

      res.status(201).json({
        success: true,
        data: cartItem.toJSON()
      });
    } catch (error) {
      console.error('添加到购物车失败:', error);
      res.status(500).json({
        success: false,
        error: '添加到购物车失败: ' + error.message
      });
    }
  },

  // 更新购物车商品数量
  updateCartItem: async (req, res) => {
    try {
      const userId = req.user.id;
      const { id } = req.params;
      const { quantity } = req.body;

      const cartItem = await Cart.findByPk(id);
      if (!cartItem) {
        return res.status(404).json({
          success: false,
          error: '购物车商品不存在'
        });
      }

      if (cartItem.userId !== userId) {
        return res.status(403).json({
          success: false,
          error: '无权限修改此购物车商品'
        });
      }

      let item = null;
      if (cartItem.type === 'product') {
        item = await Product.findByPk(cartItem.productId);
      } else if (cartItem.type === 'box') {
        item = await MushroomBox.findByPk(cartItem.productId);
      }
      
      if (!item) {
        return res.status(404).json({
          success: false,
          error: '商品/盲盒不存在'
        });
      }

      if (item.stock < quantity) {
        return res.status(400).json({
          success: false,
          error: '库存不足'
        });
      }

      await cartItem.update({ quantity });

      await cache.del(cacheKeys.cart(userId));

      res.status(200).json({
        success: true,
        data: cartItem.toJSON()
      });
    } catch (error) {
      console.error('更新购物车失败:', error);
      res.status(500).json({
        success: false,
        error: '更新购物车失败'
      });
    }
  },

  // 删除购物车商品
  deleteCartItem: async (req, res) => {
    try {
      const userId = req.user.id;
      const { id } = req.params;

      const cartItem = await Cart.findByPk(id);
      if (!cartItem) {
        return res.status(404).json({
          success: false,
          error: '购物车商品不存在'
        });
      }

      if (cartItem.userId !== userId) {
        return res.status(403).json({
          success: false,
          error: '无权限删除此购物车商品'
        });
      }

      await cartItem.destroy();

      await cache.del(cacheKeys.cart(userId));

      res.status(200).json({
        success: true,
        message: '删除成功'
      });
    } catch (error) {
      console.error('删除购物车商品失败:', error);
      res.status(500).json({
        success: false,
        error: '删除购物车商品失败'
      });
    }
  },

  // 清空购物车
  clearCart: async (req, res) => {
    try {
      const userId = req.user.id;
      await Cart.destroy({ where: { userId } });
      await cache.del(cacheKeys.cart(userId));

      res.status(200).json({
        success: true,
        message: '购物车已清空'
      });
    } catch (error) {
      console.error('清空购物车失败:', error);
      res.status(500).json({
        success: false,
        error: '清空购物车失败'
      });
    }
  },

  // 更新购物车商品选中状态
  updateCartItemStatus: async (req, res) => {
    try {
      const userId = req.user.id;
      const { id } = req.params;
      const { selected } = req.body;

      const cartItem = await Cart.findByPk(id);
      if (!cartItem) {
        return res.status(404).json({
          success: false,
          error: '购物车商品不存在'
        });
      }

      if (cartItem.userId !== userId) {
        return res.status(403).json({
          success: false,
          error: '无权限修改此购物车商品'
        });
      }

      await cartItem.update({ selected });

      await cache.del(cacheKeys.cart(userId));

      res.status(200).json({
        success: true,
        data: cartItem.toJSON()
      });
    } catch (error) {
      console.error('更新购物车商品状态失败:', error);
      res.status(500).json({
        success: false,
        error: '更新购物车商品状态失败'
      });
    }
  }
};

module.exports = cartController;
