const express = require('express');
const { authController } = require('../controllers');
const { validator } = require('../middlewares');
const { userSchemas } = require('../utils/validationSchemas');
const { protect } = require('../middlewares/auth');

const router = express.Router();

// 公开路由
router.post('/register', 
  validator.validateBody(userSchemas.register),
  authController.register
);

router.post('/login', 
  validator.validateBody(userSchemas.login),
  authController.login
);

// 需要认证的路由
router.use(protect);

router.get('/me', authController.getMe);

router.patch('/updateMe',
  validator.validateBody(userSchemas.updateUser),
  authController.updateMe
);

router.post('/logout', authController.logout);

module.exports = router; 