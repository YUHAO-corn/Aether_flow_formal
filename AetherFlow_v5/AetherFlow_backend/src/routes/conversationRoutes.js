const express = require('express');
const { conversationController } = require('../controllers');
const { validator } = require('../middlewares');
const { conversationSchemas, idSchema, promptSchemas } = require('../utils/validationSchemas');
const { protect } = require('../middlewares/auth');

const router = express.Router();

// 所有路由都需要认证
router.use(protect);

// 获取会话列表
router.get('/',
  validator.validateQuery(promptSchemas.pagination),
  conversationController.getConversations
);

// 创建会话
router.post('/',
  validator.validateBody(conversationSchemas.createConversation),
  conversationController.createConversation
);

// 获取单个会话
router.get('/:id',
  validator.validateParams(idSchema),
  conversationController.getConversation
);

// 更新会话
router.patch('/:id',
  validator.validateParams(idSchema),
  validator.validateBody(conversationSchemas.updateConversation),
  conversationController.updateConversation
);

// 删除会话
router.delete('/:id',
  validator.validateParams(idSchema),
  conversationController.deleteConversation
);

// 获取会话的消息
router.get('/:id/messages',
  validator.validateParams(idSchema),
  conversationController.getMessages
);

// 添加消息到会话
router.post('/:id/messages',
  validator.validateParams(idSchema),
  validator.validateBody(conversationSchemas.addMessage),
  conversationController.addMessage
);

// 清空会话消息
router.delete('/:id/messages',
  validator.validateParams(idSchema),
  conversationController.clearMessages
);

module.exports = router; 