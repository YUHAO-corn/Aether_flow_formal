import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  RiSearchLine, 
  RiStarLine, 
  RiTimeLine, 
  RiFileCopyLine,
  RiSortDesc,
  RiArrowUpLine,
  RiArrowDownLine
} from 'react-icons/ri';

// 提示词卡片组件
const PromptCard = ({ prompt, onClick, onCopy, reducedMotion }) => {
  const handleCopy = (e) => {
    e.stopPropagation();
    onCopy(prompt);
  };

  return (
    <motion.div
      className="bg-gray-800 rounded-lg p-2 mb-2 cursor-pointer hover:bg-gray-750 transition-colors"
      whileHover={reducedMotion ? {} : { y: -2 }}
      onClick={() => onClick(prompt)}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: reducedMotion ? 0 : 0.2 }}
    >
      <div className="flex justify-between items-start mb-1">
        <h3 className="text-xs font-medium text-white line-clamp-1">{prompt.title}</h3>
        <div className="flex space-x-1">
          <button 
            onClick={handleCopy}
            className="text-gray-400 hover:text-white transition-colors"
            aria-label="Copy prompt"
          >
            <RiFileCopyLine size={12} />
          </button>
          <span className={`text-${prompt.isFavorite ? 'yellow' : 'gray'}-400`}>
            <RiStarLine size={12} />
          </span>
        </div>
      </div>
      
      <p className="text-[0.6rem] text-gray-400 line-clamp-2 mb-1">{prompt.description}</p>
      
      <div className="flex justify-between items-center">
        <div className="flex space-x-1">
          {prompt.tags.slice(0, 2).map((tag, index) => (
            <span 
              key={index} 
              className="bg-gray-700 text-[0.5rem] text-gray-300 px-1 py-0.5 rounded"
            >
              {tag}
            </span>
          ))}
          {prompt.tags.length > 2 && (
            <span className="text-[0.5rem] text-gray-400">+{prompt.tags.length - 2}</span>
          )}
        </div>
        
        <div className="flex items-center text-[0.5rem] text-gray-400">
          <RiTimeLine size={10} className="mr-0.5" />
          {prompt.lastUsed}
        </div>
      </div>
    </motion.div>
  );
};

