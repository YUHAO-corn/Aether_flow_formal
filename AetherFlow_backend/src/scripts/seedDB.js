const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const { User, Tag, Prompt, Conversation } = require('../models');
const connectDB = require('../config/database');
const logger = require('../utils/logger');

// 加载环境变量
dotenv.config();

// 测试数据
const users = [
  {
    username: 'admin',
    email: 'admin@example.com',
    password: 'password123',
    role: 'admin'
  },
  {
    username: 'testuser',
    email: 'user@example.com',
    password: 'password123',
    role: 'user'
  }
];

const tags = [
  {
    name: '写作',
    color: '#3498db'
  },
  {
    name: '编程',
    color: '#2ecc71'
  },
  {
    name: '创意',
    color: '#e74c3c'
  },
  {
    name: '学习',
    color: '#f39c12'
  },
  {
    name: '工作',
    color: '#9b59b6'
  }
];

const prompts = [
  {
    content: '请帮我写一篇关于人工智能的文章，包括历史、现状和未来发展趋势。',
    response: '人工智能(AI)的发展可以追溯到20世纪50年代...',
    platform: 'ChatGPT',
    url: 'https://chat.openai.com/',
    favorite: true
  },
  {
    content: '解释一下React中的虚拟DOM是什么，以及它如何提高性能？',
    response: 'React的虚拟DOM是一种编程概念，其中UI的理想或"虚拟"表示保存在内存中...',
    platform: 'Claude',
    url: 'https://claude.ai/',
    favorite: false
  },
  {
    content: '写一个Python函数，实现快速排序算法。',
    response: '```python\ndef quick_sort(arr):\n    if len(arr) <= 1:\n        return arr\n    pivot = arr[len(arr) // 2]\n    left = [x for x in arr if x < pivot]\n    middle = [x for x in arr if x == pivot]\n    right = [x for x in arr if x > pivot]\n    return quick_sort(left) + middle + quick_sort(right)\n```',
    platform: 'ChatGPT',
    url: 'https://chat.openai.com/',
    favorite: true
  }
];

const conversations = [
  {
    model: 'gpt-4',
    title: '学习JavaScript',
    messages: [
      {
        role: 'user',
        content: '请解释JavaScript中的闭包概念',
        timestamp: new Date()
      },
      {
        role: 'assistant',
        content: '闭包是JavaScript中的一个重要概念，它指的是一个函数能够访问并记住其词法作用域，即使该函数在其词法作用域之外执行...',
        timestamp: new Date(Date.now() + 1000)
      }
    ]
  },
  {
    model: 'claude-2',
    title: '写作助手',
    messages: [
      {
        role: 'user',
        content: '我需要一个创意故事的开头，主题是太空探险',
        timestamp: new Date()
      },
      {
        role: 'assistant',
        content: '星际日志，2157年3月15日：当"希望号"飞船的引擎首次在木星轨道外熄火时，我们都以为这只是例行的系统故障...',
        timestamp: new Date(Date.now() + 1000)
      }
    ]
  }
];

// 清空并重新填充数据库
const seedDB = async () => {
  try {
    // 连接数据库
    await connectDB();
    
    // 清空现有数据
    await User.deleteMany({});
    await Tag.deleteMany({});
    await Prompt.deleteMany({});
    await Conversation.deleteMany({});
    
    logger.info('数据库已清空');
    
    // 创建用户
    const createdUsers = [];
    for (const userData of users) {
      // 加密密码
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(userData.password, salt);
      
      const user = await User.create({
        ...userData,
        password: hashedPassword
      });
      
      createdUsers.push(user);
    }
    
    logger.info(`已创建 ${createdUsers.length} 个用户`);
    
    // 为每个用户创建标签
    const createdTags = [];
    for (const user of createdUsers) {
      for (const tagData of tags) {
        const tag = await Tag.create({
          ...tagData,
          user: user._id
        });
        
        createdTags.push({ tag, userId: user._id });
      }
    }
    
    logger.info(`已创建 ${createdTags.length} 个标签`);
    
    // 为每个用户创建提示词
    const createdPrompts = [];
    for (const user of createdUsers) {
      // 获取该用户的标签
      const userTags = createdTags
        .filter(item => item.userId.equals(user._id))
        .map(item => item.tag._id);
      
      for (const promptData of prompts) {
        // 随机选择1-3个标签
        const randomTagCount = Math.floor(Math.random() * 3) + 1;
        const selectedTags = userTags
          .sort(() => 0.5 - Math.random())
          .slice(0, randomTagCount);
        
        const prompt = await Prompt.create({
          ...promptData,
          user: user._id,
          tags: selectedTags,
          usageCount: Math.floor(Math.random() * 10)
        });
        
        createdPrompts.push(prompt);
      }
    }
    
    logger.info(`已创建 ${createdPrompts.length} 个提示词`);
    
    // 为每个用户创建会话
    const createdConversations = [];
    for (const user of createdUsers) {
      // 获取该用户的标签
      const userTags = createdTags
        .filter(item => item.userId.equals(user._id))
        .map(item => item.tag._id);
      
      for (const conversationData of conversations) {
        // 随机选择0-2个标签
        const randomTagCount = Math.floor(Math.random() * 3);
        const selectedTags = userTags
          .sort(() => 0.5 - Math.random())
          .slice(0, randomTagCount);
        
        const conversation = await Conversation.create({
          ...conversationData,
          user: user._id,
          tags: selectedTags
        });
        
        createdConversations.push(conversation);
      }
    }
    
    logger.info(`已创建 ${createdConversations.length} 个会话`);
    
    logger.info('数据库初始化完成');
    process.exit(0);
  } catch (error) {
    logger.error('数据库初始化失败:', error);
    process.exit(1);
  }
};

// 执行初始化
seedDB(); 