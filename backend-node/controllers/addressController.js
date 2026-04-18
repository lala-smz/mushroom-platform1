const Address = require('../models/Address');

const addressController = {
  // 获取用户地址列表
  getAddressList: async (req, res) => {
    try {
      const userId = req.user.id;
      
      const addresses = await Address.findAll({
        where: { userId },
        order: [['isDefault', 'DESC'], ['createdAt', 'DESC']]
      });
      
      res.status(200).json({
        success: true,
        data: addresses
      });
    } catch (error) {
      console.error('获取地址列表失败:', error);
      res.status(500).json({
        success: false,
        error: '获取地址列表失败'
      });
    }
  },
  
  // 添加新地址
  addAddress: async (req, res) => {
    try {
      const userId = req.user.id;
      const { receiver, phone, province, city, district, detail, postalCode, isDefault = false } = req.body;
      
      // 验证必填字段
      if (!receiver || !phone || !province || !city || !district || !detail) {
        return res.status(400).json({
          success: false,
          error: '请填写完整的地址信息'
        });
      }
      
      // 验证手机号格式
      const phoneRegex = /^1[3-9]\d{9}$/;
      if (!phoneRegex.test(phone)) {
        return res.status(400).json({
          success: false,
          error: '请输入正确的手机号'
        });
      }
      
      // 如果设置为默认地址，先将其他地址设为非默认
      if (isDefault) {
        await Address.update(
          { isDefault: false },
          { where: { userId } }
        );
      }
      
      // 创建新地址
      const address = await Address.create({
        userId,
        receiver,
        phone,
        province,
        city,
        district,
        detail,
        postalCode,
        isDefault
      });
      
      res.status(201).json({
        success: true,
        data: address
      });
    } catch (error) {
      console.error('添加地址失败:', error);
      res.status(500).json({
        success: false,
        error: '添加地址失败'
      });
    }
  },
  
  // 更新地址
  updateAddress: async (req, res) => {
    try {
      const userId = req.user.id;
      const { id } = req.params;
      const { receiver, phone, province, city, district, detail, postalCode, isDefault } = req.body;
      
      // 查找地址
      const address = await Address.findByPk(id);
      if (!address) {
        return res.status(404).json({
          success: false,
          error: '地址不存在'
        });
      }
      
      // 验证权限
      if (address.userId !== userId) {
        return res.status(403).json({
          success: false,
          error: '无权限修改此地址'
        });
      }
      
      // 验证必填字段
      if (!receiver || !phone || !province || !city || !district || !detail) {
        return res.status(400).json({
          success: false,
          error: '请填写完整的地址信息'
        });
      }
      
      // 验证手机号格式
      const phoneRegex = /^1[3-9]\d{9}$/;
      if (!phoneRegex.test(phone)) {
        return res.status(400).json({
          success: false,
          error: '请输入正确的手机号'
        });
      }
      
      // 如果设置为默认地址，先将其他地址设为非默认
      if (isDefault) {
        await Address.update(
          { isDefault: false },
          { where: { userId } }
        );
      }
      
      // 更新地址
      await address.update({
        receiver,
        phone,
        province,
        city,
        district,
        detail,
        postalCode,
        isDefault
      });
      
      // 重新获取更新后的地址
      const updatedAddress = await Address.findByPk(id);
      
      res.status(200).json({
        success: true,
        data: updatedAddress
      });
    } catch (error) {
      console.error('更新地址失败:', error);
      res.status(500).json({
        success: false,
        error: '更新地址失败'
      });
    }
  },
  
  // 删除地址
  deleteAddress: async (req, res) => {
    try {
      const userId = req.user.id;
      const { id } = req.params;
      
      // 查找地址
      const address = await Address.findByPk(id);
      if (!address) {
        return res.status(404).json({
          success: false,
          error: '地址不存在'
        });
      }
      
      // 验证权限
      if (address.userId !== userId) {
        return res.status(403).json({
          success: false,
          error: '无权限删除此地址'
        });
      }
      
      // 删除地址
      await address.destroy();
      
      res.status(200).json({
        success: true,
        message: '删除地址成功'
      });
    } catch (error) {
      console.error('删除地址失败:', error);
      res.status(500).json({
        success: false,
        error: '删除地址失败'
      });
    }
  },
  
  // 设置默认地址
  setDefaultAddress: async (req, res) => {
    try {
      const userId = req.user.id;
      const { id } = req.params;
      
      // 查找地址
      const address = await Address.findByPk(id);
      if (!address) {
        return res.status(404).json({
          success: false,
          error: '地址不存在'
        });
      }
      
      // 验证权限
      if (address.userId !== userId) {
        return res.status(403).json({
          success: false,
          error: '无权限操作此地址'
        });
      }
      
      // 先将所有地址设为非默认
      await Address.update(
        { isDefault: false },
        { where: { userId } }
      );
      
      // 设置当前地址为默认
      await address.update({ isDefault: true });
      
      // 重新获取更新后的地址
      const updatedAddress = await Address.findByPk(id);
      
      res.status(200).json({
        success: true,
        data: updatedAddress
      });
    } catch (error) {
      console.error('设置默认地址失败:', error);
      res.status(500).json({
        success: false,
        error: '设置默认地址失败'
      });
    }
  }
};

module.exports = addressController;