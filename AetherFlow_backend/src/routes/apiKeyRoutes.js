const express = require('express');
const apiKeyController = require('../controllers/apiKeyController');
const { validator } = require('../middlewares');
const { apiKeySchemas, idSchema } = require('../utils/validationSchemas');
const { protect } = require('../middlewares/auth');

const router = express.Router();

// 所有路由都需要认证
router.use(protect);

// 获取API密钥列表
router.get('/',
  apiKeyController.getApiKeys
);

// 添加API密钥
router.post('/',
  validator.validateBody(apiKeySchemas.addApiKey),
  apiKeyController.addApiKey
);

// 验证API密钥
router.post('/:id/verify',
  validator.validateParams(idSchema),
  apiKeyController.verifyApiKey
);

// 更新API密钥
router.patch('/:id',
  validator.validateParams(idSchema),
  validator.validateBody(apiKeySchemas.updateApiKey),
  apiKeyController.updateApiKey
);

// 删除API密钥
router.delete('/:id',
  validator.validateParams(idSchema),
  apiKeyController.deleteApiKey
);

module.exports = router; 