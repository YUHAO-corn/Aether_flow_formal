const express = require('express');
const activityController = require('../controllers/activityController');
const { protect } = require('../middlewares/auth');

const router = express.Router();

// 所有活动日志路由都需要认证
router.use(protect);

// 获取活动日志列表
router.get('/', activityController.getActivities);

// 获取活动统计信息
router.get('/stats', activityController.getActivityStats);

// 获取单个活动日志
router.get('/:id', activityController.getActivity);

// 清除活动日志
router.delete('/', activityController.clearActivities);

module.exports = router; 