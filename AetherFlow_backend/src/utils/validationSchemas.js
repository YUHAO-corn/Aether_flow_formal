const Joi = require('joi');

// 用户相关验证模式
const userSchemas = {
  // 注册验证
  register: Joi.object({
    username: Joi.string().min(3).max(30).required()
      .messages({
        'string.base': 'Username must be a string',
        'string.empty': 'Username is required',
        'string.min': 'Username must be at least {#limit} characters long',
        'string.max': 'Username cannot exceed {#limit} characters',
        'any.required': 'Username is required'
      }),
    email: Joi.string().email().required()
      .messages({
        'string.base': 'Email must be a string',
        'string.empty': 'Email is required',
        'string.email': 'Please provide a valid email',
        'any.required': 'Email is required'
      }),
    password: Joi.string().min(6).required()
      .messages({
        'string.base': 'Password must be a string',
        'string.empty': 'Password is required',
        'string.min': 'Password must be at least {#limit} characters long',
        'any.required': 'Password is required'
      }),
    passwordConfirm: Joi.string().valid(Joi.ref('password')).required()
      .messages({
        'any.only': 'Passwords do not match',
        'any.required': 'Password confirmation is required'
      })
  }),

  // 登录验证
  login: Joi.object({
    email: Joi.string().email().required()
      .messages({
        'string.base': 'Email must be a string',
        'string.empty': 'Email is required',
        'string.email': 'Please provide a valid email',
        'any.required': 'Email is required'
      }),
    password: Joi.string().required()
      .messages({
        'string.base': 'Password must be a string',
        'string.empty': 'Password is required',
        'any.required': 'Password is required'
      })
  }),

  // 更新用户信息验证
  updateUser: Joi.object({
    username: Joi.string().min(3).max(30)
      .messages({
        'string.base': 'Username must be a string',
        'string.min': 'Username must be at least {#limit} characters long',
        'string.max': 'Username cannot exceed {#limit} characters'
      }),
    email: Joi.string().email()
      .messages({
        'string.base': 'Email must be a string',
        'string.email': 'Please provide a valid email'
      }),
    settings: Joi.object({
      theme: Joi.string().valid('light', 'dark'),
      language: Joi.string().valid('en', 'zh'),
      notifications: Joi.boolean()
    })
  })
};

// Prompt相关验证模式
const promptSchemas = {
  // 创建Prompt验证
  createPrompt: Joi.object({
    content: Joi.string().required()
      .messages({
        'string.base': 'Content must be a string',
        'string.empty': 'Content is required',
        'any.required': 'Content is required'
      }),
    response: Joi.string().allow('', null),
    platform: Joi.string().allow('', null),
    url: Joi.string().uri().allow('', null)
      .messages({
        'string.uri': 'URL must be a valid URI'
      }),
    tags: Joi.array().items(Joi.string()),
    favorite: Joi.boolean().default(false)
  }),

  // 更新Prompt验证
  updatePrompt: Joi.object({
    content: Joi.string()
      .messages({
        'string.base': 'Content must be a string'
      }),
    response: Joi.string().allow('', null),
    tags: Joi.array().items(Joi.string()),
    favorite: Joi.boolean()
  }),

  // 自动保存Prompt验证
  autoSavePrompt: Joi.object({
    content: Joi.string().required()
      .messages({
        'string.base': 'Content must be a string',
        'string.empty': 'Content is required',
        'any.required': 'Content is required'
      }),
    response: Joi.string().allow('', null),
    platform: Joi.string().required()
      .messages({
        'string.base': 'Platform must be a string',
        'string.empty': 'Platform is required',
        'any.required': 'Platform is required'
      }),
    url: Joi.string().uri().allow('', null)
      .messages({
        'string.uri': 'URL must be a valid URI'
      })
  }),

  // 批量获取Prompt验证
  batchPrompts: Joi.object({
    ids: Joi.array().items(
      Joi.string().pattern(/^[0-9a-fA-F]{24}$/)
        .messages({
          'string.pattern.base': 'ID must be a valid MongoDB ObjectId'
        })
    ).required()
      .messages({
        'array.base': 'IDs must be an array',
        'array.empty': 'IDs array cannot be empty',
        'any.required': 'IDs are required'
      })
  }),

  // 优化Prompt验证
  enhancePrompt: Joi.object({
    content: Joi.string().required()
      .messages({
        'string.base': 'Content must be a string',
        'string.empty': 'Content is required',
        'any.required': 'Content is required'
      })
  }),

  // 分页查询验证
  pagination: Joi.object({
    page: Joi.number().integer().min(1).default(1)
      .messages({
        'number.base': 'Page must be a number',
        'number.integer': 'Page must be an integer',
        'number.min': 'Page must be at least {#limit}'
      }),
    limit: Joi.number().integer().min(1).max(100).default(10)
      .messages({
        'number.base': 'Limit must be a number',
        'number.integer': 'Limit must be an integer',
        'number.min': 'Limit must be at least {#limit}',
        'number.max': 'Limit cannot exceed {#limit}'
      }),
    sort: Joi.string().default('-createdAt'),
    search: Joi.string().allow('', null),
    tag: Joi.string().allow('', null),
    favorite: Joi.boolean(),
    model: Joi.string().allow('', null),
    platform: Joi.string().allow('', null)
  })
};