// 排序按钮组件
const SortButton = ({ sortCriteria, setSortCriteria, sortDirection, setSortDirection, reducedMotion }) => {
  const options = [
    { value: 'lastUsed', label: 'Last Used' },
    { value: 'useCount', label: 'Most Used' },
    { value: 'createdAt', label: 'Date Created' }
  ];

  const handleSortChange = (criteria) => {
    if (sortCriteria === criteria) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortCriteria(criteria);
      setSortDirection('desc');
    }
  };

  return (
    <div className="relative">
      <motion.button
        className="flex items-center text-[0.6rem] text-gray-300 bg-gray-800 rounded-md px-2 py-1"
        whileHover={reducedMotion ? {} : { backgroundColor: 'rgba(75, 85, 99, 1)' }}
      >
        <RiSortDesc size={12} className="mr-1" />
        <span>Sort: {options.find(opt => opt.value === sortCriteria)?.label}</span>
        {sortDirection === 'asc' ? (
          <RiArrowUpLine size={12} className="ml-1" />
        ) : (
          <RiArrowDownLine size={12} className="ml-1" />
        )}
      </motion.button>
      
      <div className="absolute right-0 mt-1 bg-gray-800 rounded-md shadow-lg overflow-hidden z-10 hidden group-hover:block">
        {options.map((option) => (
          <button
            key={option.value}
            className="block w-full text-left px-2 py-1 text-[0.6rem] text-gray-300 hover:bg-gray-700"
            onClick={() => handleSortChange(option.value)}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
};

// 模拟数据
const mockPrompts = [
  { 
    id: 1, 
    title: 'Creative Story Generator', 
    description: 'Generate imaginative short stories based on a few keywords or themes.',
    content: 'Write a creative short story that incorporates the following elements: [THEME], [CHARACTER], and [SETTING]. The story should have a clear beginning, middle, and end, with a surprising twist. Use vivid descriptions and engaging dialogue to bring the narrative to life. The story should be approximately 500-800 words in length.',
    tags: ['creative', 'writing', 'fiction'],
    isFavorite: true,
    lastUsed: '2 days ago',
    useCount: 15,
    createdAt: '2023-10-01T10:00:00Z'
  },
  { 
    id: 2, 
    title: 'Code Explainer', 
    description: 'Explain complex code snippets in simple terms with examples.',
    content: 'Explain the following code snippet in simple terms:\n\n```\n[CODE]\n```\n\nBreak down what each part does, explain any complex concepts, and provide a simple example of how this code might be used in a real-world scenario. Your explanation should be understandable to someone with basic programming knowledge.',
    tags: ['coding', 'learning', 'technical'],
    isFavorite: false,
    lastUsed: '5 hours ago',
    useCount: 28,
    createdAt: '2023-09-15T14:30:00Z'
  },
  { 
    id: 3, 
    title: 'Email Composer', 
    description: 'Draft professional emails with the right tone and structure.',
    content: 'Write a professional email for the following situation: [SITUATION]. The email should be addressed to [RECIPIENT] and should have a clear purpose of [PURPOSE]. Use a [TONE] tone and include all necessary components of a professional email including greeting, body, call-to-action, and sign-off. The email should be concise but comprehensive.',
    tags: ['business', 'communication'],
    isFavorite: true,
    lastUsed: 'Yesterday',
    useCount: 42,
    createdAt: '2023-08-20T09:15:00Z'
  }
];

// 主组件
const PromptLibrary = ({ reducedMotion, onSelectPrompt }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortCriteria, setSortCriteria] = useState('lastUsed');
  const [sortDirection, setSortDirection] = useState('desc');
  const [prompts, setPrompts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // 模拟加载数据
  useEffect(() => {
    const timer = setTimeout(() => {
      setPrompts(mockPrompts);
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  // 处理搜索和排序
  const filteredPrompts = prompts
    .filter(prompt => 
      prompt.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      prompt.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      prompt.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
    )
    .sort((a, b) => {
      let comparison = 0;
      
      if (sortCriteria === 'lastUsed') {
        comparison = new Date(b.createdAt) - new Date(a.createdAt);
      } else if (sortCriteria === 'useCount') {
        comparison = b.useCount - a.useCount;
      } else if (sortCriteria === 'createdAt') {
        comparison = new Date(b.createdAt) - new Date(a.createdAt);
      }
      
      return sortDirection === 'asc' ? -comparison : comparison;
    });

  const handlePromptClick = (prompt) => {
    onSelectPrompt(prompt);
  };

  const handleCopyPrompt = (prompt) => {
    navigator.clipboard.writeText(prompt.content)
      .then(() => {
        // 可以添加一个复制成功的提示
        console.log('Prompt copied to clipboard');
      })
      .catch(err => {
        console.error('Failed to copy: ', err);
      });
  };

  return (
    <div>
      <div className="mb-3">
        <h2 className="text-sm font-semibold mb-1">Prompt Library</h2>
        <p className="text-[0.6rem] text-gray-400">Find and use your saved prompts</p>
      </div>
      
      <div className="flex justify-between items-center mb-3">
        <div className="relative flex-1 mr-2">
          <RiSearchLine size={12} className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search prompts..."
            className="w-full bg-gray-800 text-[0.6rem] text-white rounded-md pl-6 pr-2 py-1 focus:outline-none focus:ring-1 focus:ring-purple-500"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
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
      
      {isLoading ? (
        <div className="flex justify-center items-center h-40">
          <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-purple-500"></div>
        </div>
      ) : filteredPrompts.length > 0 ? (
        <div>
          {filteredPrompts.map(prompt => (
            <PromptCard 
              key={prompt.id}
              prompt={prompt}
              onClick={handlePromptClick}
              onCopy={handleCopyPrompt}
              reducedMotion={reducedMotion}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-8">
          <p className="text-[0.6rem] text-gray-400">No prompts found. Try a different search term.</p>
        </div>
      )}
    </div>
  );
};

export default PromptLibrary; 