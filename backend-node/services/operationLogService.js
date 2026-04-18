const OperationLog = require('../models/OperationLog');
const { Op } = require('sequelize');

const operationLogService = {
  async logOperation(options) {
    try {
      const {
        userId,
        username,
        role,
        action,
        module,
        targetId = null,
        targetName = null,
        description = null,
        req = null,
        beforeData = null,
        afterData = null
      } = options;

      const logData = {
        userId,
        username,
        role,
        action,
        module,
        targetId,
        targetName,
        description,
        beforeData,
        afterData
      };

      if (req) {
        logData.ipAddress = req.ip || req.connection?.remoteAddress || req.socket?.remoteAddress;
        logData.userAgent = req.get('user-agent');
      }

      await OperationLog.create(logData);
    } catch (error) {
      console.error('记录操作日志失败:', error);
    }
  },

  async getLogs(options = {}) {
    const {
      page = 1,
      limit = 20,
      userId = null,
      role = null,
      module = null,
      action = null,
      startDate = null,
      endDate = null
    } = options;

    const where = {};
    if (userId) where.userId = userId;
    if (role) where.role = role;
    if (module) where.module = module;
    if (action) where.action = action;

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt[Op.gte] = new Date(startDate);
      if (endDate) where.createdAt[Op.lte] = new Date(endDate);
    }

    const offset = (page - 1) * limit;

    const { count, rows } = await OperationLog.findAndCountAll({
      where,
      limit: parseInt(limit),
      offset,
      order: [['createdAt', 'DESC']]
    });

    return {
      logs: rows,
      total: count,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(count / limit)
    };
  }
};

module.exports = operationLogService;
