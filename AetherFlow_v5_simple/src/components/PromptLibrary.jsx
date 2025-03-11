import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  RiSearchLine, 
  RiStarLine, 
  RiTimeLine, 
  RiFileCopyLine,
  RiSortDesc,
  RiArrowUpLine,
  RiArrowDownLine
} from 'react-icons/ri';

// 标签颜色映射
const tagColors = {
  '描述': 'bg-pink-900/40 text-pink-300',
  '场景': 'bg-purple-900/40 text-purple-300',
  '细节': 'bg-indigo-900/40 text-indigo-300',
  '代码': 'bg-blue-900/40 text-blue-300',
  '优化': 'bg-cyan-900/40 text-cyan-300',
  '建议': 'bg-teal-900/40 text-teal-300',
  '解释': 'bg-green-900/40 text-green-300',
  '专业': 'bg-lime-900/40 text-lime-300',
  '通俗': 'bg-yellow-900/40 text-yellow-300'
};

const PromptCard = ({ prompt, onClick, onCopy, reducedMotion }) => {
  const handleCopy = (e) => {
    e.stopPropagation();
    onCopy(prompt);
  };

  return (
    <motion.div
      className="bg-gray-800/80 backdrop-blur-sm rounded-lg p-4 border border-gray-700 hover:border-purple-500/50 transition-colors cursor-pointer group"
      whileHover={reducedMotion ? {} : { y: -5, boxShadow: '0 0 15px rgba(139, 92, 246, 0.3)' }}
      transition={{ duration: 0.2 }}
      onClick={() => onClick(prompt)}
      layout
    >
      <div className="flex justify-between items-start mb-2">
        <h3 className="font-medium text-white group-hover:text-purple-300 transition-colors">{prompt.title}</h3>
        {prompt.isFavorite && (
          <RiStarLine className="text-yellow-400" />
        )}
      </div>
      
      <p className="text-sm text-gray-300 mb-3 line-clamp-2">{prompt.content}</p>
      
      <div className="flex flex-wrap gap-1 mb-3">
        {prompt.tags.map(tag => (
          <span 
            key={tag} 
            className={`text-xs px-2 py-0.5 rounded-full ${tagColors[tag] || 'bg-gray-700 text-gray-300'}`}
          >
            {tag}
          </span>
        ))}
      </div>
      
      <div className="flex items-center justify-between">
        <span className="text-xs text-gray-500">{prompt.category}</span>
        
        <motion.button
          className="p-1.5 rounded-md bg-gray-700/50 hover:bg-gray-600/50 text-gray-300 hover:text-white"
          whileHover={reducedMotion ? {} : { scale: 1.1 }}
          whileTap={reducedMotion ? {} : { scale: 0.95 }}
          onClick={handleCopy}
          aria-label="复制提示词"
        >
          <RiFileCopyLine size={16} />
        </motion.button>
      </div>
    </motion.div>
  );
};

