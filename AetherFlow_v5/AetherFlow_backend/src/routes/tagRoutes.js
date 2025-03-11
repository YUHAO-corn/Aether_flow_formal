const express = require('express');
const { tagController } = require('../controllers');
const { validator } = require('../middlewares');
const { tagSchemas, idSchema, promptSchemas } = require('../utils/validationSchemas');
const { protect } = require('../middlewares/auth');

const router = express.Router();

// 所有路由都需要认证
router.use(protect);

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