import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { RiLightbulbLine, RiThumbUpLine, RiThumbDownLine, RiFileCopyLine } from 'react-icons/ri';

// Mock data for suggestions
const mockSuggestions = [
  {
    id: 1,
    title: 'Improve clarity with specific examples',
    description: 'Adding concrete examples makes your prompt more effective by giving the AI clear reference points.',
    content: 'To improve your prompt, add specific examples that illustrate what you\'re looking for. For instance, if you\'re asking for a marketing strategy, include examples of successful campaigns you admire or specific target demographics you want to reach. This gives the AI concrete reference points to better understand your expectations.',
    category: 'clarity'
  },
  {
    id: 2,
    title: 'Add context about your audience',
    description: 'Specify who will be reading the output to help tailor the tone and complexity appropriately.',
    content: 'Enhance your prompt by specifying your target audience. For example: "This explanation should be understandable to a high school student with no technical background" or "This content is for marketing professionals with extensive industry knowledge." This context helps the AI adjust the tone, complexity, and terminology to match your audience\'s needs.',
    category: 'context'
  },
  {
    id: 3,
    title: 'Define the desired format',
    description: 'Explicitly state how you want the information structured (bullet points, paragraphs, table, etc.).',
    content: 'Make your prompt more effective by specifying your preferred output format. For example: "Present this information as a numbered list with brief explanations for each point" or "Structure this as a formal report with an executive summary, main findings, and recommendations sections." Clear format instructions ensure you receive content in the most useful structure for your needs.',
    category: 'format'
  },
  {
    id: 4,
    title: 'Specify the level of detail',
    description: 'Indicate whether you want a brief overview or an in-depth analysis with supporting information.',
    content: 'Clarify the depth of information you need by specifying the level of detail in your prompt. For instance: "Provide a high-level overview in 2-3 paragraphs" or "I need a comprehensive analysis with supporting evidence, examples, and consideration of multiple perspectives." This guidance helps the AI determine how thoroughly to explore the topic.',
    category: 'detail'
  },
  {
    id: 5,
    title: 'Include constraints or limitations',
    description: 'Mention any specific constraints like word count, technical level, or areas to avoid.',
    content: 'Improve your prompt by including relevant constraints or limitations. For example: "Keep the response under 500 words," "Avoid technical jargon," or "Don\'t include pricing information." Setting these boundaries helps the AI generate content that meets your specific requirements and avoids irrelevant or unwanted information.',
    category: 'constraints'
  }
];

// Category colors
const categoryColors = {
  'clarity': 'from-blue-600 to-cyan-600',
  'context': 'from-purple-600 to-pink-600',
  'format': 'from-green-600 to-emerald-600',
  'detail': 'from-yellow-600 to-amber-600',
  'constraints': 'from-red-600 to-orange-600'
};

