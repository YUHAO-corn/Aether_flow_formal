import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  RiSettings4Line, 
  RiSaveLine, 
  RiLightbulbLine,
  RiMailSendLine,
  RiInformationLine
} from 'react-icons/ri';

const Settings = ({ 
  reducedMotion, 
  autoSaveEnabled, 
  setAutoSaveEnabled,
  smartSuggestionsEnabled,
  setSmartSuggestionsEnabled
}) => {
  const [feedbackText, setFeedbackText] = useState('');
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);
  
  const handleSubmitFeedback = () => {
    if (!feedbackText.trim()) return;
    
    // In a real implementation, this would send the feedback to a server
    console.log('Feedback submitted:', feedbackText);
    setFeedbackSubmitted(true);
    setFeedbackText('');
    
    // Reset the submitted state after a delay
    setTimeout(() => {
      setFeedbackSubmitted(false);
    }, 3000);
  };
  
  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2 mb-4">
        <RiSettings4Line className="text-purple-400" size={20} />
        <h2 className="text-xl font-semibold text-white">Settings</h2>
      </div>
      
      <div className="space-y-4">
        <div className="p-4 bg-gray-800/50 border border-gray-700 rounded-lg">
          <h3 className="font-medium text-white mb-4">Features</h3>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <RiSaveLine className="text-blue-400" />
                <div>
                  <p className="text-gray-200">Auto-Save</p>
                  <p className="text-xs text-gray-400">Automatically save your prompts while you work</p>
                </div>
              </div>
              
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  className="sr-only peer" 
                  checked={autoSaveEnabled}
                  onChange={() => setAutoSaveEnabled(!autoSaveEnabled)}
                />
                <div className="w-11 h-6 bg-gray-700 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-gray-300 after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
              </label>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <RiLightbulbLine className="text-yellow-400" />
                <div>
                  <p className="text-gray-200">Smart Prompt Suggestions</p>
                  <p className="text-xs text-gray-400">Get AI-powered suggestions while you type</p>
                </div>
              </div>
              
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  className="sr-only peer" 
                  checked={smartSuggestionsEnabled}
                  onChange={() => setSmartSuggestionsEnabled(!smartSuggestionsEnabled)}
                />
                <div className="w-11 h-6 bg-gray-700 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-gray-300 after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
              </label>
            </div>
          </div>
        </div>
        
        <div className="p-4 bg-gray-800/50 border border-gray-700 rounded-lg">
          <h3 className="font-medium text-white mb-4">Feedback</h3>
          
          <div className="space-y-3">
            <p className="text-sm text-gray-300">
              Help us improve PromptMagic by sharing your suggestions or reporting issues.
            </p>
            
            <textarea
              value={feedbackText}
              onChange={(e) => setFeedbackText(e.target.value)}
              placeholder="Your feedback..."
              className="w-full h-24 bg-gray-700/50 border border-gray-600 rounded-lg p-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-transparent resize-none"
            />
            
            <div className="flex justify-end">
              <motion.button
                className={`px-4 py-2 rounded-lg flex items-center space-x-2 ${
                  feedbackSubmitted
                    ? 'bg-green-700 text-green-200'
                    : !feedbackText.trim()
                      ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                      : 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-glow-sm hover:shadow-glow-md'
                }`}
                whileHover={!feedbackSubmitted && feedbackText.trim() && !reducedMotion ? { y: -2 } : {}}
                whileTap={!feedbackSubmitted && feedbackText.trim() && !reducedMotion ? { y: 0 } : {}}
                onClick={handleSubmitFeedback}
                disabled={feedbackSubmitted || !feedbackText.trim()}
              >
                {feedbackSubmitted ? (
                  <>
                    <span>Submitted</span>
                    <span>✓</span>
                  </>
                ) : (
                  <>
                    <RiMailSendLine />
                    <span>Send Feedback</span>
                  </>
                )}
              </motion.button>
            </div>
          </div>
        </div>
        
        <div className="p-4 bg-blue-900/20 border border-blue-800/50 rounded-lg flex items-start space-x-3">
          <RiInformationLine className="text-blue-400 mt-1" />
          <p className="text-sm text-blue-200">
            Your feedback helps us improve PromptMagic and create a better experience for everyone.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Settings;