import React from 'react';
import { motion } from 'framer-motion';
import { 
  RiBookMarkLine, 
  RiMagicLine, 
  RiLightbulbLine, 
  RiSettings4Line,
  RiExternalLinkLine
} from 'react-icons/ri';
import UserAvatar from './UserAvatar';

const NavigationBar = ({ 
  activeTab, 
  setActiveTab, 
  isExpanded = true,
  reducedMotion,
  user,
  onAvatarClick,
  className = ''
}) => {
  const navItems = [
    { id: 'library', icon: RiBookMarkLine, label: 'Prompt Library' },
    { id: 'enhance', icon: RiMagicLine, label: 'Enhance' },
    { id: 'suggest', icon: RiLightbulbLine, label: 'Suggestions' },
    { id: 'settings', icon: RiSettings4Line, label: 'Settings' }
  ];

  return (
    <header className={`sticky top-0 z-20 backdrop-blur-md bg-gray-900/15 w-full ${className}`}>
      <div className="flex items-center justify-between py-3 px-2">
        <motion.div 
          className="flex items-center space-x-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: reducedMotion ? 0 : 0.3 }}
        >
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center shadow-glow-md">
            <motion.div 
              className="w-5 h-5 text-white flex items-center justify-center"
              animate={{ rotate: reducedMotion ? 0 : 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            >
              ✧
            </motion.div>
          </div>
          <motion.div
            className="flex items-center"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: reducedMotion ? 0 : 0.2 }}
          >
            <h1 className="text-lg font-semibold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-blue-500">
              PromptMagic
            </h1>
            <a 
              href="https://promptmagic.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="ml-2 text-gray-400 hover:text-white transition-colors"
              aria-label="Visit PromptMagic website"
            >
              <RiExternalLinkLine size={16} />
            </a>
          </motion.div>
        </motion.div>
        
        <div className="flex items-center">
          {/* 用户头像 - 始终显示 */}
          <UserAvatar 
            user={user || { username: 'Guest' }} 
            size="sm" 
            onClick={onAvatarClick}
            className="user-avatar"
          />
        </div>
      </div>
      
      <nav className="flex justify-between w-full px-1 pb-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          
          return (
            <motion.button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`nav-item relative flex flex-col items-center justify-center py-2 px-3 rounded-lg transition-colors ${
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
                  className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-gradient-to-b from-purple-900/30 to-blue-900/20 rounded-lg shadow-glow-sm"
                  layoutId="activeTab"
                  transition={{ duration: reducedMotion ? 0 : 0.2 }}
                />
              )}
              
              <div className="flex flex-col items-center justify-center h-full w-full">
                <Icon size={22} className="relative z-10" />
                <span className={`text-xs relative z-10 mt-1 text-center ${isActive ? 'font-medium' : ''}`}>
                  {item.label}
                </span>
              </div>
              
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