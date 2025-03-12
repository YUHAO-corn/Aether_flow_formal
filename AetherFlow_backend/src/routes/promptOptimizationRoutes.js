const express = require('express');
const promptOptimizationController = require('../controllers/promptOptimizationController');
const { protect } = require('../middlewares/auth');
const { validateBody } = require('../middlewares/validator');
const { optimizePrompt, rateOptimization, manageApiKey } = require('../utils/validationSchemas');

const router = express.Router();

// 获取客户端配置
router.get('/config', protect, promptOptimizationController.getClientConfig);

// 优化提示词
router.post('/', protect, validateBody(optimizePrompt), promptOptimizationController.optimizePrompt);

// 获取优化历史
router.get('/history', protect, promptOptimizationController.getOptimizationHistory);

// 获取单个优化历史
router.get('/history/:id', protect, promptOptimizationController.getOptimizationHistoryById);

// 评价优化结果
router.post('/history/:id/rate', protect, validateBody(rateOptimization), promptOptimizationController.rateOptimization);

// API密钥管理
router.post('/api-keys', protect, validateBody(manageApiKey), promptOptimizationController.manageApiKey);
router.get('/api-keys', protect, promptOptimizationController.getApiKeys);
router.delete('/api-keys/:id', protect, promptOptimizationController.deleteApiKey);

module.exports = router; 