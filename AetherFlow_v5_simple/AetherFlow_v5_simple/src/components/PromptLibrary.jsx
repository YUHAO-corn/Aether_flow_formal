import React, { useState } from 'react';
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

// Mock data for prompt cards
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
  },
  { 
    id: 4, 
    title: 'Research Assistant', 
    description: 'Help with academic research by summarizing papers and finding connections.',
    content: 'I need help researching [TOPIC]. Please provide a comprehensive overview of the current state of research on this topic, including key findings, major debates, and emerging trends. Cite important studies and researchers in the field. Also, identify any gaps in the current research and suggest potential areas for further investigation.',
    tags: ['academic', 'research', 'learning'],
    isFavorite: false,
    lastUsed: '1 week ago',
    useCount: 8,
    createdAt: '2023-10-05T16:45:00Z'
  },
  { 
    id: 5, 
    title: 'Product Description Writer', 
    description: 'Create compelling product descriptions for e-commerce.',
    content: 'Write a compelling product description for [PRODUCT]. The description should highlight the following key features and benefits: [FEATURES/BENEFITS]. The target audience is [AUDIENCE]. The description should be persuasive, engaging, and optimized for SEO with relevant keywords. Include a strong call-to-action at the end.',
    tags: ['marketing', 'business', 'writing'],
    isFavorite: false,
    lastUsed: '3 days ago',
    useCount: 19,
    createdAt: '2023-09-28T11:20:00Z'
  },
  { 
    id: 6, 
    title: 'Interview Question Generator', 
    description: 'Generate relevant interview questions for different job roles.',
    content: 'Generate a set of interview questions for a [POSITION] role. Include a mix of questions that assess technical skills, experience, problem-solving abilities, and cultural fit. The questions should help evaluate the candidate\'s proficiency in [SKILLS] and their ability to handle [SITUATIONS]. Provide 10-15 questions in total, organized by category.',
    tags: ['hiring', 'business', 'HR'],
    isFavorite: true,
    lastUsed: '2 weeks ago',
    useCount: 35,
    createdAt: '2023-09-01T13:10:00Z'
  }
];

// Tag colors mapping
const tagColors = {
  'creative': 'bg-pink-900/40 text-pink-300',
  'writing': 'bg-purple-900/40 text-purple-300',
  'fiction': 'bg-indigo-900/40 text-indigo-300',
  'coding': 'bg-blue-900/40 text-blue-300',
  'learning': 'bg-cyan-900/40 text-cyan-300',
  'technical': 'bg-teal-900/40 text-teal-300',
  'business': 'bg-green-900/40 text-green-300',
  'communication': 'bg-lime-900/40 text-lime-300',
  'academic': 'bg-yellow-900/40 text-yellow-300',
  'research': 'bg-amber-900/40 text-amber-300',
  'marketing': 'bg-orange-900/40 text-orange-300',
  'hiring': 'bg-red-900/40 text-red-300',
  'HR': 'bg-rose-900/40 text-rose-300'
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
      
      <p className="text-sm text-gray-300 mb-3 line-clamp-2">{prompt.description}</p>
      
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
        <div className="flex items-center space-x-3">
          <div className="flex items-center text-xs text-gray-400">
            <RiTimeLine className="mr-1" />
            <span>{prompt.lastUsed}</span>
          </div>
          <div className="flex items-center text-xs text-gray-400">
            <span>Used: {prompt.useCount}</span>
          </div>
        </div>
        
        <motion.button
          className="p-1.5 rounded-md bg-gray-700/50 hover:bg-gray-600/50 text-gray-300 hover:text-white"
          whileHover={reducedMotion ? {} : { scale: 1.1 }}
          whileTap={reducedMotion ? {} : { scale: 0.95 }}
          onClick={handleCopy}
          aria-label="Copy prompt"
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
    { value: 'useCount', label: 'Usage' },
    { value: 'isFavorite', label: 'Favorites' },
    { value: 'createdAt', label: 'Date' }
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
        <span>Sort by</span>
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
  const [sortCriteria, setSortCriteria] = useState('useCount');
  const [sortDirection, setSortDirection] = useState('desc');
  
  // Get all unique tags
  const allTags = [...new Set(mockPrompts.flatMap(prompt => prompt.tags))];
  
  // Filter prompts based on search and active tag
  const filteredPrompts = mockPrompts.filter(prompt => {
    const matchesSearch = searchTerm === '' || 
      prompt.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      prompt.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesTag = activeTag === null || prompt.tags.includes(activeTag);
    
    return matchesSearch && matchesTag;
  });
  
  // Sort prompts based on criteria and direction
  const sortedPrompts = [...filteredPrompts].sort((a, b) => {
    let comparison = 0;
    
    switch (sortCriteria) {
      case 'useCount':
        comparison = b.useCount - a.useCount;
        break;
      case 'isFavorite':
        comparison = (b.isFavorite === a.isFavorite) ? 0 : b.isFavorite ? 1 : -1;
        break;
      case 'createdAt':
        comparison = new Date(b.createdAt) - new Date(a.createdAt);
        break;
      default:
        comparison = 0;
    }
    
    return sortDirection === 'asc' ? -comparison : comparison;
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
      <div className="flex items-center justify-between mb-4 relative z-40">
        <div className="relative flex-1 mr-4">
          <RiSearchLine className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search prompts..."
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
          All
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
            No prompts found. Try adjusting your search.
          </motion.div>
        )}
      </motion.div>
    </div>
  );
};

export default PromptLibrary;