import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RiSaveLine, RiHistoryLine, RiCloseLine } from 'react-icons/ri';

const AutoSave = ({ reducedMotion }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [lastSaved, setLastSaved] = useState('Just now');
  const [saveStatus, setSaveStatus] = useState('saved'); // 'saving', 'saved', 'error'
  
  // Mock history data
  const saveHistory = [
    { id: 1, timestamp: '2 minutes ago', content: 'Prompt about creative writing techniques' },
    { id: 2, timestamp: '15 minutes ago', content: 'Email template for job application' },
    { id: 3, timestamp: '1 hour ago', content: 'Product description for new smartphone' },
    { id: 4, timestamp: '3 hours ago', content: 'Blog post outline about AI ethics' },
    { id: 5, timestamp: 'Yesterday, 8:45 PM', content: 'Social media post ideas for launch' }
  ];
  
  // Simulate periodic saving
  useEffect(() => {
    const interval = setInterval(() => {
      setSaveStatus('saving');
      
      setTimeout(() => {
        setSaveStatus('saved');
        setLastSaved('Just now');
      }, 1500);
    }, 30000);
    
    return () => clearInterval(interval);
  }, []);
  
  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };
  
  return (
    <div className="fixed bottom-4 right-4 z-20">
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            className="absolute bottom-12 right-0 w-64 bg-gray-800 border border-gray-700 rounded-lg shadow-lg overflow-hidden"
            initial={{ opacity: 0, y: 10, height: 0 }}
            animate={{ opacity: 1, y: 0, height: 'auto' }}
            exit={{ opacity: 0, y: 10, height: 0 }}
            transition={{ duration: reducedMotion ? 0 : 0.2 }}
          >
            <div className="p-3 border-b border-gray-700 flex justify-between items-center">
              <h3 className="font-medium text-white">Save History</h3>
              <button 
                onClick={toggleExpand}
                className="text-gray-400 hover:text-white"
                aria-label="Close history"
              >
                <RiCloseLine />
              </button>
            </div>
            
            <div className="max-h-64 overflow-y-auto">
              {saveHistory.map(item => (
                <div 
                  key={item.id}
                  className="p-3 border-b border-gray-700 hover:bg-gray-700/50 transition-colors cursor-pointer"
                >
                  <div className="flex justify-between items-start">
                    <span className="text-xs text-gray-400">{item.timestamp}</span>
                    <button className="text-xs text-purple-400 hover:text-purple-300">
                      Restore
                    </button>
                  </div>
                  <p className="text-sm text-gray-300 mt-1 line-clamp-2">{item.content}</p>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      <motion.button
        className={`flex items-center space-x-2 px-3 py-2 rounded-lg ${
          saveStatus === 'saving' 
            ? 'bg-blue-900/70 text-blue-300' 
            : saveStatus === 'error'
              ? 'bg-red-900/70 text-red-300'
              : 'bg-gray-800/70 text-gray-300 hover:bg-gray-700/70'
        }`}
        whileHover={reducedMotion ? {} : { y: -2 }}
        onClick={toggleExpand}
        aria-label="View save history"
      >
        {saveStatus === 'saving' ? (
          <motion.div 
            className="w-4 h-4 border-2 border-t-transparent border-blue-300 rounded-full"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          />
        ) : (
          saveStatus === 'error' ? (
            <motion.div 
              className="w-4 h-4 text-red-300"
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 1, repeat: Infinity }}
            >
              !
            </motion.div>
          ) : (
            <RiSaveLine />
          )
        )}
        
        <div className="flex items-center space-x-1">
          <span>{saveStatus === 'saving' ? 'Saving...' : `Saved ${lastSaved}`}</span>
          <RiHistoryLine 
            className={`text-gray-400 ${isExpanded ? 'rotate-180' : ''} transition-transform`} 
            size={14} 
          />
        </div>
      </motion.button>
    </div>
  );
};

export default AutoSave;