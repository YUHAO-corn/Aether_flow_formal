import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { RiLightbulbLine, RiRefreshLine } from 'react-icons/ri';

// 模拟建议数据
const mockSuggestions = [
  {
    id: 1,
    title: 'Detailed Code Review',
    description: 'Get a thorough code review with best practices and optimization tips.',
    content: 'Please review the following code and provide detailed feedback:\n\n```\n[CODE]\n```\n\nI would like you to:\n1. Identify any bugs or potential issues\n2. Suggest optimizations for performance\n3. Point out any security vulnerabilities\n4. Recommend best practices and design pattern improvements\n5. Comment on code readability and maintainability',
    tags: ['coding', 'review']
  },
  {
    id: 2,
    title: 'Learning Roadmap',
    description: 'Create a personalized learning path for any topic or skill.',
    content: 'I want to learn [TOPIC/SKILL]. Please create a comprehensive learning roadmap for me that includes:\n\n1. Foundational concepts I should master first\n2. Recommended progression of sub-topics\n3. Specific resources for each stage (books, courses, tutorials, etc.)\n4. Practice projects to reinforce learning\n5. Estimated time commitment for each stage\n6. How to assess my progress\n\nMy current level is [BEGINNER/INTERMEDIATE/ADVANCED] and I want to reach [DESIRED PROFICIENCY LEVEL] within [TIMEFRAME].',
    tags: ['learning', 'planning']
  },
  {
    id: 3,
    title: 'Meeting Summarizer',
    description: 'Condense meeting notes into key points, decisions, and action items.',
    content: 'Please summarize the following meeting notes into a clear, structured format:\n\n[MEETING NOTES]\n\nPlease organize the summary with these sections:\n1. Key Discussion Points (bullet points of main topics covered)\n2. Decisions Made (clear list of all decisions reached)\n3. Action Items (who is responsible for what and by when)\n4. Open Questions (unresolved issues that need follow-up)\n5. Next Steps (including date/time of next meeting if mentioned)\n\nKeep the summary concise but comprehensive, highlighting only the most important information.',
    tags: ['productivity', 'business']
  }
];

const SuggestionCard = ({ suggestion, onClick, reducedMotion }) => {
  return (
    <motion.div
      className="bg-gray-800 rounded-lg p-2 mb-2 cursor-pointer hover:bg-gray-750 transition-colors"
      whileHover={reducedMotion ? {} : { y: -2 }}
      onClick={() => onClick(suggestion)}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: reducedMotion ? 0 : 0.2 }}
    >
      <div className="flex items-start mb-1">
        <div className="mr-2 mt-0.5 text-yellow-400">
          <RiLightbulbLine size={12} />
        </div>
        <div className="flex-1">
          <h3 className="text-xs font-medium text-white">{suggestion.title}</h3>
          <p className="text-[0.6rem] text-gray-400 line-clamp-2 mb-1">{suggestion.description}</p>
          
          <div className="flex space-x-1">
            {suggestion.tags.map((tag, index) => (
              <span 
                key={index} 
                className="bg-gray-700 text-[0.5rem] text-gray-300 px-1 py-0.5 rounded"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const SmartSuggestions = ({ reducedMotion, onSelectSuggestion, enabled }) => {
  const [suggestions, setSuggestions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // 模拟加载建议
  useEffect(() => {
    if (!enabled) {
      setIsLoading(false);
      return;
    }
    
    setIsLoading(true);
    const timer = setTimeout(() => {
      setSuggestions(mockSuggestions);
      setIsLoading(false);
    }, 1500);
    
    return () => clearTimeout(timer);
  }, [enabled]);
  
  const refreshSuggestions = () => {
    setIsLoading(true);
    setTimeout(() => {
      // 简单地打乱建议顺序，模拟刷新
      setSuggestions([...mockSuggestions].sort(() => Math.random() - 0.5));
      setIsLoading(false);
    }, 1500);
  };
  
  if (!enabled) {
    return (
      <div className="text-center py-4">
        <RiLightbulbLine size={20} className="mx-auto mb-2 text-gray-500" />
        <h3 className="text-sm font-medium text-gray-400 mb-1">Smart Suggestions Disabled</h3>
        <p className="text-[0.6rem] text-gray-500">
          Enable this feature in settings to get AI-powered prompt suggestions.
        </p>
      </div>
    );
  }
  
  return (
    <div>
      <div className="flex justify-between items-center mb-2">
        <div>
          <h2 className="text-sm font-semibold mb-1">Smart Suggestions</h2>
          <p className="text-[0.6rem] text-gray-400">AI-powered prompt ideas for you</p>
        </div>
        
        <button
          className="p-1 rounded-full bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-white transition-colors"
          onClick={refreshSuggestions}
          disabled={isLoading}
          aria-label="Refresh suggestions"
        >
          <RiRefreshLine size={14} className={isLoading ? 'animate-spin' : ''} />
        </button>
      </div>
      
      {isLoading ? (
        <div className="flex justify-center items-center h-32">
          <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-purple-500"></div>
        </div>
      ) : (
        <div>
          {suggestions.map(suggestion => (
            <SuggestionCard 
              key={suggestion.id}
              suggestion={suggestion}
              onClick={onSelectSuggestion}
              reducedMotion={reducedMotion}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default SmartSuggestions; 