import React, { useState, useEffect } from 'react';
import { 
  Search, 
  SlidersHorizontal, 
  Clock, 
  Star, 
  StarOff, 
  Copy, 
  Sparkles, 
  Zap, 
  BarChart2, 
  Beaker, 
  Folder, 
  Plus, 
  ChevronDown,
  ChevronUp,
  X,
  Save,
  Wand2,
  MessageSquare,
  Download,
  Maximize2,
  Minimize2,
  Calendar,
  FileText,
  TrendingUp,
  UserCircle,
  LogIn,
  UserPlus,
  Filter,
  Trash2,
  User,
  LogOut,
  Settings,
  Mic
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import PromptCard from './components/PromptCard';
import TagNavigation from './components/TagNavigation';
import AnalyticsDashboard from './components/AnalyticsDashboard';
import PromptLaboratory from './components/PromptLaboratory';
import Modal from './components/Modal';
import AuthModal from './components/AuthModal';
import ActivityLog from './components/ActivityLog';
import { useAuth } from './contexts/AuthContext';
import FunctionalityChecker from './components/FunctionalityChecker';

const samplePrompts = [
  {
    id: 1,
    content: "Create a detailed description of a magical forest with bioluminescent plants and mystical creatures.",
    responseSummary: "Generated a vivid description of an enchanted forest with glowing flora and fauna...",
    tags: ["Creative", "Description", "Fantasy"],
    favorite: true,
    createdAt: new Date(2023, 5, 15),
    usageCount: 12,
    platform: "ChatGPT",
    qualityMetrics: {
      relevance: 0.85,
      clarity: 0.92,
      diversity: 0.78,
      innovation: 0.88,
      actionability: 0.72
    }
  },
  {
    id: 2,
    content: "Write a step-by-step guide on how to optimize prompts for generating code with AI assistants.",
    responseSummary: "Provided a comprehensive guide on structuring prompts for code generation...",
    tags: ["Technical", "Guide", "Coding"],
    favorite: false,
    createdAt: new Date(2023, 6, 22),
    usageCount: 28,
    platform: "Claude",
    qualityMetrics: {
      relevance: 0.95,
      clarity: 0.88,
      diversity: 0.65,
      innovation: 0.72,
      actionability: 0.91
    }
  },
  {
    id: 3,
    content: "Design a character profile for a cyberpunk hacker with augmented reality implants.",
    responseSummary: "Created a detailed character profile with background, skills, and physical description...",
    tags: ["Character", "Cyberpunk", "Profile"],
    favorite: true,
    createdAt: new Date(2023, 7, 8),
    usageCount: 8,
    platform: "Bard",
    qualityMetrics: {
      relevance: 0.78,
      clarity: 0.85,
      diversity: 0.92,
      innovation: 0.94,
      actionability: 0.68
    }
  },
  {
    id: 4,
    content: "Explain quantum computing principles to a high school student.",
    responseSummary: "Simplified explanation of quantum bits, superposition, and quantum algorithms...",
    tags: ["Educational", "Science", "Simplified"],
    favorite: false,
    createdAt: new Date(2023, 8, 3),
    usageCount: 35,
    platform: "ChatGPT",
    qualityMetrics: {
      relevance: 0.91,
      clarity: 0.96,
      diversity: 0.72,
      innovation: 0.65,
      actionability: 0.82
    }
  },
  {
    id: 5,
    content: "Generate a business email template requesting a meeting with a potential client.",
    responseSummary: "Crafted a professional email template with appropriate tone and call-to-action...",
    tags: ["Business", "Email", "Template"],
    favorite: true,
    createdAt: new Date(2023, 9, 12),
    usageCount: 42,
    platform: "Claude",
    qualityMetrics: {
      relevance: 0.94,
      clarity: 0.91,
      diversity: 0.68,
      innovation: 0.58,
      actionability: 0.96
    }
  },
  {
    id: 6,
    content: "Create a recipe for a gourmet three-course meal with wine pairings.",
    responseSummary: "Detailed recipe with appetizer, main course, dessert, and complementary wines...",
    tags: ["Food", "Recipe", "Gourmet"],
    favorite: false,
    createdAt: new Date(2023, 10, 5),
    usageCount: 15,
    platform: "Bard",
    qualityMetrics: {
      relevance: 0.88,
      clarity: 0.84,
      diversity: 0.82,
      innovation: 0.76,
      actionability: 0.89
    }
  }
];

const allTags = [
  "Creative", "Description", "Fantasy", "Technical", "Guide", "Coding", 
  "Character", "Cyberpunk", "Profile", "Educational", "Science", "Simplified",
  "Business", "Email", "Template", "Food", "Recipe", "Gourmet",
  "Fiction", "Non-fiction", "Academic", "Professional", "Casual", "Formal",
  "Narrative", "Instructional", "Persuasive", "Analytical", "Descriptive", "Expository"
];

function App() {
  const [activeTab, setActiveTab] = useState<'prompts' | 'laboratory' | 'analytics' | 'settings'>('prompts');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState('newest');
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [prompts, setPrompts] = useState(samplePrompts);
  const [selectedPrompt, setSelectedPrompt] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSortDropdownOpen, setIsSortDropdownOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isAccountMenuOpen, setIsAccountMenuOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'register'>('login');
  const { isAuthenticated, user, logout } = useAuth();
  const [showActivityLog, setShowActivityLog] = useState(false);
  const [activityLogClickCount, setActivityLogClickCount] = useState(0);
  const [activityLogClickTimer, setActivityLogClickTimer] = useState<NodeJS.Timeout | null>(null);

  const handleAccountAction = (action: 'login' | 'register') => {
    setAuthModalMode(action);
    setIsAuthModalOpen(true);
    setIsAccountMenuOpen(false);
  };

  const filteredPrompts = prompts.filter(prompt => {
    const matchesSearch = prompt.content.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          prompt.responseSummary.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTags = selectedTags.length === 0 || 
                        selectedTags.some(tag => prompt.tags.includes(tag));
    const matchesFavorites = !showFavoritesOnly || prompt.favorite;
    
    return matchesSearch && matchesTags && matchesFavorites;
  });

  const sortedPrompts = [...filteredPrompts].sort((a, b) => {
    if (sortBy === 'newest') {
      return b.createdAt.getTime() - a.createdAt.getTime();
    } else if (sortBy === 'oldest') {
      return a.createdAt.getTime() - b.createdAt.getTime();
    } else if (sortBy === 'most-used') {
      return b.usageCount - a.usageCount;
    } else if (sortBy === 'least-used') {
      return a.usageCount - b.usageCount;
    }
    return 0;
  });

  const toggleFavorite = (id: number) => {
    setPrompts(prompts.map(prompt => 
      prompt.id === id ? { ...prompt, favorite: !prompt.favorite } : prompt
    ));
  };

  const updateTag = (promptId: number, tagIndex: number, newTag: string) => {
    setPrompts(prompts.map(prompt => {
      if (prompt.id === promptId) {
        const newTags = [...prompt.tags];
        newTags[tagIndex] = newTag;
        return { ...prompt, tags: newTags };
      }
      return prompt;
    }));
  };

  const openPromptModal = (prompt: any) => {
    setSelectedPrompt(prompt);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedPrompt(null);
  };

  const formatDateTime = (date: Date) => {
    return new Intl.DateTimeFormat('default', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    }).format(date).replace(',', '');
  };

  const toggleActivityLog = () => {
    setShowActivityLog(!showActivityLog);
  };

  const handleLogoClick = () => {
    setActivityLogClickCount(prevCount => prevCount + 1);
    
    if (activityLogClickTimer) {
      clearTimeout(activityLogClickTimer);
    }
    
    const timer = setTimeout(() => {
      setActivityLogClickCount(0);
    }, 2000);
    
    setActivityLogClickTimer(timer);
  };

  useEffect(() => {
    if (activityLogClickCount >= 7) {
      setShowActivityLog(true);
      setActivityLogClickCount(0);
      if (activityLogClickTimer) {
        clearTimeout(activityLogClickTimer);
      }
    }
  }, [activityLogClickCount, activityLogClickTimer]);

  useEffect(() => {
    (window as any).showAetherFlowActivityLog = () => {
      setShowActivityLog(true);
    };
    
    return () => {
      delete (window as any).showAetherFlowActivityLog;
      
      if (activityLogClickTimer) {
        clearTimeout(activityLogClickTimer);
      }
    };
  }, []);

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 flex flex-col">
      <header className="bg-gray-800 border-b border-purple-900/30 p-4 flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <Sparkles className="text-purple-400" size={24} />
          <h1 
            className="text-xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent cursor-pointer"
            onClick={handleLogoClick}
          >
            PromptMagic
          </h1>
        </div>
        
        <div className="flex items-center space-x-4">
          <nav className="flex space-x-1">
            <button
              onClick={() => setActiveTab('prompts')}
              className={`px-4 py-2 rounded-lg flex items-center space-x-2 transition-all duration-300 ${
                activeTab === 'prompts' ? 'bg-purple-600 text-white' : 'text-gray-400 hover:text-white hover:bg-gray-700'
              }`}
            >
              <Folder size={18} />
              <span className="hidden sm:inline">Prompts</span>
            </button>
            
            <button
              onClick={() => setActiveTab('laboratory')}
              className={`px-4 py-2 rounded-lg flex items-center space-x-2 transition-all duration-300 ${
                activeTab === 'laboratory' ? 'bg-purple-600 text-white' : 'text-gray-400 hover:text-white hover:bg-gray-700'
              }`}
            >
              <Beaker size={18} />
              <span className="hidden sm:inline">Laboratory</span>
            </button>
            
            <button
              onClick={() => setActiveTab('analytics')}
              className={`px-4 py-2 rounded-lg flex items-center space-x-2 transition-all duration-300 ${
                activeTab === 'analytics' ? 'bg-purple-600 text-white' : 'text-gray-400 hover:text-white hover:bg-gray-700'
              }`}
            >
              <BarChart2 size={18} />
              <span className="hidden sm:inline">Analytics</span>
            </button>
          </nav>

          <div className="relative">
            {isAuthenticated ? (
              <div className="relative">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setIsAccountMenuOpen(!isAccountMenuOpen)}
                  className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg flex items-center space-x-2 transition-all duration-300"
                >
                  <UserCircle size={18} />
                  <span>{user?.name}</span>
                  <ChevronDown size={16} className={`transform transition-transform duration-300 ${isAccountMenuOpen ? 'rotate-180' : ''}`} />
                </motion.button>

                <AnimatePresence>
                  {isAccountMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="absolute right-0 mt-2 w-48 bg-gray-800 border border-gray-700 rounded-lg shadow-xl overflow-hidden z-50"
                    >
                      <div className="p-3 border-b border-gray-700">
                        <p className="text-sm text-gray-400">Signed in as</p>
                        <p className="font-medium truncate">{user?.email}</p>
                      </div>
                      <div className="p-2">
                        <button
                          onClick={() => {
                            setIsAccountMenuOpen(false);
                            logout();
                          }}
                          className="w-full text-left px-3 py-2 text-red-400 hover:bg-gray-700 rounded-md flex items-center space-x-2 transition-all duration-300"
                        >
                          <span>Sign Out</span>
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <div className="relative">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setIsAccountMenuOpen(!isAccountMenuOpen)}
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg flex items-center space-x-2 transition-all duration-300"
                >
                  <UserCircle size={18} />
                  <span>Account</span>
                  <ChevronDown size={16} className={`transform transition-transform duration-300 ${isAccountMenuOpen ? 'rotate-180' : ''}`} />
                </motion.button>

                <AnimatePresence>
                  {isAccountMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="absolute right-0 mt-2 w-48 bg-gray-800 border border-gray-700 rounded-lg shadow-xl overflow-hidden z-50"
                    >
                      <button
                        onClick={() => handleAccountAction('login')}
                        className="w-full text-left px-4 py-3 hover:bg-gray-700 flex items-center space-x-2 transition-all duration-300"
                      >
                        <LogIn size={18} />
                        <span>Sign In</span>
                      </button>
                      <button
                        onClick={() => handleAccountAction('register')}
                        className="w-full text-left px-4 py-3 hover:bg-gray-700 flex items-center space-x-2 transition-all duration-300"
                      >
                        <UserPlus size={18} />
                        <span>Sign Up</span>
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="flex-1 overflow-hidden">
        {activeTab === 'prompts' && (
          <div className="h-full flex flex-col">
            <div className="flex flex-1">
              <div className="w-64 bg-gray-800/50 border-r border-purple-900/20 p-4 hidden md:block">
                <TagNavigation 
                  allTags={allTags} 
                  selectedTags={selectedTags} 
                  onTagSelect={(tag) => {
                    if (selectedTags.includes(tag)) {
                      setSelectedTags(selectedTags.filter(t => t !== tag));
                    } else {
                      setSelectedTags([...selectedTags, tag]);
                    }
                  }}
                />
              </div>
              
              <div className="flex-1 p-4 overflow-auto">
                <div className="mb-6 flex flex-col md:flex-row gap-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                    <input
                      type="text"
                      placeholder="Search prompts..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300"
                    />
                  </div>
                  
                  <div className="flex space-x-2">
                    <div className="relative">
                      <button 
                        onClick={() => setIsSortDropdownOpen(!isSortDropdownOpen)}
                        className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg flex items-center space-x-2 hover:bg-gray-700 transition-all duration-300"
                      >
                        <Clock size={18} />
                        <span>
                          {sortBy === 'newest' && 'Newest'}
                          {sortBy === 'oldest' && 'Oldest'}
                          {sortBy === 'most-used' && 'Most Used'}
                          {sortBy === 'least-used' && 'Least Used'}
                        </span>
                        {isSortDropdownOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                      </button>
                      
                      <AnimatePresence>
                        {isSortDropdownOpen && (
                          <motion.div 
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.2 }}
                            className="absolute right-0 mt-2 w-40 bg-gray-800 border border-gray-700 rounded-lg shadow-xl z-10"
                          >
                            <button 
                              onClick={() => {
                                setSortBy('newest');
                                setIsSortDropdownOpen(false);
                              }}
                              className="w-full text-left px-4 py-2 hover:bg-gray-700 rounded-t-lg flex items-center space-x-2"
                            >
                              <Clock size={16} />
                              <span>Newest</span>
                            </button>
                            <button 
                              onClick={() => {
                                setSortBy('oldest');
                                setIsSortDropdownOpen(false);
                              }}
                              className="w-full text-left px-4 py-2 hover:bg-gray-700 flex items-center space-x-2"
                            >
                              <Clock size={16} />
                              <span>Oldest</span>
                            </button>
                            <button 
                              onClick={() => {
                                setSortBy('most-used');
                                setIsSortDropdownOpen(false);
                              }}
                              className="w-full text-left px-4 py-2 hover:bg-gray-700 flex items-center space-x-2"
                            >
                              <TrendingUp size={16} />
                              <span>Most Used</span>
                            </button>
                            <button 
                              onClick={() => {
                                setSortBy('least-used');
                                setIsSortDropdownOpen(false);
                              }}
                              className="w-full text-left px-4 py-2 hover:bg-gray-700 rounded-b-lg flex items-center space-x-2"
                            >
                              <TrendingUp size={16} className="transform rotate-180" />
                              <span>Least Used</span>
                            </button>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                    
                    <button 
                      onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
                      className={`px-4 py-2 border rounded-lg flex items-center space-x-2 transition-all duration-300 ${
                        showFavoritesOnly 
                          ? 'bg-yellow-900/30 border-yellow-700 text-yellow-300' 
                          : 'bg-gray-800 border-gray-700 hover:bg-gray-700'
                      }`}
                    >
                      {showFavoritesOnly ? <Star size={18} /> : <StarOff size={18} />}
                      <span>{showFavoritesOnly ? 'Favorites' : 'All'}</span>
                    </button>
                    
                    <button className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg flex items-center space-x-2 hover:bg-gray-700 transition-all duration-300 md:hidden">
                      <SlidersHorizontal size={18} />
                      <span>Filters</span>
                    </button>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <AnimatePresence>
                    {sortedPrompts.map((prompt, index) => (
                      <motion.div
                        key={prompt.id}
                        initial={{ opacity: 0, y: 20, rotateY: 90 }}
                        animate={{ opacity: 1, y: 0, rotateY: 0 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        transition={{ 
                          duration: 0.4, 
                          delay: index * 0.1,
                          type: 'spring',
                          stiffness: 100
                        }}
                      >
                        <PromptCard 
                          prompt={prompt}
                          onFavoriteToggle={() => toggleFavorite(prompt.id)}
                          onTagUpdate={updateTag}
                          onClick={() => openPromptModal(prompt)}
                        />
                      </motion.div>
                    ))}
                  </AnimatePresence>
                  
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: sortedPrompts.length * 0.1 }}
                    className="bg-gray-800/50 border border-gray-700 border-dashed rounded-xl p-6 flex flex-col items-center justify-center text-gray-400 hover:bg-gray-800 hover:border-purple-500/50 transition-all duration-300 cursor-pointer min-h-[200px]"
                  >
                    <div className="w-12 h-12 rounded-full bg-gray-700/50 flex items-center justify-center mb-3">
                      <Plus size={24} />
                    </div>
                    <p className="font-medium">Create New Prompt</p>
                  </motion.div>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {activeTab === 'laboratory' && (
          <PromptLaboratory />
        )}
        
        {activeTab === 'analytics' && (
          <AnalyticsDashboard />
        )}
        
        {activeTab === 'settings' && (
          <div className="p-4">
            <h2 className="text-xl font-bold mb-4">系统设置</h2>
            <FunctionalityChecker />
          </div>
        )}

        <FunctionalityChecker />

        <AnimatePresence>
          {showActivityLog && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
            >
              <motion.div
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 20 }}
                className="bg-gray-800 border border-gray-700 rounded-xl p-5 max-w-5xl w-full max-h-[90vh] overflow-auto"
              >
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-bold flex items-center">
                    <BarChart2 className="mr-2 text-purple-400" />
                    活动日志
                  </h2>
                  <button
                    onClick={toggleActivityLog}
                    className="p-2 hover:bg-gray-700 rounded-full"
                  >
                    <X size={20} />
                  </button>
                </div>
                <ActivityLog />
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <AnimatePresence>
        {isModalOpen && selectedPrompt && (
          <Modal onClose={closeModal}>
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="p-6 max-w-4xl w-full"
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h2 className="text-xl font-bold">Prompt Details</h2>
                  <div className="flex items-center mt-2 space-x-4 text-sm text-gray-400">
                    <div className="flex items-center space-x-2">
                      <Sparkles size={14} className="text-purple-400" />
                      <span>{selectedPrompt.platform}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Clock size={14} />
                      <span>{formatDateTime(selectedPrompt.createdAt)}</span>
                    </div>
                  </div>
                </div>
                <button onClick={closeModal} className="text-gray-400 hover:text-white">
                  <X size={24} />
                </button>
              </div>
              
              <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-medium text-gray-400 mb-2">Prompt</h3>
                  <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                    <p>{selectedPrompt.content}</p>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-gray-400 mb-2">Response</h3>
                  <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                    <p>{selectedPrompt.responseSummary}</p>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-gray-400 mb-2">Tags</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedPrompt.tags.map((tag: string, index: number) => (
                      <span key={index} className="px-3 py-1 bg-purple-900/30 text-purple-300 rounded-full text-sm">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-gray-400 mb-2">Quality Metrics</h3>
                  <div className="grid grid-cols-5 gap-2">
                    {Object.entries(selectedPrompt.qualityMetrics).map(([key, value]: [string, any]) => (
                      <div key={key} className="bg-gray-800 rounded-lg p-3 text-center">
                        <div className="text-xs text-gray-400 mb-1">{key.charAt(0).toUpperCase() + key.slice(1)}</div>
                        <div className="text-lg font-semibold">{Math.round(value * 100)}%</div>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="flex justify-between pt-4 border-t border-gray-700">
                  <div className="flex space-x-2">
                    <motion.button 
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg flex items-center space-x-2 transition-all duration-300"
                    >
                      <Wand2 size={18} />
                      <span>Optimize</span>
                    </motion.button>
                    <motion.button 
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg flex items-center space-x-2 transition-all duration-300"
                    >
                      <Copy size={18} />
                      <span>Copy</span>
                    </motion.button>
                  </div>
                  
                  <motion.button 
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => toggleFavorite(selectedPrompt.id)}
                    className={`px-4 py-2 rounded-lg flex items-center space-x-2 transition-all duration-300 ${
                      selectedPrompt.favorite 
                        ? 'bg-yellow-900/30 text-yellow-300' 
                        : 'bg-gray-700 hover:bg-gray-600'
                    }`}
                  >
                    {selectedPrompt.favorite ? <Star size={18} /> : <StarOff size={18} />}
                    <span>{selectedPrompt.favorite ? 'Favorited' : 'Add to Favorites'}</span>
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </Modal>
        )}
      </AnimatePresence>

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        initialMode={authModalMode}
      />
    </div>
  );
}

export default App;