import React from 'react';
import { motion } from 'framer-motion';
import { 
  RiBookMarkLine, 
  RiMagicLine, 
  RiLightbulbLine, 
  RiSettings4Line,
  RiArrowLeftSLine,
  RiArrowRightSLine,
  RiExternalLinkLine,
  RiImageLine
} from 'react-icons/ri';

const NavigationBar = ({ activeTab, setActiveTab, toggleExpand, isExpanded, reducedMotion }) => {
  const navItems = [
    { id: 'library', icon: RiBookMarkLine, label: 'Prompt Library' },
    { id: 'enhance', icon: RiMagicLine, label: 'Enhance' },
    { id: 'suggest', icon: RiLightbulbLine, label: 'Suggestions' },
    { id: 'image', icon: RiImageLine, label: 'Images' },
    { id: 'settings', icon: RiSettings4Line, label: 'Settings' }
  ];

  // 缩小图标和字体大小
  const iconSize = 16; // 原来是24，缩小到1/5后约为5，但为了可用性设为16
  const fontSize = '0.6rem'; // 原来的字体大小缩小

  return (
    <header className="sticky top-0 z-10 backdrop-blur-md bg-gray-900/15">
      <div className="flex items-center justify-between p-2">
        <motion.div 
          className="flex items-center space-x-1"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: reducedMotion ? 0 : 0.3 }}
        >
          <div className="w-5 h-5 rounded-full bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center shadow-glow-md">
            <motion.div 
              className="w-3 h-3 text-white"
              animate={{ rotate: reducedMotion ? 0 : 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            >
              ✧
            </motion.div>
          </div>
          {isExpanded && (
            <motion.div
              className="flex items-center"
              initial={{ opacity: 0, x: -5 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: reducedMotion ? 0 : 0.2 }}
            >
              <h1 className="text-xs font-semibold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-blue-500">
                AetherFlow
              </h1>
              <a 
                href="https://aetherflow.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="ml-1 text-gray-400 hover:text-white transition-colors"
                aria-label="Visit AetherFlow website"
              >
                <RiExternalLinkLine size={10} />
              </a>
            </motion.div>
          )}
        </motion.div>
        
        <button 
          onClick={toggleExpand}
          className="w-5 h-5 flex items-center justify-center rounded-full bg-gray-800 hover:bg-gray-700 transition-colors"
          aria-label={isExpanded ? "Collapse sidebar" : "Expand sidebar"}
        >
          {isExpanded ? <RiArrowLeftSLine size={12} /> : <RiArrowRightSLine size={12} />}
        </button>
      </div>
      
      <nav className="flex justify-around px-1 pb-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          
          return (
            <motion.button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`relative flex flex-col items-center py-1 px-1 rounded-lg transition-colors ${
                isActive 
                  ? 'text-white' 
                  : 'text-gray-400 hover:text-gray-200'
              }`}
              whileHover={reducedMotion ? {} : { y: -1 }}
              transition={{ duration: 0.2 }}
              aria-label={item.label}
            >
              {isActive && (
                <motion.div
                  className="absolute inset-0 bg-gradient-to-b from-purple-900/30 to-blue-900/20 rounded-lg shadow-glow-sm"
                  layoutId="activeTab"
                  transition={{ duration: reducedMotion ? 0 : 0.2 }}
                />
              )}
              
              <Icon size={iconSize} className={isActive ? 'relative z-10' : ''} />
              
              {isExpanded && (
                <span className={`text-[0.5rem] mt-0.5 ${isActive ? 'relative z-10' : ''}`} style={{ fontSize }}>
                  {item.label}
                </span>
              )}
              
              {isActive && (
                <motion.div 
                  className="absolute -bottom-0.5 w-1 h-1 rounded-full bg-purple-500"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: reducedMotion ? 0 : 0.2 }}
                />
              )}
            </motion.button>
          );
        })}
      </nav>
    </header>
  );
};

export default NavigationBar; 