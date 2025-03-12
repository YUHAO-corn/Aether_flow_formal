const express = require('express');
const { promptController } = require('../controllers');
const { validator } = require('../middlewares');
const { promptSchemas, idSchema } = require('../utils/validationSchemas');
const { protect } = require('../middlewares/auth');

const router = express.Router();

// 所有路由都需要认证
router.use(protect);

// 获取提示词列表
router.get('/',
  validator.validateQuery(promptSchemas.pagination),
  promptController.getPrompts
);

// 创建提示词
router.post('/',
  validator.validateBody(promptSchemas.createPrompt),
  promptController.createPrompt
);

// 自动保存提示词
router.post('/auto-save',
  validator.validateBody(promptSchemas.autoSavePrompt),
  promptController.autoSavePrompt
);

// 批量获取提示词
router.post('/batch',
  validator.validateBody(promptSchemas.batchPrompts),
  promptController.getBatchPrompts
);

// 获取最近使用的提示词
router.get('/recent',
  promptController.getRecentPrompts
);

// 快速搜索提示词
router.get('/quick-search',
  promptController.quickSearchPrompts
);

// 优化提示词
router.post('/enhance',
  validator.validateBody(promptSchemas.enhancePrompt),
  promptController.enhancePrompt
);

// 获取单个提示词
router.get('/:id',
  validator.validateParams(idSchema),
  promptController.getPrompt
);

// 更新提示词
router.patch('/:id',
  validator.validateParams(idSchema),
  validator.validateBody(promptSchemas.updatePrompt),
  promptController.updatePrompt
);

// 删除提示词
router.delete('/:id',
  validator.validateParams(idSchema),
  promptController.deletePrompt
);

// 切换收藏状态
router.patch('/:id/favorite',
  validator.validateParams(idSchema),
  promptController.toggleFavorite
);

// 增加使用次数
router.patch('/:id/usage',
  validator.validateParams(idSchema),
  promptController.incrementUsage
);

module.exports = router; 