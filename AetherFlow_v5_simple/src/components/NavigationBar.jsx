import React from 'react';
import { motion } from 'framer-motion';
import { 
  RiBookMarkLine, 
  RiMagicLine, 
  RiLightbulbLine, 
  RiSettings4Line,
  RiArrowLeftSLine,
  RiArrowRightSLine,
  RiExternalLinkLine
} from 'react-icons/ri';

const NavigationBar = ({ activeTab, setActiveTab, toggleExpand, isExpanded, reducedMotion }) => {
  const navItems = [
    { id: 'library', icon: RiBookMarkLine, label: '提示词库' },
    { id: 'enhance', icon: RiMagicLine, label: '提示词优化' },
    { id: 'suggest', icon: RiLightbulbLine, label: '智能推荐' },
    { id: 'settings', icon: RiSettings4Line, label: '设置' }
  ];

  return (
    <header className="sticky top-0 z-10 backdrop-blur-md bg-gray-900/15">
      <div className="flex items-center justify-between p-4">
        <motion.div 
          className="flex items-center space-x-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: reducedMotion ? 0 : 0.3 }}
        >
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center shadow-glow-md">
            <motion.div 
              className="w-5 h-5 text-white"
              animate={{ rotate: reducedMotion ? 0 : 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            >
              ✧
            </motion.div>
          </div>
          {isExpanded && (
            <motion.div
              className="flex items-center"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: reducedMotion ? 0 : 0.2 }}
            >
              <h1 className="text-lg font-semibold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-blue-500">
                AetherFlow
              </h1>
              <a 
                href="#" 
                target="_blank" 
                rel="noopener noreferrer"
                className="ml-2 text-gray-400 hover:text-white transition-colors"
                aria-label="Visit AetherFlow website"
              >
                <RiExternalLinkLine size={16} />
              </a>
            </motion.div>
          )}
        </motion.div>
        
        <button 
          onClick={toggleExpand}
          className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-800 hover:bg-gray-700 transition-colors"
          aria-label={isExpanded ? "收起侧边栏" : "展开侧边栏"}
        >
          {isExpanded ? <RiArrowLeftSLine size={20} /> : <RiArrowRightSLine size={20} />}
        </button>
      </div>
      
      <nav className="flex justify-around px-2 pb-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          
          return (
            <motion.button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`relative flex flex-col items-center py-2 px-3 rounded-lg transition-colors ${
                isActive 
                  ? 'text-white' 
                  : 'text-gray-400 hover:text-gray-200'
              }`}
              whileHover={reducedMotion ? {} : { y: -2 }}
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
              
              <Icon size={24} className={isActive ? 'relative z-10' : ''} />
              
              {isExpanded && (
                <span className={`text-xs mt-1 ${isActive ? 'relative z-10' : ''}`}>
                  {item.label}
                </span>
              )}
              
              {isActive && (
                <motion.div 
                  className="absolute -bottom-1 w-1.5 h-1.5 rounded-full bg-purple-500"
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