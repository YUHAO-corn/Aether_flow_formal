import React, { useState, useEffect } from 'react';
import { 
  Beaker, 
  Wand2, 
  Save, 
  Copy, 
  ChevronDown, 
  MessageSquare,
  Send,
  RefreshCw,
  Sparkles,
  Download,
  Maximize2,
  Minimize2,
  HelpCircle,
  Star,
  AlertCircle,
  X
} from 'lucide-react';
import apiClient from '../api';
import { useAuth } from '../contexts/AuthContext';

// 定义模型选项
const modelOptions = [
  { id: 'gpt-4', name: 'GPT-4 Turbo', provider: 'openai', description: 'Most capable model, best for complex tasks' },
  { id: 'gpt-3.5-turbo', name: 'GPT-3.5 Turbo', provider: 'openai', description: 'Fast and efficient for most tasks' },
  { id: 'claude-3-opus', name: 'Claude 3 Opus', provider: 'anthropic', description: 'Excellent for creative and analytical tasks' },
  { id: 'deepseek-chat', name: 'DeepSeek Chat', provider: 'deepseek', description: 'Strong reasoning and coding capabilities' },
  { id: 'moonshot-v1-8k', name: 'Moonshot V1', provider: 'moonshot', description: 'Balanced performance and efficiency' },
];