const SortButton = ({ sortCriteria, setSortCriteria, sortDirection, setSortDirection, reducedMotion }) => {
  const [isOpen, setIsOpen] = useState(false);
  
  const sortOptions = [
    { value: 'category', label: '分类' },
    { value: 'title', label: '标题' },
    { value: 'isFavorite', label: '收藏' }
  ];

  const handleSortChange = (criteria) => {
    if (sortCriteria === criteria) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortCriteria(criteria);
      setSortDirection('desc');
    }
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <motion.button
        className="px-3 py-1.5 rounded-lg bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-white flex items-center space-x-2"
        whileHover={reducedMotion ? {} : { scale: 1.05 }}
        whileTap={reducedMotion ? {} : { scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
      >
        <RiSortDesc />
        <span>排序</span>
        {sortDirection === 'asc' ? <RiArrowUpLine /> : <RiArrowDownLine />}
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div 
            className="absolute right-0 mt-2 py-2 w-48 bg-gray-800 rounded-lg shadow-xl border border-gray-700 z-50"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: reducedMotion ? 0 : 0.15 }}
            style={{
              transformOrigin: 'top right'
            }}
          >
            {sortOptions.map((option) => (
              <button
                key={option.value}
                className={`w-full px-4 py-2 text-left hover:bg-gray-700 flex items-center justify-between ${
                  sortCriteria === option.value ? 'text-purple-400' : 'text-gray-300'
                }`}
                onClick={() => handleSortChange(option.value)}
              >
                <span>{option.label}</span>
                {sortCriteria === option.value && (
                  sortDirection === 'asc' ? <RiArrowUpLine /> : <RiArrowDownLine />
                )}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const PromptLibrary = ({ reducedMotion, onSelectPrompt }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTag, setActiveTag] = useState(null);
  const [sortCriteria, setSortCriteria] = useState('category');
  const [sortDirection, setSortDirection] = useState('desc');
  
  // 示例提示词数据
  const examplePrompts = [
    {
      id: 1,
      title: '详细描述场景',
      content: '请详细描述[场景]，包括环境、氛围、人物状态和关键细节。',
      category: '创意写作',
      tags: ['描述', '场景', '细节'],
      isFavorite: true
    },
    {
      id: 2,
      title: '代码优化建议',
      content: '请分析以下代码并提供优化建议，重点关注性能、可读性和最佳实践：\n```\n[代码]\n```',
      category: '编程',
      tags: ['代码', '优化', '建议'],
      isFavorite: false
    },
    {
      id: 3,
      title: '专业领域解释',
      content: '请以专家的角度解释[概念]，使用通俗易懂的语言，但不要过度简化专业内容。',
      category: '教育',
      tags: ['解释', '专业', '通俗'],
      isFavorite: true
    }
  ];
  
  // 获取所有唯一标签
  const allTags = [...new Set(examplePrompts.flatMap(prompt => prompt.tags))];
  
  // 根据搜索和活动标签过滤提示词
  const filteredPrompts = examplePrompts.filter(prompt => {
    const matchesSearch = searchTerm === '' || 
      prompt.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      prompt.content.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesTag = activeTag === null || prompt.tags.includes(activeTag);
    
    return matchesSearch && matchesTag;
  });
  
  // 根据条件和方向排序提示词
  const sortedPrompts = [...filteredPrompts].sort((a, b) => {
    let comparison = 0;
    
    switch (sortCriteria) {
      case 'category':
        comparison = a.category.localeCompare(b.category);
        break;
      case 'title':
        comparison = a.title.localeCompare(b.title);
        break;
      case 'isFavorite':
        comparison = (b.isFavorite === a.isFavorite) ? 0 : b.isFavorite ? 1 : -1;
        break;
      default:
        comparison = 0;
    }
    
    return sortDirection === 'asc' ? comparison : -comparison;
  });
  
  const handlePromptClick = (prompt) => {
    onSelectPrompt(prompt);
  };
  
  const handleCopyPrompt = (prompt) => {
    navigator.clipboard.writeText(prompt.content);
  };
  
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: reducedMotion ? 0 : 0.05
      }
    }
  };
  
  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-purple-400">提示词库</h2>
        <div className="flex space-x-2">
          <button className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-md text-sm transition-colors">
            新建提示词
          </button>
          <button className="bg-gray-700 hover:bg-gray-600 text-white px-3 py-1 rounded-md text-sm transition-colors">
            导入
          </button>
        </div>
      </div>
      
      <div className="flex items-center justify-between mb-4 relative z-40">
        <div className="relative flex-1 mr-4">
          <RiSearchLine className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="搜索提示词..."
            className="w-full bg-gray-800/50 border border-gray-700 rounded-lg py-2 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-transparent"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <SortButton 
          sortCriteria={sortCriteria}
          setSortCriteria={setSortCriteria}
          sortDirection={sortDirection}
          setSortDirection={setSortDirection}
          reducedMotion={reducedMotion}
        />
      </div>
      
      <div className="flex items-center space-x-2 overflow-x-auto pb-2 relative z-30">
        <button
          className={`px-3 py-1 rounded-full text-sm ${
            activeTag === null 
              ? 'bg-purple-900/40 text-purple-300 border border-purple-500/30' 
              : 'bg-gray-800 text-gray-400 border border-gray-700 hover:bg-gray-700/50'
          }`}
          onClick={() => setActiveTag(null)}
        >
          全部
        </button>
        
        {allTags.map(tag => (
          <button
            key={tag}
            className={`px-3 py-1 rounded-full text-sm ${
              activeTag === tag 
                ? `${tagColors[tag]} border border-${tag}-500/30` 
                : 'bg-gray-800 text-gray-400 border border-gray-700 hover:bg-gray-700/50'
            }`}
            onClick={() => setActiveTag(tag === activeTag ? null : tag)}
          >
            {tag}
          </button>
        ))}
      </div>
      
      <motion.div 
        className="grid grid-cols-1 gap-4 perspective-1000 relative z-20"
        variants={container}
        initial="hidden"
        animate="show"
      >
        {sortedPrompts.length > 0 ? (
          sortedPrompts.map((prompt, index) => (
            <motion.div 
              key={prompt.id}
              variants={item}
              transition={{ duration: reducedMotion ? 0 : 0.2 }}
              style={{ 
                animationDelay: `${index * 0.05}s`,
                animationFillMode: 'forwards'
              }}
            >
              <PromptCard 
                prompt={prompt} 
                onClick={handlePromptClick}
                onCopy={handleCopyPrompt}
                reducedMotion={reducedMotion}
              />
            </motion.div>
          ))
        ) : (
          <motion.div 
            className="text-center py-8 text-gray-400"
            variants={item}
          >
            未找到提示词。请调整您的搜索条件。
          </motion.div>
        )}
      </motion.div>
    </div>
  );
};

export default PromptLibrary; 