// 标签相关验证模式
const tagSchemas = {
  // 创建标签验证
  createTag: Joi.object({
    name: Joi.string().required().max(30)
      .messages({
        'string.base': 'Name must be a string',
        'string.empty': 'Name is required',
        'string.max': 'Name cannot exceed {#limit} characters',
        'any.required': 'Name is required'
      }),
    color: Joi.string().pattern(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/).default('#3498db')
      .messages({
        'string.base': 'Color must be a string',
        'string.pattern.base': 'Color must be a valid hex color'
      })
  }),

  // 更新标签验证
  updateTag: Joi.object({
    name: Joi.string().max(30)
      .messages({
        'string.base': 'Name must be a string',
        'string.max': 'Name cannot exceed {#limit} characters'
      }),
    color: Joi.string().pattern(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/)
      .messages({
        'string.base': 'Color must be a string',
        'string.pattern.base': 'Color must be a valid hex color'
      })
  })
};

// 对话相关验证模式
const conversationSchemas = {
  // 创建对话验证
  createConversation: Joi.object({
    model: Joi.string().required()
      .messages({
        'string.base': 'Model must be a string',
        'string.empty': 'Model is required',
        'any.required': 'Model is required'
      }),
    title: Joi.string().allow('', null),
    messages: Joi.array().items(
      Joi.object({
        role: Joi.string().valid('user', 'assistant').required(),
        content: Joi.string().required()
      })
    ).default([]),
    tags: Joi.array().items(Joi.string()).default([])
  }),

  // 更新对话验证
  updateConversation: Joi.object({
    title: Joi.string().allow('', null),
    tags: Joi.array().items(Joi.string())
  }),

  // 添加消息验证
  addMessage: Joi.object({
    role: Joi.string().valid('user', 'assistant').required()
      .messages({
        'string.base': 'Role must be a string',
        'string.empty': 'Role is required',
        'any.only': 'Role must be either "user" or "assistant"',
        'any.required': 'Role is required'
      }),
    content: Joi.string().required()
      .messages({
        'string.base': 'Content must be a string',
        'string.empty': 'Content is required',
        'any.required': 'Content is required'
      })
  })
};

// 查询参数验证模式
const querySchemas = {
  // 分页查询验证
  pagination: Joi.object({
    page: Joi.number().integer().min(1).default(1)
      .messages({
        'number.base': 'Page must be a number',
        'number.integer': 'Page must be an integer',
        'number.min': 'Page must be at least {#limit}'
      }),
    limit: Joi.number().integer().min(1).max(100).default(10)
      .messages({
        'number.base': 'Limit must be a number',
        'number.integer': 'Limit must be an integer',
        'number.min': 'Limit must be at least {#limit}',
        'number.max': 'Limit cannot exceed {#limit}'
      }),
    sort: Joi.string().default('-createdAt'),
    search: Joi.string().allow('', null),
    tag: Joi.string().allow('', null),
    favorite: Joi.boolean()
  })
};

// ID参数验证模式
const idSchema = Joi.object({
  id: Joi.string().pattern(/^[0-9a-fA-F]{24}$/).required()
    .messages({
      'string.base': 'ID must be a string',
      'string.pattern.base': 'ID must be a valid MongoDB ObjectId',
      'any.required': 'ID is required'
    })
});

// 提示词优化相关验证模式
const optimizePrompt = Joi.object({
  content: Joi.string().required().messages({
    'string.empty': '提示词内容不能为空',
    'any.required': '提示词内容是必填项'
  }),
  category: Joi.string().valid('general', 'programming', 'writing', 'data_analysis', 'creative').messages({
    'string.valid': '类别必须是有效值'
  }),
  provider: Joi.string().valid('openai', 'deepseek', 'moonshot', 'custom').messages({
    'string.valid': '提供商必须是有效值'
  }),
  model: Joi.string(),
  useClientApi: Joi.boolean(),
  historyId: Joi.string().regex(/^[0-9a-fA-F]{24}$/).messages({
    'string.pattern.base': '历史ID格式无效'
  }),
  apiKey: Joi.string()
});

// 评价优化结果验证模式
const rateOptimization = Joi.object({
  rating: Joi.number().integer().min(1).max(5).required().messages({
    'number.base': '评分必须是数字',
    'number.integer': '评分必须是整数',
    'number.min': '评分最小为1',
    'number.max': '评分最大为5',
    'any.required': '评分是必填项'
  })
});

// API密钥管理验证模式
const manageApiKey = Joi.object({
  provider: Joi.string().valid('openai', 'deepseek', 'moonshot', 'custom').required().messages({
    'string.empty': '提供商不能为空',
    'string.valid': '提供商必须是有效值',
    'any.required': '提供商是必填项'
  }),
  apiKey: Joi.string().required().messages({
    'string.empty': 'API密钥不能为空',
    'any.required': 'API密钥是必填项'
  }),
  baseUrl: Joi.string().uri().when('provider', {
    is: 'custom',
    then: Joi.required(),
    otherwise: Joi.optional()
  }).messages({
    'string.uri': '基础URL必须是有效的URI',
    'any.required': '自定义提供商需要基础URL'
  }),
  modelName: Joi.string().when('provider', {
    is: 'custom',
    then: Joi.required(),
    otherwise: Joi.optional()
  }).messages({
    'any.required': '自定义提供商需要模型名称'
  })
});

module.exports = {
  userSchemas,
  promptSchemas,
  tagSchemas,
  conversationSchemas,
  querySchemas,
  idSchema,
  optimizePrompt,
  rateOptimization,
  manageApiKey
}; 