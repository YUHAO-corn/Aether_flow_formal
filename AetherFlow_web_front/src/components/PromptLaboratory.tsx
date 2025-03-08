import React, { useState } from 'react';
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
  HelpCircle
} from 'lucide-react';

const modelOptions = [
  { id: 'gpt-4', name: 'GPT-4 Turbo', description: 'Most capable model, best for complex tasks' },
  { id: 'gpt-3.5', name: 'GPT-3.5 Turbo', description: 'Fast and efficient for most tasks' },
  { id: 'claude-3', name: 'Claude 3 Opus', description: 'Excellent for creative and analytical tasks' },
  { id: 'llama-3', name: 'Llama 3', description: 'Open source model with strong capabilities' },
  { id: 'mistral', name: 'Mistral Large', description: 'Balanced performance and efficiency' },
];

const PromptLaboratory: React.FC = () => {
  const [selectedModel, setSelectedModel] = useState(modelOptions[0]);
  const [promptInput, setPromptInput] = useState('');
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [optimizedPrompt, setOptimizedPrompt] = useState('');
  const [conversation, setConversation] = useState<{role: string, content: string}[]>([]);
  const [isModelDropdownOpen, setIsModelDropdownOpen] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [showOptimizationPanel, setShowOptimizationPanel] = useState(false);
  
  const handleOptimizePrompt = () => {
    if (!promptInput.trim()) return;
    
    setIsOptimizing(true);
    
    // Simulate optimization process
    setTimeout(() => {
      const enhanced = `${promptInput}\n\nPlease provide a detailed response with examples. Format your answer using markdown with clear section headings and bullet points where appropriate. Include relevant technical details and practical applications.`;
      setOptimizedPrompt(enhanced);
      setShowOptimizationPanel(true);
      setIsOptimizing(false);
    }, 1500);
  };
  
  const handleSendMessage = () => {
    if (!promptInput.trim()) return;
    
    const userMessage = { role: 'user', content: promptInput };
    setConversation([...conversation, userMessage]);
    
    // Simulate AI response
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
  
  return (
    <div className={`flex-1 p-6 overflow-hidden flex flex-col ${isFullScreen ? 'fixed inset-0 z-50 bg-gray-900' : ''}`}>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold flex items-center">
          <Beaker className="mr-2 text-green-400" size={24} />
          Prompt Testing Laboratory
        </h1>
        
        <button 
          onClick={toggleFullScreen}
          className="p-2 rounded-lg hover:bg-gray-700 transition-colors duration-300"
        >
          {isFullScreen ? <Minimize2 size={20} /> : <Maximize2 size={20} />}
        </button>
      </div>
      
      <div className="flex-1 flex flex-col lg:flex-row gap-6 overflow-hidden">
        {/* Input Configuration Area */}
        <div className="w-full lg:w-1/3 flex flex-col">
          <div className="bg-gray-800 border border-gray-700 rounded-xl p-5 mb-6">
            <h2 className="font-medium mb-4">Model Selection</h2>
            
            <div className="relative">
              <button 
                onClick={() => setIsModelDropdownOpen(!isModelDropdownOpen)}
                className="w-full flex items-center justify-between bg-gray-700 border border-gray-600 rounded-lg p-3 hover:bg-gray-600 transition-colors duration-300"
              >
                <div className="flex items-center">
                  <div className="w-8 h-8 rounded-full bg-green-900/50 flex items-center justify-center mr-3">
                    <Sparkles size={16} className="text-green-400" />
                  </div>
                  <div className="text-left">
                    <p className="font-medium">{selectedModel.name}</p>
                    <p className="text-xs text-gray-400">{selectedModel.description}</p>
                  </div>
                </div>
                <ChevronDown size={20} className={`transition-transform duration-300 ${isModelDropdownOpen ? 'rotate-180' : ''}`} />
              </button>
              
              {isModelDropdownOpen && (
                <div className="absolute z-10 mt-2 w-full bg-gray-700 border border-gray-600 rounded-lg shadow-xl overflow-hidden">
                  {modelOptions.map(model => (
                    <button
                      key={model.id}
                      onClick={() => {
                        setSelectedModel(model);
                        setIsModelDropdownOpen(false);
                      }}
                      className={`w-full flex items-center p-3 hover:bg-gray-600 transition-colors duration-300 ${
                        selectedModel.id === model.id ? 'bg-gray-600' : ''
                      }`}
                    >
                      <div className="w-8 h-8 rounded-full bg-green-900/50 flex items-center justify-center mr-3">
                        <Sparkles size={16} className="text-green-400" />
                      </div>
                      <div className="text-left">
                        <p className="font-medium">{model.name}</p>
                        <p className="text-xs text-gray-400">{model.description}</p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
          
          <div className="bg-gray-800 border border-gray-700 rounded-xl p-5 flex-1 flex flex-col">
            <h2 className="font-medium mb-4">Prompt Input</h2>
            
            <div className="relative flex-1 flex flex-col">
              <textarea
                value={promptInput}
                onChange={(e) => setPromptInput(e.target.value)}
                placeholder="Enter your prompt here..."
                className="flex-1 bg-gray-700 border border-gray-600 rounded-lg p-4 resize-none focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-300"
              />
              
              <div className="mt-2 flex justify-between items-center text-sm text-gray-400">
                <span>{promptInput.length} characters</span>
                <button 
                  onClick={() => setPromptInput('')}
                  className="hover:text-gray-300 transition-colors duration-300"
                >
                  Clear
                </button>
              </div>
              
              <div className="mt-4 flex space-x-3">
                <button
                  onClick={handleOptimizePrompt}
                  disabled={!promptInput.trim() || isOptimizing}
                  className={`flex-1 py-2 rounded-lg flex items-center justify-center space-x-2 transition-all duration-300 ${
                    !promptInput.trim() || isOptimizing
                      ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                      : 'bg-green-600 hover:bg-green-700 text-white'
                  }`}
                >
                  {isOptimizing ? (
                    <>
                      <RefreshCw size={18} className="animate-spin" />
                      <span>Optimizing...</span>
                    </>
                  ) : (
                    <>
                      <Wand2 size={18} />
                      <span>Optimize Prompt</span>
                    </>
                  )}
                </button>
                
                <button
                  onClick={handleSendMessage}
                  disabled={!promptInput.trim()}
                  className={`flex-1 py-2 rounded-lg flex items-center justify-center space-x-2 transition-all duration-300 ${
                    !promptInput.trim()
                      ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                      : 'bg-blue-600 hover:bg-blue-700 text-white'
                  }`}
                >
                  <Send size={18} />
                  <span>Send</span>
                </button>
              </div>
            </div>
          </div>
        </div>
        
        {/* Middle Section - Optimization Panel or Testing Area */}
        <div className="w-full lg:w-2/3 flex flex-col">
          {showOptimizationPanel ? (
            <div className="bg-gray-800 border border-gray-700 rounded-xl p-5 flex-1 flex flex-col">
              <div className="flex justify-between items-center mb-4">
                <h2 className="font-medium flex items-center">
                  <Wand2 className="mr-2 text-green-400" size={18} />
                  Prompt Optimization
                </h2>
                <button 
                  onClick={() => setShowOptimizationPanel(false)}
                  className="text-gray-400 hover:text-white transition-colors duration-300"
                >
                  <X size={20} />
                </button>
              </div>
              
              <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className="flex flex-col">
                  <h3 className="text-sm font-medium text-gray-400 mb-2">Original Prompt</h3>
                  <div className="flex-1 bg-gray-700 border border-gray-600 rounded-lg p-4 overflow-auto">
                    <p className="whitespace-pre-wrap">{promptInput}</p>
                  </div>
                </div>
                
                <div className="flex flex-col">
                  <h3 className="text-sm font-medium text-gray-400 mb-2">Optimized Prompt</h3>
                  <div className="flex-1 bg-gray-700 border border-green-600/30 rounded-lg p-4 overflow-auto">
                    <p className="whitespace-pre-wrap">{optimizedPrompt}</p>
                  </div>
                </div>
              </div>
              
              <div className="mt-4 flex space-x-3">
                <button
                  onClick={handleUseOptimized}
                  className="flex-1 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg flex items-center justify-center space-x-2 transition-all duration-300"
                >
                  <Sparkles size={18} />
                  <span>Use Optimized</span>
                </button>
                
                <button
                  onClick={() => handleCopyPrompt(optimizedPrompt)}
                  className="flex-1 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg flex items-center justify-center space-x-2 transition-all duration-300"
                >
                  <Copy size={18} />
                  <span>Copy</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-gray-800 border border-gray-700 rounded-xl p-5 flex-1 flex flex-col">
              <h2 className="font-medium mb-4 flex items-center">
                <MessageSquare className="mr-2 text-blue-400" size={18} />
                Testing Area
              </h2>
              
              <div className="flex-1 bg-gray-700 border border-gray-600 rounded-lg p-4 overflow-auto">
                {conversation.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-gray-400">
                    <Beaker size={48} className="mb-4 text-gray-500" />
                    <p className="text-center mb-2">Your conversation will appear here</p>
                    <p className="text-center text-sm">Enter a prompt and click Send to start testing</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {conversation.map((message, index) => (
                      <div 
                        key={index}
                        className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div 
                          className={`max-w-3/4 rounded-lg p-3 ${
                            message.role === 'user' 
                              ? 'bg-blue-600 text-white' 
                              : 'bg-gray-600 text-white'
                          }`}
                        >
                          <p className="whitespace-pre-wrap">{message.content}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              
              <div className="mt-4 flex justify-between">
                <button
                  onClick={() => setConversation([])}
                  disabled={conversation.length === 0}
                  className={`px-4 py-2 rounded-lg flex items-center space-x-2 transition-all duration-300 ${
                    conversation.length === 0
                      ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                      : 'bg-gray-700 hover:bg-gray-600 text-white'
                  }`}
                >
                  <RefreshCw size={18} />
                  <span>Clear Conversation</span>
                </button>
                
                <button
                  onClick={() => {}}
                  disabled={conversation.length === 0}
                  className={`px-4 py-2 rounded-lg flex items-center space-x-2 transition-all duration-300 ${
                    conversation.length === 0
                      ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                      : 'bg-gray-700 hover:bg-gray-600 text-white'
                  }`}
                >
                  <Download size={18} />
                  <span>Save Conversation</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PromptLaboratory;