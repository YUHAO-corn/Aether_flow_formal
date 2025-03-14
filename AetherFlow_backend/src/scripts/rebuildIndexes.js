const mongoose = require('mongoose');
const { Prompt } = require('../models');
const logger = require('../utils/logger');
require('dotenv').config();

async function rebuildIndexes() {
  try {
    // 连接数据库
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/aetherflow');
    logger.info('MongoDB连接成功');
    
    // 删除现有索引
    await Prompt.collection.dropIndexes();
    logger.info('已删除现有索引');
    
    // 重建索引
    await Prompt.collection.createIndex({ user: 1, createdAt: -1 });
    await Prompt.collection.createIndex({ tags: 1 });
    await Prompt.collection.createIndex({ favorite: 1 });
    await Prompt.collection.createIndex({ content: 'text' });
    logger.info('索引重建完成');
    
    process.exit(0);
  } catch (error) {
    logger.error('重建索引失败:', error);
    process.exit(1);
  }
}

rebuildIndexes(); 