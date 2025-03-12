import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const SearchSuggestion = ({ reducedMotion, enabled, onSelectSuggestion }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  
  // Mock suggestions based on search term
  useEffect(() => {
    if (!searchTerm.trim() || !enabled) {
      setSuggestions([]);
      return;
    }
    
    setIsLoading(true);
    
    // Simulate API call delay
    const timer = setTimeout(() => {
      // Mock filtered suggestions based on search term
      const mockSuggestions = [
        {
          id: 'sg1',
          title: `Creative writing with "${searchTerm}"`,
          description: `Generate creative content incorporating "${searchTerm}" as a central theme.`,
          content: `Write a creative piece that uses "${searchTerm}" as a central theme or motif. Explore different perspectives, emotions, or scenarios related to this concept. The piece should be engaging, thought-provoking, and showcase innovative thinking.`
        },
        {
          id: 'sg2',
          title: `Explain "${searchTerm}" simply`,
          description: `Provide a clear, simple explanation of "${searchTerm}" for a general audience.`,
          content: `Explain "${searchTerm}" in simple terms that anyone could understand, regardless of their background knowledge. Break down complex aspects, use analogies where helpful, and focus on making the concept accessible. Avoid jargon and technical language unless absolutely necessary.`
        },
        {
          id: 'sg3',
          title: `Business strategy for "${searchTerm}"`,
          description: `Develop a business strategy related to "${searchTerm}" with actionable steps.`,
          content: `Develop a comprehensive business strategy related to "${searchTerm}". Include market analysis, competitive positioning, key opportunities, potential challenges, and actionable implementation steps. The strategy should be practical, forward-thinking, and adaptable to changing market conditions.`
        }
      ];
      
      setSuggestions(mockSuggestions);
      setIsLoading(false);
    }, 600);
    
    return () => clearTimeout(timer);
  }, [searchTerm, enabled]);
  
  const handleInputChange = (e) => {
    setSearchTerm(e.target.value);
  };
  
  const handleClearSearch = () => {
    setSearchTerm('');
    setSuggestions([]);
  };
  
  const handleSelectSuggestion = (suggestion) => {
    onSelectSuggestion(suggestion);
    setSearchTerm('');
    setSuggestions([]);
  };
  
  return (
    <div className="relative mb-6">
      <div className="relative">
        <input
          type="text"
          placeholder="Search for prompt suggestions..."
          className="w-full bg-gray-800/50 border border-gray-700 rounded-lg py-2 px-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-transparent"
          value={searchTerm}
          onChange={handleInputChange}
          onFocus={() => setIsVisible(true)}
          onBlur={() => setTimeout(() => setIsVisible(false), 200)}
          disabled={!enabled}
        />
      </div>
      
      <AnimatePresence>
        {isVisible && searchTerm && suggestions.length > 0 && (
          <motion.div
            className="absolute z-10 mt-2 w-full bg-gray-800 border border-gray-700 rounded-lg shadow-lg overflow-hidden"
            initial={{ opacity: 0, y: -10, height: 0 }}
            animate={{ opacity: 1, y: 0, height: 'auto' }}
            exit={{ opacity: 0, y: -10, height: 0 }}
            transition={{ duration: reducedMotion ? 0 : 0.2 }}
          >
            <div className="max-h-64 overflow-y-auto">
              {suggestions.map(suggestion => (
                <motion.div
                  key={suggestion.id}
                  className="p-3 border-b border-gray-700 hover:bg-gray-700/50 transition-colors cursor-pointer"
                  whileHover={reducedMotion ? {} : { x: 5 }}
                  onClick={() => handleSelectSuggestion(suggestion)}
                >
                  <h4 className="text-sm font-medium text-white">{suggestion.title}</h4>
                  <p className="text-xs text-gray-300 mt-1 line-clamp-2">{suggestion.description}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      <AnimatePresence>
        {isLoading && searchTerm && (
          <motion.div
            className="absolute z-10 mt-2 w-full bg-gray-800 border border-gray-700 rounded-lg shadow-lg p-4 flex justify-center"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: reducedMotion ? 0 : 0.2 }}
          >
            <div className="flex items-center space-x-2">
              <motion.div 
                className="w-4 h-4 border-2 border-t-transparent border-purple-400 rounded-full"
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              />
              <span className="text-sm text-gray-300">Finding suggestions...</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SearchSuggestion;