const SuggestionCard = ({ suggestion, onSelect, onCopy, reducedMotion }) => {
  const gradientClass = categoryColors[suggestion.category] || 'from-gray-600 to-gray-500';
  
  const handleCopy = (e) => {
    e.stopPropagation();
    onCopy(suggestion);
  };

  return (
    <motion.div
      className="relative overflow-hidden rounded-lg border border-gray-700 hover:border-gray-500 transition-colors cursor-pointer"
      whileHover={reducedMotion ? {} : { y: -5, x: 5 }}
      transition={{ duration: 0.2 }}
      onClick={() => onSelect(suggestion)}
    >
      <div className={`absolute top-0 left-0 w-1 h-full bg-gradient-to-b ${gradientClass}`} />
      
      <div className="p-4 pl-5">
        <h3 className="font-medium text-white mb-2">{suggestion.title}</h3>
        <p className="text-sm text-gray-300 mb-3">{suggestion.description}</p>
        
        <div className="flex justify-between items-center">
          <span className="text-xs text-gray-400 capitalize">{suggestion.category}</span>
          
          <motion.button
            className="p-1.5 rounded-md bg-gray-700/50 hover:bg-gray-600/50 text-gray-300 hover:text-white"
            whileHover={reducedMotion ? {} : { scale: 1.1 }}
            whileTap={reducedMotion ? {} : { scale: 0.95 }}
            onClick={handleCopy}
            aria-label="Copy suggestion"
          >
            <RiFileCopyLine size={16} />
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
};

const SmartSuggestions = ({ reducedMotion, onSelectSuggestion, enabled }) => {
  const [selectedCategory, setSelectedCategory] = useState(null);
  
  // Get all unique categories
  const categories = [...new Set(mockSuggestions.map(s => s.category))];
  
  // Filter suggestions based on selected category
  const filteredSuggestions = selectedCategory 
    ? mockSuggestions.filter(s => s.category === selectedCategory)
    : mockSuggestions;
  
  // Limit to 5 suggestions as per requirements
  const limitedSuggestions = filteredSuggestions.slice(0, 5);
  
  const handleSelectSuggestion = (suggestion) => {
    onSelectSuggestion(suggestion);
  };
  
  const handleCopySuggestion = (suggestion) => {
    navigator.clipboard.writeText(suggestion.content);
    // Would show a toast notification in a real implementation
  };
  
  // Animation variants
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: reducedMotion ? 0 : 0.07
      }
    }
  };
  
  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  if (!enabled) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center">
        <RiLightbulbLine className="text-gray-500 mb-4" size={48} />
        <h3 className="text-xl font-medium text-gray-400 mb-2">Smart Suggestions are disabled</h3>
        <p className="text-sm text-gray-500 max-w-xs">
          Enable Smart Suggestions in Settings to get AI-powered recommendations while you type.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2 mb-4">
        <RiLightbulbLine className="text-yellow-400" size={20} />
        <h2 className="text-xl font-semibold text-white">Smart Suggestions</h2>
      </div>
      
      <div className="flex items-center space-x-2 overflow-x-auto pb-2">
        <button
          className={`px-3 py-1 rounded-full text-sm ${
            selectedCategory === null 
              ? 'bg-gray-700 text-white' 
              : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
          }`}
          onClick={() => setSelectedCategory(null)}
        >
          All
        </button>
        
        {categories.map(category => (
          <button
            key={category}
            className={`px-3 py-1 rounded-full text-sm ${
              selectedCategory === category 
                ? `bg-gradient-to-r ${categoryColors[category]} text-white` 
                : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
            }`}
            onClick={() => setSelectedCategory(category === selectedCategory ? null : category)}
          >
            {category.charAt(0).toUpperCase() + category.slice(1)}
          </button>
        ))}
      </div>
      
      <motion.div 
        className="grid grid-cols-1 gap-4"
        variants={container}
        initial="hidden"
        animate="show"
      >
        {limitedSuggestions.map((suggestion, index) => (
          <motion.div 
            key={suggestion.id}
            variants={item}
            transition={{ duration: reducedMotion ? 0 : 0.2 }}
            style={{ 
              animationDelay: `${index * 0.07}s`,
              animationFillMode: 'forwards'
            }}
          >
            <SuggestionCard 
              suggestion={suggestion} 
              onSelect={handleSelectSuggestion}
              onCopy={handleCopySuggestion}
              reducedMotion={reducedMotion}
            />
          </motion.div>
        ))}
      </motion.div>
      
      <div className="mt-6 p-4 bg-gray-800/50 border border-gray-700 rounded-lg">
        <h3 className="font-medium text-white mb-2">Was this helpful?</h3>
        <div className="flex space-x-3">
          <motion.button
            className="flex items-center space-x-1 px-3 py-1.5 rounded-md bg-gray-700 hover:bg-gray-600 text-gray-300 hover:text-white"
            whileHover={reducedMotion ? {} : { scale: 1.05 }}
            whileTap={reducedMotion ? {} : { scale: 0.95 }}
          >
            <RiThumbUpLine />
            <span>Yes</span>
          </motion.button>
          
          <motion.button
            className="flex items-center space-x-1 px-3 py-1.5 rounded-md bg-gray-700 hover:bg-gray-600 text-gray-300 hover:text-white"
            whileHover={reducedMotion ? {} : { scale: 1.05 }}
            whileTap={reducedMotion ? {} : { scale: 0.95 }}
          >
            <RiThumbDownLine />
            <span>No</span>
          </motion.button>
        </div>
      </div>
    </div>
  );
};

export default SmartSuggestions;