const express = require('express');
const { getMonitorData, resetMonitorData } = require('../middlewares/monitor');
const { protect, authorize } = require('../middlewares/auth');
const { successResponse } = require('../utils/responseHandler');

const router = express.Router();

// 所有路由都需要认证和管理员权限
router.use(protect);
router.use(authorize('admin'));

/**
 * 获取监控数据
 * @route GET /api/v1/monitor
 * @access 私有 (仅管理员)
 */
router.get('/', (req, res) => {
  const data = getMonitorData();
  return successResponse(res, data);
});

/**
 * 重置监控数据
 * @route POST /api/v1/monitor/reset
 * @access 私有 (仅管理员)
 */
router.post('/reset', (req, res) => {
  resetMonitorData();
  return successResponse(res, { message: '监控数据已重置' });
});

module.exports = router; 