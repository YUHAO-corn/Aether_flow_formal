const Prompt = require('../models/Prompt');
const User = require('../models/User');
const { validatePromptInput } = require('../utils/validation');
const { handleError } = require('../utils/errorHandler');

/**
 * 自动保存提示词
 * @route POST /api/prompts/auto-save
 * @access Private
 */
exports.autoSavePrompt = async (req, res) => {
  try {
    const { content, response, platform, url } = req.body;
    
    // 验证输入
    if (!content || content.trim().length < 10) {
      return res.status(400).json({
        success: false,
        error: '提示词内容太短或为空'
      });
    }
    
    // 获取用户ID
    const userId = req.user.id;
    
    // 检查是否已存在相同内容的提示词（防止重复保存）
    const existingPrompt = await Prompt.findOne({
      user: userId,
      content: content,
      createdAt: { $gt: new Date(Date.now() - 24 * 60 * 60 * 1000) } // 24小时内
    });
    
    if (existingPrompt) {
      return res.status(200).json({
        success: true,
        message: '提示词已存在',
        prompt: existingPrompt
      });
    }
    
    // 创建新提示词
    const newPrompt = new Prompt({
      user: userId,
      title: content.substring(0, 50) + (content.length > 50 ? '...' : ''),
      content: content,
      response: response || '',
      tags: ['auto-saved'],
      source: {
        platform: platform || 'Unknown',
        url: url || ''
      },
      isAutoSaved: true
    });
    
    // 保存到数据库
    await newPrompt.save();
    
    // 更新用户的提示词计数
    await User.findByIdAndUpdate(userId, { $inc: { promptCount: 1 } });
    
    res.status(201).json({
      success: true,
      message: '提示词已自动保存',
      prompt: newPrompt
    });
  } catch (error) {
    handleError(res, error, '自动保存提示词失败');
  }
}; 