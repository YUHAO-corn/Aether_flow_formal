import React from 'react';
import ReactDOM from 'react-dom/client';
import { motion } from 'framer-motion';
import './popup.css';

const Popup = () => {
  return (
    <motion.div 
      className="popup-container"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <header className="popup-header">
        <h1>AetherFlow</h1>
        <p>让AI潜能随需释放</p>
      </header>
      
      <div className="popup-content">
        <motion.button 
          className="popup-button"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => chrome.sidePanel.open()}
        >
          打开侧边栏
        </motion.button>
        
        <motion.button 
          className="popup-button"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => chrome.runtime.openOptionsPage()}
        >
          打开设置
        </motion.button>
      </div>
      
      <footer className="popup-footer">
        <p>AetherFlow v0.1.0</p>
      </footer>
    </motion.div>
  );
};

const root = ReactDOM.createRoot(document.getElementById('popup-root'));
root.render(<Popup />); 