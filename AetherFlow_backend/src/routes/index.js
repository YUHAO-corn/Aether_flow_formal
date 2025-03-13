const express = require('express');
const authRoutes = require('./authRoutes');
const promptRoutes = require('./promptRoutes');
const tagRoutes = require('./tagRoutes');
const conversationRoutes = require('./conversationRoutes');
const activityRoutes = require('./activityRoutes');
const promptOptimizationRoutes = require('./promptOptimizationRoutes');
const apiKeyRoutes = require('./apiKeyRoutes');

const router = express.Router();

// 健康检查
router.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'Server is running' });
});

// API路由
router.use('/auth', authRoutes);
router.use('/prompts', promptRoutes);
router.use('/tags', tagRoutes);
router.use('/conversations', conversationRoutes);
router.use('/activities', activityRoutes);
router.use('/prompts/optimize', promptOptimizationRoutes);
router.use('/api-keys', apiKeyRoutes);

module.exports = router; 