const express = require('express');
const router = express.Router();
const tagController = require('../controllers/tagController');
const { protect } = require('../middlewares/auth');
const validator = require('../middlewares/validator');
const { tagSchemas, idSchema, promptSchemas } = require('../utils/validationSchemas');

// 所有路由都需要认证
router.use(protect);

// 获取标签统计信息 - 需要放在具体ID路由之前
router.get('/statistics', tagController.getTagStatistics);

// 获取标签列表
router.get('/', tagController.getTags);

// 创建标签
router.post('/',
  validator.validateBody(tagSchemas.createTag),
  tagController.createTag
);

// 获取单个标签
router.get('/:id',
  validator.validateParams(idSchema),
  tagController.getTag
);

// 更新标签
router.patch('/:id',
  validator.validateParams(idSchema),
  validator.validateBody(tagSchemas.updateTag),
  tagController.updateTag
);

// 删除标签
router.delete('/:id',
  validator.validateParams(idSchema),
  tagController.deleteTag
);

// 获取标签的提示词
router.get('/:id/prompts',
  validator.validateParams(idSchema),
  validator.validateQuery(promptSchemas.pagination),
  tagController.getTagPrompts
);

module.exports = router; 