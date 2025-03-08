const express = require('express');
const { activityController } = require('../controllers');
const { validator } = require('../middlewares');
const { idSchema, promptSchemas } = require('../utils/validationSchemas');
const { protect } = require('../middlewares/auth');

const router = express.Router();

// 所有路由都需要认证
router.use(protect);

// 获取用户活动日志
router.get('/',
  validator.validateQuery(promptSchemas.pagination),
  activityController.getActivities
);

// 获取活动统计信息
router.get('/stats', activityController.getActivityStats);

// 清除活动日志
router.delete('/', activityController.clearActivities);

// 获取单个活动日志
router.get('/:id',
  validator.validateParams(idSchema),
  activityController.getActivity
);

module.exports = router; 