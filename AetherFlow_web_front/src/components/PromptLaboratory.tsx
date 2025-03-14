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
  Settings,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { apiClient } from '../utils/apiClient';
import { ApiResponse } from '../utils/apiClient';
import { autoSavePrompt } from '../utils/autoSavePrompt';
import { AnimatePresence, motion } from 'framer-motion';

const modelOptions = [
  { id: 'gpt-4', name: 'GPT-4 Turbo', description: 'Most capable model, best for complex tasks' },
  { id: 'gpt-3.5', name: 'GPT-3.5 Turbo', description: 'Fast and efficient for most tasks' },
  { id: 'claude-3', name: 'Claude 3 Opus', description: 'Excellent for creative and analytical tasks' },
  { id: 'llama-3', name: 'Llama 3', description: 'Open source model with strong capabilities' },
  { id: 'mistral', name: 'Mistral Large', description: 'Balanced performance and efficiency' },
];

interface OptimizationResult {
  optimizedPrompt: string;
  improvements: string;
  expectedBenefits: string;
  provider: string;
  model: string;
  historyId: string;
}

const PromptLaboratory: React.FC = () => {
  const [selectedModel, setSelectedModel] = useState(modelOptions[0]);
  const [promptInput, setPromptInput] = useState('');
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [optimizedPrompt, setOptimizedPrompt] = useState('');
  const [optimizationDetails, setOptimizationDetails] = useState<OptimizationResult | null>(null);
  const [conversation, setConversation] = useState<{role: string, content: string}[]>([]);
  const [isModelDropdownOpen, setIsModelDropdownOpen] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [showOptimizationPanel, setShowOptimizationPanel] = useState(false);
  const [optimizationError, setOptimizationError] = useState('');
  const [autoSaveEnabled, setAutoSaveEnabled] = useState(true);
  const [autoSaveStatus, setAutoSaveStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');
  const [apiKeyModalOpen, setApiKeyModalOpen] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const [provider, setProvider] = useState('openai');
  
  // 自动保存提示词
  useEffect(() => {
    if (!autoSaveEnabled || !promptInput || promptInput.trim().length < 10) return;
    
    const savePrompt = async () => {
      try {
        setAutoSaveStatus('saving');
        
        const result = await autoSavePrompt({
          content: promptInput,
          platform: 'PromptLaboratory',
          response: ''
        });
        
        if (result) {
          setAutoSaveStatus('success');
          setTimeout(() => setAutoSaveStatus('idle'), 2000);
        } else {
          throw new Error('自动保存失败');
        }
      } catch (error) {
        console.error('自动保存提示词失败:', error);
        setAutoSaveStatus('error');
        setTimeout(() => setAutoSaveStatus('idle'), 3000);
      }
    };
    
    // 使用防抖，避免频繁保存
    const debounceTimer = setTimeout(savePrompt, 2000);
    
    return () => clearTimeout(debounceTimer);
  }, [promptInput, autoSaveEnabled]);
  
  const handleOptimizePrompt = async () => {
    if (!promptInput.trim()) return;
    
    setIsOptimizing(true);
    setOptimizationError('');
    
    try {
      // 调用后端API优化提示词
      const response = await apiClient.post<ApiResponse<OptimizationResult>>('/prompts/optimize', {
        content: promptInput,
        provider: provider,
        model: selectedModel.id,
        category: 'general',
        apiKey: apiKey || undefined
      });
      
      if (response && response.data) {
        const result = response.data;
        setOptimizedPrompt(result.optimizedPrompt);
        setOptimizationDetails(result);
        setShowOptimizationPanel(true);
        
        // 记录优化活动
        try {
          await apiClient.post('/activities', {
            action: 'optimize_prompt',
            entityType: 'prompt',
            details: {
              originalLength: promptInput.length,
              optimizedLength: result.optimizedPrompt.length,
              model: selectedModel.id
            }
          });
        } catch (error) {
          console.error('记录活动失败:', error);
        }
      } else {
        throw new Error('优化请求返回了无效的响应');
      }
    } catch (error) {
      console.error('优化提示词失败:', error);
      setOptimizationError('优化提示词失败，请稍后重试');
    } finally {
      setIsOptimizing(false);
    }
  };
  
  const handleSendMessage = async () => {
    if (!promptInput.trim()) return;
    
    const userMessage = { role: 'user', content: promptInput };
    setConversation([...conversation, userMessage]);
    
    // 在实际应用中，这里应该调用后端API发送消息
    // 这里使用模拟响应
    setTimeout(() => {
      const aiResponse = { 
        role: 'assistant', 
        content: `I've analyzed your prompt: "${promptInput}"\n\nHere's my response based on your request. This is a simulated response in the laboratory environment. In a real scenario, the AI would generate content based on your specific prompt.\n\nWould you like me to help you optimize this prompt further?` 
      };
      setConversation(prev => [...prev, aiResponse]);
      setPromptInput('');
    }, 1000);
  };
  
  const handleUseOptimized = () => {
    setPromptInput(optimizedPrompt);
    setShowOptimizationPanel(false);
  };
  
  const handleCopyPrompt = (text: string) => {
    navigator.clipboard.writeText(text);
  };
  
  const toggleFullScreen = () => {
    setIsFullScreen(!isFullScreen);
  };

  const handleSaveOptimizedPrompt = async () => {
    if (!optimizedPrompt) return;
    
    try {
      // 调用后端API保存优化后的提示词
      await apiClient.post('/prompts', {
        content: optimizedPrompt,
        response: '',
        platform: 'PromptLaboratory',
        tags: []
      });
      
      alert('提示词已保存');
    } catch (error) {
      console.error('保存提示词失败:', error);
      alert('保存提示词失败，请稍后重试');
    }
  };
  
  // 渲染自动保存状态指示器
  const renderAutoSaveStatus = () => {
    switch (autoSaveStatus) {
      case 'saving':
        return (
          <div className="flex items-center text-yellow-400 text-xs">
            <RefreshCw size={12} className="animate-spin mr-1" />
            <span>保存中...</span>
          </div>
        );
      case 'success':
        return (
          <div className="flex items-center text-green-400 text-xs">
            <CheckCircle size={12} className="mr-1" />
            <span>已保存</span>
          </div>
        );
      case 'error':
        return (
          <div className="flex items-center text-red-400 text-xs">
            <XCircle size={12} className="mr-1" />
            <span>保存失败</span>
          </div>
        );
      default:
        return autoSaveEnabled ? (
          <div className="flex items-center text-gray-400 text-xs">
            <Save size={12} className="mr-1" />
            <span>自动保存已启用</span>
          </div>
        ) : null;
    }
  };
  
  // API密钥设置模态框
  const renderApiKeyModal = () => {
    return (
      <AnimatePresence>
        {apiKeyModalOpen && (
          <motion.div
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-gray-800 rounded-xl p-6 w-full max-w-md"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
            >
              <h2 className="text-xl font-semibold mb-4">API密钥设置</h2>
              
              <div className="mb-4">
                <label className="block text-sm text-gray-400 mb-1">提供商</label>
                <select
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg p-2"
                  value={provider}
                  onChange={(e) => setProvider(e.target.value)}
                >
                  <option value="openai">OpenAI</option>
                  <option value="deepseek">DeepSeek</option>
                  <option value="moonshot">Moonshot</option>
                  <option value="custom">自定义</option>
                </select>
              </div>
              
              <div className="mb-6">
                <label className="block text-sm text-gray-400 mb-1">API密钥</label>
                <input
                  type="password"
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg p-2"
                  placeholder="输入您的API密钥"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                />
                <p className="text-xs text-gray-500 mt-1">
                  您的API密钥仅在本地使用，不会发送到我们的服务器
                </p>
              </div>
              
              <div className="flex justify-end space-x-3">
                <button
                  className="px-4 py-2 rounded-lg bg-gray-700 hover:bg-gray-600"
                  onClick={() => setApiKeyModalOpen(false)}
                >
                  取消
                </button>
                <button
                  className="px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-500"
                  onClick={() => {
                    // 保存API密钥到本地存储
                    localStorage.setItem('promptlab_api_key', apiKey);
                    localStorage.setItem('promptlab_provider', provider);
                    setApiKeyModalOpen(false);
                  }}
                >
                  保存
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    );
  };
  
  // 加载保存的API密钥
  useEffect(() => {
    const savedApiKey = localStorage.getItem('promptlab_api_key');
    const savedProvider = localStorage.getItem('promptlab_provider');
    
    if (savedApiKey) setApiKey(savedApiKey);
    if (savedProvider) setProvider(savedProvider);
  }, []);
  
  return (
    <div className={`flex-1 p-6 overflow-hidden flex flex-col ${isFullScreen ? 'fixed inset-0 z-50 bg-gray-900' : ''}`}>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold flex items-center">
          <Beaker className="mr-2 text-green-400" size={24} />
          提示词测试实验室
        </h1>
        
        <div className="flex items-center space-x-2">
          {renderAutoSaveStatus()}
          
          <button 
            onClick={() => setApiKeyModalOpen(true)}
            className="p-2 rounded-lg hover:bg-gray-700 transition-colors duration-300"
            title="API密钥设置"
          >
            <Settings size={20} />
          </button>
          
          <button 
            onClick={toggleFullScreen}
            className="p-2 rounded-lg hover:bg-gray-700 transition-colors duration-300"
            title={isFullScreen ? "退出全屏" : "全屏模式"}
          >
            {isFullScreen ? <Minimize2 size={20} /> : <Maximize2 size={20} />}
          </button>
        </div>
      </div>
      
      <div className="flex-1 flex flex-col lg:flex-row gap-6 overflow-hidden">
        {/* Input Configuration Area */}
        <div className="w-full lg:w-1/3 flex flex-col">
          <div className="bg-gray-800 border border-gray-700 rounded-xl p-5 mb-6">
            <h2 className="font-medium mb-4">模型选择</h2>
            <div className="relative">
              <button
                onClick={() => setIsModelDropdownOpen(!isModelDropdownOpen)}
                className="w-full flex items-center justify-between bg-gray-700 border border-gray-600 rounded-lg p-3 text-left"
              >
                <div>
                  <div className="font-medium">{selectedModel.name}</div>
                  <div className="text-xs text-gray-400">{selectedModel.description}</div>
                </div>
                <ChevronDown size={18} className={`transition-transform ${isModelDropdownOpen ? 'rotate-180' : ''}`} />
              </button>
              
              {isModelDropdownOpen && (
                <div className="absolute z-10 mt-1 w-full bg-gray-700 border border-gray-600 rounded-lg shadow-lg overflow-hidden">
                  {modelOptions.map(model => (
                    <div
                      key={model.id}
                      className={`p-3 cursor-pointer hover:bg-gray-600 border-b border-gray-600 last:border-0 ${selectedModel.id === model.id ? 'bg-gray-600' : ''}`}
                      onClick={() => {
                        setSelectedModel(model);
                        setIsModelDropdownOpen(false);
                      }}
                    >
                      <div className="font-medium">{model.name}</div>
                      <div className="text-xs text-gray-400">{model.description}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          
          <div className="bg-gray-800 border border-gray-700 rounded-xl p-5 flex-1 flex flex-col">
            <h2 className="font-medium mb-4">提示词输入</h2>
            <textarea
              className="flex-1 bg-gray-700 border border-gray-600 rounded-lg p-4 text-gray-100 resize-none min-h-[200px]"
              placeholder="输入你的提示词..."
              value={promptInput}
              onChange={(e) => setPromptInput(e.target.value)}
            ></textarea>
            
            <div className="flex mt-4 space-x-2">
              <button
                onClick={handleOptimizePrompt}
                disabled={isOptimizing || !promptInput.trim()}
                className={`flex-1 flex items-center justify-center space-x-2 py-2 px-4 rounded-lg ${
                  isOptimizing || !promptInput.trim() ? 'bg-gray-600 cursor-not-allowed' : 'bg-purple-600 hover:bg-purple-500'
                }`}
              >
                {isOptimizing ? (
                  <>
                    <RefreshCw size={18} className="animate-spin" />
                    <span>优化中...</span>
                  </>
                ) : (
                  <>
                    <Wand2 size={18} />
                    <span>优化提示词</span>
                  </>
                )}
              </button>
              
              <button
                onClick={handleSendMessage}
                disabled={!promptInput.trim()}
                className={`flex-1 flex items-center justify-center space-x-2 py-2 px-4 rounded-lg ${
                  !promptInput.trim() ? 'bg-gray-600 cursor-not-allowed' : 'bg-green-600 hover:bg-green-500'
                }`}
              >
                <Send size={18} />
                <span>发送</span>
              </button>
            </div>
            
            {optimizationError && (
              <div className="mt-4 p-3 bg-red-900/30 border border-red-800 rounded-lg text-red-300 text-sm">
                {optimizationError}
              </div>
            )}
          </div>
        </div>
        
        {/* Output Area */}
        <div className="w-full lg:w-2/3 flex flex-col">
          {showOptimizationPanel && optimizationDetails ? (
            <div className="bg-gray-800 border border-gray-700 rounded-xl p-5 mb-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="font-medium flex items-center">
                  <Sparkles className="mr-2 text-purple-400" size={18} />
                  优化结果
                </h2>
                
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleCopyPrompt(optimizedPrompt)}
                    className="p-2 rounded-lg hover:bg-gray-700"
                    title="复制"
                  >
                    <Copy size={16} />
                  </button>
                  
                  <button
                    onClick={handleSaveOptimizedPrompt}
                    className="p-2 rounded-lg hover:bg-gray-700"
                    title="保存"
                  >
                    <Save size={16} />
                  </button>
                  
                  <button
                    onClick={handleUseOptimized}
                    className="px-3 py-1 bg-purple-600 hover:bg-purple-500 rounded-lg text-sm"
                  >
                    使用此版本
                  </button>
                </div>
              </div>
              
              <div className="mb-4">
                <div className="text-xs text-gray-400 mb-1">优化后的提示词</div>
                <div className="bg-gray-700 border border-gray-600 rounded-lg p-4 whitespace-pre-wrap">
                  {optimizedPrompt}
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <div className="text-xs text-gray-400 mb-1">改进点</div>
                  <div className="bg-gray-700 border border-gray-600 rounded-lg p-4 h-32 overflow-y-auto whitespace-pre-wrap">
                    {optimizationDetails.improvements}
                  </div>
                </div>
                
                <div>
                  <div className="text-xs text-gray-400 mb-1">预期收益</div>
                  <div className="bg-gray-700 border border-gray-600 rounded-lg p-4 h-32 overflow-y-auto whitespace-pre-wrap">
                    {optimizationDetails.expectedBenefits}
                  </div>
                </div>
              </div>
              
              <div className="flex justify-between text-xs text-gray-400">
                <div>提供者: {optimizationDetails.provider}</div>
                <div>模型: {optimizationDetails.model}</div>
              </div>
            </div>
          ) : null}
          
          <div className="bg-gray-800 border border-gray-700 rounded-xl p-5 flex-1 flex flex-col">
            <h2 className="font-medium mb-4 flex items-center">
              <MessageSquare className="mr-2 text-blue-400" size={18} />
              对话测试
            </h2>
            
            <div className="flex-1 overflow-y-auto mb-4 space-y-4">
              {conversation.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-gray-400">
                  <HelpCircle size={48} className="mb-2 opacity-50" />
                  <p>输入提示词并点击发送开始对话</p>
                </div>
              ) : (
                conversation.map((message, index) => (
                  <div
                    key={index}
                    className={`p-4 rounded-lg max-w-[80%] ${
                      message.role === 'user'
                        ? 'bg-blue-800/30 border border-blue-700 ml-auto'
                        : 'bg-gray-700 border border-gray-600'
                    }`}
                  >
                    <div className="text-xs text-gray-400 mb-1">
                      {message.role === 'user' ? '你' : '助手'}
                    </div>
                    <div className="whitespace-pre-wrap">{message.content}</div>
                  </div>
                ))
              )}
            </div>
            
            <div className="flex items-center space-x-2">
              <textarea
                className="flex-1 bg-gray-700 border border-gray-600 rounded-lg p-3 text-gray-100 resize-none h-12 min-h-0"
                placeholder="输入消息..."
                value={promptInput}
                onChange={(e) => setPromptInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
              ></textarea>
              
              <button
                onClick={handleSendMessage}
                disabled={!promptInput.trim()}
                className={`p-3 rounded-lg ${
                  !promptInput.trim() ? 'bg-gray-600 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-500'
                }`}
              >
                <Send size={18} />
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* 添加API密钥设置模态框 */}
      {renderApiKeyModal()}
    </div>
  );
};

export default PromptLaboratory;