const PromptLaboratory: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const [selectedModel, setSelectedModel] = useState(modelOptions[0]);
  const [promptInput, setPromptInput] = useState('');
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [optimizedPrompt, setOptimizedPrompt] = useState('');
  const [optimizationId, setOptimizationId] = useState<string | null>(null);
  const [conversation, setConversation] = useState<{role: string, content: string}[]>([]);
  const [isModelDropdownOpen, setIsModelDropdownOpen] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [showOptimizationPanel, setShowOptimizationPanel] = useState(false);
  const [apiKeys, setApiKeys] = useState<any[]>([]);
  const [optimizationHistory, setOptimizationHistory] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [rating, setRating] = useState<number | null>(null);
  const [feedback, setFeedback] = useState('');
  const [isSubmittingRating, setIsSubmittingRating] = useState(false);
  
  // 获取API密钥和优化历史
  useEffect(() => {
    if (isAuthenticated) {
      fetchApiKeys();
      fetchOptimizationHistory();
    }
  }, [isAuthenticated]);
  
  // 获取API密钥
  const fetchApiKeys = async () => {
    try {
      const response = await apiClient.optimization.getApiKeys();
      if (response.success) {
        setApiKeys(response.data.apiKeys);
      }
    } catch (err) {
      console.error('获取API密钥失败:', err);
    }
  };
  
  // 获取优化历史
  const fetchOptimizationHistory = async () => {
    try {
      const response = await apiClient.optimization.getHistory({ limit: 5 });
      if (response.success) {
        setOptimizationHistory(response.data.history);
      }
    } catch (err) {
      console.error('获取优化历史失败:', err);
    }
  };
  
  // 优化提示词
  const handleOptimizePrompt = async () => {
    if (!promptInput.trim()) {
      setError('请输入提示词内容');
      return;
    }
    
    setIsOptimizing(true);
    setError(null);
    
    try {
      const response = await apiClient.optimization.optimize({
        prompt: promptInput,
        provider: selectedModel.provider,
        model: selectedModel.id
      });
      
      if (response.success) {
        setOptimizedPrompt(response.data.optimizedPrompt);
        setOptimizationId(response.data.optimizationId);
        setShowOptimizationPanel(true);
        
        // 刷新优化历史
        fetchOptimizationHistory();
      } else {
        setError(response.error?.message || '优化失败，请稍后重试');
      }
    } catch (err: any) {
      setError(err.message || '优化失败，请稍后重试');
    } finally {
      setIsOptimizing(false);
    }
  };
  
  // 发送消息到对话
  const handleSendMessage = async () => {
    if (!promptInput.trim()) return;
    
    // 添加用户消息到对话
    const userMessage = { role: 'user', content: promptInput };
    setConversation([...conversation, userMessage]);
    
    // 清空输入框
    setPromptInput('');
    
    // 模拟AI响应
    setTimeout(() => {
      const aiResponse = { 
        role: 'assistant', 
        content: `这是对"${userMessage.content}"的模拟响应。在实际应用中，这里将显示AI模型的真实回答。` 
      };
      setConversation(prev => [...prev, aiResponse]);
    }, 1000);
  };
  
  // 使用优化后的提示词
  const handleUseOptimized = () => {
    setPromptInput(optimizedPrompt);
    setShowOptimizationPanel(false);
  };
  
  // 复制提示词
  const handleCopyPrompt = (text: string) => {
    navigator.clipboard.writeText(text);
    // 可以添加一个复制成功的提示
  };
  
  // 切换全屏模式
  const toggleFullScreen = () => {
    setIsFullScreen(!isFullScreen);
  };
  
  // 提交评分
  const handleSubmitRating = async () => {
    if (!optimizationId || rating === null) return;
    
    setIsSubmittingRating(true);
    
    try {
      const response = await apiClient.optimization.rateOptimization(optimizationId, {
        score: rating,
        feedback
      });
      
      if (response.success) {
        // 重置评分状态
        setRating(null);
        setFeedback('');
        
        // 刷新优化历史
        fetchOptimizationHistory();
      }
    } catch (err) {
      console.error('提交评分失败:', err);
    } finally {
      setIsSubmittingRating(false);
    }
  };
  
  // 继续优化
  const handleContinueOptimization = async () => {
    if (!optimizationId) return;
    
    setIsOptimizing(true);
    setError(null);
    
    try {
      const response = await apiClient.optimization.optimize({
        prompt: optimizedPrompt,
        provider: selectedModel.provider,
        model: selectedModel.id,
        previousOptimizationId: optimizationId
      });
      
      if (response.success) {
        setOptimizedPrompt(response.data.optimizedPrompt);
        setOptimizationId(response.data.optimizationId);
        
        // 刷新优化历史
        fetchOptimizationHistory();
      } else {
        setError(response.error?.message || '优化失败，请稍后重试');
      }
    } catch (err: any) {
      setError(err.message || '优化失败，请稍后重试');
    } finally {
      setIsOptimizing(false);
    }
  };
  
  // 渲染函数
  return (
    <div className={`bg-gray-900 text-white rounded-lg overflow-hidden transition-all duration-300 ${isFullScreen ? 'fixed inset-0 z-50' : 'relative'}`}>
      {/* 标题栏 */}
      <div className="flex items-center justify-between bg-gray-800 px-4 py-3 border-b border-gray-700">
        <div className="flex items-center space-x-2">
          <Beaker className="h-5 w-5 text-purple-400" />
          <h2 className="text-lg font-semibold">提示词实验室</h2>
        </div>
        <div className="flex items-center space-x-2">
          <button 
            onClick={toggleFullScreen}
            className="p-1 rounded hover:bg-gray-700 transition-colors"
            aria-label={isFullScreen ? "退出全屏" : "全屏模式"}
          >
            {isFullScreen ? <Minimize2 className="h-5 w-5" /> : <Maximize2 className="h-5 w-5" />}
          </button>
          <button 
            className="p-1 rounded hover:bg-gray-700 transition-colors"
            aria-label="帮助"
          >
            <HelpCircle className="h-5 w-5" />
          </button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 h-[calc(100%-60px)]">
        {/* 左侧面板：提示词输入和优化 */}
        <div className="flex flex-col h-full">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-medium flex items-center">
              <Wand2 className="h-5 w-5 mr-2 text-purple-400" />
              提示词优化
            </h3>
            
            {/* 模型选择下拉菜单 */}
            <div className="relative">
              <button 
                onClick={() => setIsModelDropdownOpen(!isModelDropdownOpen)}
                className="flex items-center space-x-1 bg-gray-800 hover:bg-gray-700 px-3 py-1.5 rounded-md transition-colors"
              >
                <span>{selectedModel.name}</span>
                <ChevronDown className="h-4 w-4" />
              </button>
              
              {isModelDropdownOpen && (
                <div className="absolute right-0 mt-1 w-64 bg-gray-800 border border-gray-700 rounded-md shadow-lg z-10">
                  <ul>
                    {modelOptions.map(model => (
                      <li 
                        key={model.id}
                        className="px-4 py-2 hover:bg-gray-700 cursor-pointer"
                        onClick={() => {
                          setSelectedModel(model);
                          setIsModelDropdownOpen(false);
                        }}
                      >
                        <div className="font-medium">{model.name}</div>
                        <div className="text-xs text-gray-400">{model.description}</div>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
          
          {/* API密钥状态 */}
          <div className="mb-4 p-3 bg-gray-800 rounded-md">
            <h4 className="text-sm font-medium mb-2">API密钥状态</h4>
            <div className="space-y-2">
              {apiKeys.length > 0 ? (
                apiKeys.map(key => (
                  <div key={key._id} className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-2 h-2 rounded-full bg-green-500 mr-2"></div>
                      <span>{key.provider} - {key.name || '默认密钥'}</span>
                    </div>
                    <span className="text-xs text-gray-400">已配置</span>
                  </div>
                ))
              ) : (
                <div className="flex items-center text-yellow-400">
                  <AlertCircle className="h-4 w-4 mr-2" />
                  <span className="text-sm">未配置API密钥，将使用系统默认密钥</span>
                </div>
              )}
            </div>
          </div>
          
          {/* 提示词输入区域 */}
          <div className="flex-grow relative">
            <textarea
              value={promptInput}
              onChange={(e) => setPromptInput(e.target.value)}
              placeholder="输入你的提示词，点击优化按钮获取增强版本..."
              className="w-full h-full min-h-[200px] p-3 bg-gray-800 rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
            
            {/* 错误提示 */}
            {error && (
              <div className="mt-2 text-red-400 text-sm flex items-center">
                <AlertCircle className="h-4 w-4 mr-1" />
                {error}
              </div>
            )}
            
            {/* 操作按钮 */}
            <div className="mt-4 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <button
                  onClick={handleOptimizePrompt}
                  disabled={isOptimizing || !promptInput.trim()}
                  className={`flex items-center space-x-1 px-4 py-2 rounded-md ${
                    isOptimizing || !promptInput.trim() 
                      ? 'bg-gray-700 text-gray-400 cursor-not-allowed' 
                      : 'bg-purple-600 hover:bg-purple-700 transition-colors'
                  }`}
                >
                  {isOptimizing ? (
                    <>
                      <RefreshCw className="h-4 w-4 animate-spin" />
                      <span>优化中...</span>
                    </>
                  ) : (
                    <>
                      <Wand2 className="h-4 w-4" />
                      <span>优化提示词</span>
                    </>
                  )}
                </button>
                
                <button
                  onClick={() => handleCopyPrompt(promptInput)}
                  disabled={!promptInput.trim()}
                  className="p-2 rounded-md bg-gray-800 hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  title="复制提示词"
                >
                  <Copy className="h-4 w-4" />
                </button>
              </div>
              
              <button
                onClick={handleSendMessage}
                disabled={!promptInput.trim()}
                className={`flex items-center space-x-1 px-4 py-2 rounded-md ${
                  !promptInput.trim() 
                    ? 'bg-gray-700 text-gray-400 cursor-not-allowed' 
                    : 'bg-blue-600 hover:bg-blue-700 transition-colors'
                }`}
              >
                <Send className="h-4 w-4" />
                <span>发送到对话</span>
              </button>
            </div>
          </div>
        </div>
        
        {/* 右侧面板：优化结果或对话 */}
        <div className="flex flex-col h-full">
          {showOptimizationPanel ? (
            /* 优化结果面板 */
            <div className="flex flex-col h-full">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-lg font-medium flex items-center">
                  <Sparkles className="h-5 w-5 mr-2 text-yellow-400" />
                  优化结果
                </h3>
                
                <button
                  onClick={() => setShowOptimizationPanel(false)}
                  className="text-sm text-gray-400 hover:text-white transition-colors"
                >
                  切换到对话
                </button>
              </div>
              
              {/* 优化结果显示区域 */}
              <div className="flex-grow relative">
                <div className="w-full h-full min-h-[200px] p-3 bg-gray-800 rounded-md overflow-auto">
                  <pre className="whitespace-pre-wrap font-sans">{optimizedPrompt}</pre>
                </div>
                
                {/* 评分区域 */}
                {optimizationId && (
                  <div className="mt-4 p-3 bg-gray-800 rounded-md">
                    <h4 className="text-sm font-medium mb-2">为优化结果评分</h4>
                    <div className="flex items-center space-x-1 mb-2">
                      {[1, 2, 3, 4, 5].map(star => (
                        <button
                          key={star}
                          onClick={() => setRating(star)}
                          className={`p-1 ${rating && rating >= star ? 'text-yellow-400' : 'text-gray-500'}`}
                        >
                          <Star className="h-5 w-5" />
                        </button>
                      ))}
                    </div>
                    <textarea
                      value={feedback}
                      onChange={(e) => setFeedback(e.target.value)}
                      placeholder="添加反馈意见（可选）..."
                      className="w-full p-2 bg-gray-700 rounded-md resize-none focus:outline-none focus:ring-1 focus:ring-purple-500 text-sm"
                      rows={2}
                    />
                    <button
                      onClick={handleSubmitRating}
                      disabled={rating === null || isSubmittingRating}
                      className={`mt-2 px-3 py-1 rounded-md text-sm ${
                        rating === null || isSubmittingRating
                          ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                          : 'bg-purple-600 hover:bg-purple-700 transition-colors'
                      }`}
                    >
                      {isSubmittingRating ? '提交中...' : '提交评分'}
                    </button>
                  </div>
                )}
                
                {/* 操作按钮 */}
                <div className="mt-4 flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={handleContinueOptimization}
                      disabled={isOptimizing || !optimizedPrompt}
                      className={`flex items-center space-x-1 px-4 py-2 rounded-md ${
                        isOptimizing || !optimizedPrompt
                          ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                          : 'bg-purple-600 hover:bg-purple-700 transition-colors'
                      }`}
                    >
                      {isOptimizing ? (
                        <>
                          <RefreshCw className="h-4 w-4 animate-spin" />
                          <span>优化中...</span>
                        </>
                      ) : (
                        <>
                          <Wand2 className="h-4 w-4" />
                          <span>继续优化</span>
                        </>
                      )}
                    </button>
                    
                    <button
                      onClick={() => handleCopyPrompt(optimizedPrompt)}
                      className="p-2 rounded-md bg-gray-800 hover:bg-gray-700 transition-colors"
                      title="复制优化结果"
                    >
                      <Copy className="h-4 w-4" />
                    </button>
                  </div>
                  
                  <button
                    onClick={handleUseOptimized}
                    className="flex items-center space-x-1 px-4 py-2 rounded-md bg-blue-600 hover:bg-blue-700 transition-colors"
                  >
                    <Send className="h-4 w-4" />
                    <span>使用此结果</span>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            /* 对话面板 */
            <div className="flex flex-col h-full">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-lg font-medium flex items-center">
                  <MessageSquare className="h-5 w-5 mr-2 text-blue-400" />
                  对话测试
                </h3>
                
                {optimizedPrompt && (
                  <button
                    onClick={() => setShowOptimizationPanel(true)}
                    className="text-sm text-gray-400 hover:text-white transition-colors"
                  >
                    查看优化结果
                  </button>
                )}
              </div>
              
              {/* 对话显示区域 */}
              <div className="flex-grow bg-gray-800 rounded-md p-3 overflow-auto">
                {conversation.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-gray-400">
                    <MessageSquare className="h-10 w-10 mb-2" />
                    <p>发送消息开始对话测试</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {conversation.map((message, index) => (
                      <div 
                        key={index} 
                        className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div 
                          className={`max-w-[80%] rounded-lg p-3 ${
                            message.role === 'user' 
                              ? 'bg-blue-600 text-white' 
                              : 'bg-gray-700 text-white'
                          }`}
                        >
                          {message.content}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              
              {/* 优化历史 */}
              {optimizationHistory.length > 0 && (
                <div className="mt-4">
                  <h4 className="text-sm font-medium mb-2">最近优化历史</h4>
                  <div className="space-y-2">
                    {optimizationHistory.map(history => (
                      <div 
                        key={history._id}
                        className="p-2 bg-gray-800 rounded-md cursor-pointer hover:bg-gray-700 transition-colors"
                        onClick={() => {
                          setPromptInput(history.originalPrompt);
                        }}
                      >
                        <div className="text-sm truncate">{history.originalPrompt}</div>
                        <div className="flex items-center justify-between mt-1">
                          <span className="text-xs text-gray-400">
                            {new Date(history.createdAt).toLocaleString()}
                          </span>
                          {history.rating && (
                            <div className="flex items-center">
                              {Array.from({ length: history.rating }).map((_, i) => (
                                <Star key={i} className="h-3 w-3 text-yellow-400" />
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default PromptLaboratory;