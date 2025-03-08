import React, { useState } from 'react';
import { Star, StarOff, Copy, Edit2, ExternalLink } from 'lucide-react';
import { motion } from 'framer-motion';

interface PromptCardProps {
  prompt: {
    id: number;
    content: string;
    responseSummary: string;
    tags: string[];
    favorite: boolean;
    createdAt: Date;
    usageCount: number;
    platform: string;
  };
  onFavoriteToggle: () => void;
  onTagUpdate: (promptId: number, tagIndex: number, newTag: string) => void;
  onClick: () => void;
}

const PromptCard: React.FC<PromptCardProps> = ({ 
  prompt, 
  onFavoriteToggle, 
  onTagUpdate,
  onClick
}) => {
  const [editingTagIndex, setEditingTagIndex] = useState<number | null>(null);
  const [tagValue, setTagValue] = useState('');
  const [isFlipped, setIsFlipped] = useState(false);
  
  const handleTagDoubleClick = (index: number, value: string) => {
    setEditingTagIndex(index);
    setTagValue(value);
  };
  
  const handleTagUpdate = () => {
    if (editingTagIndex !== null && tagValue.trim()) {
      onTagUpdate(prompt.id, editingTagIndex, tagValue.trim());
      setEditingTagIndex(null);
    }
  };
  
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    }).format(date);
  };

  // Card flip animation
  const cardVariants = {
    hidden: { rotateY: 90, opacity: 0 },
    visible: { rotateY: 0, opacity: 1, transition: { duration: 0.5 } },
    flip: { rotateY: 180, transition: { duration: 0.5 } },
    flipBack: { rotateY: 0, transition: { duration: 0.5 } }
  };

  return (
    <motion.div 
      className="group bg-gray-800 border border-gray-700 rounded-xl overflow-hidden hover:border-purple-500/50 hover:shadow-lg hover:shadow-purple-900/20 transition-all duration-300 cursor-pointer perspective-1000"
      onClick={onClick}
      initial="hidden"
      animate="visible"
      whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
    >
      <div className="p-5">
        <div className="flex justify-between items-start mb-3">
          <div className="text-xs text-gray-400">{formatDate(prompt.createdAt)}</div>
          <motion.button 
            whileHover={{ scale: 1.2 }}
            whileTap={{ scale: 0.9 }}
            onClick={(e) => {
              e.stopPropagation();
              onFavoriteToggle();
            }}
            className={`transition-all duration-300 ${prompt.favorite ? 'text-yellow-300' : 'text-gray-500 hover:text-yellow-300'}`}
          >
            {prompt.favorite ? <Star size={18} /> : <StarOff size={18} />}
          </motion.button>
        </div>
        
        <div className="mb-4">
          <p className="text-gray-100 line-clamp-3">{prompt.content}</p>
        </div>
        
        <div className="mb-4">
          <p className="text-gray-400 text-sm line-clamp-2">{prompt.responseSummary}</p>
        </div>
        
        <div className="flex flex-wrap gap-2">
          {prompt.tags.map((tag, index) => (
            <div key={index} className="relative">
              {editingTagIndex === index ? (
                <div 
                  onClick={(e) => e.stopPropagation()}
                  className="flex items-center"
                >
                  <input
                    type="text"
                    value={tagValue}
                    onChange={(e) => setTagValue(e.target.value)}
                    onBlur={handleTagUpdate}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleTagUpdate();
                      if (e.key === 'Escape') setEditingTagIndex(null);
                    }}
                    autoFocus
                    className="px-2 py-1 bg-gray-700 border border-purple-500 rounded-full text-sm focus:outline-none focus:ring-1 focus:ring-purple-500 w-24"
                  />
                </div>
              ) : (
                <motion.span 
                  onDoubleClick={(e) => {
                    e.stopPropagation();
                    handleTagDoubleClick(index, tag);
                  }}
                  className="px-3 py-1 bg-purple-900/30 text-purple-300 rounded-full text-sm flex items-center group-hover:bg-purple-900/40 transition-all duration-300"
                  whileHover={{ scale: 1.05 }}
                >
                  {tag}
                  <Edit2 
                    size={12} 
                    className="ml-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300" 
                  />
                </motion.span>
              )}
            </div>
          ))}
        </div>
        
        <div className="mt-3 flex items-center justify-between text-xs">
          <span className="flex items-center text-gray-400">
            <Copy size={12} className="mr-1" />
            {prompt.usageCount} uses
          </span>
          <button 
            onClick={(e) => {
              e.stopPropagation();
              // Handle viewing original conversation
              window.open(`/conversation/${prompt.id}`, '_blank');
            }}
            className="flex items-center text-purple-400 hover:text-purple-300 transition-colors duration-300"
          >
            <span>View Original Conversation</span>
            <ExternalLink size={12} className="ml-1" />
          </button>
        </div>
      </div>
      
      <div className="flex border-t border-gray-700 divide-x divide-gray-700">
        <motion.button 
          whileHover={{ backgroundColor: 'rgba(75, 85, 99, 1)' }}
          onClick={(e) => {
            e.stopPropagation();
            // Copy prompt to clipboard
            navigator.clipboard.writeText(prompt.content);
          }}
          className="flex-1 py-2 flex justify-center items-center text-gray-400 hover:bg-gray-700 hover:text-white transition-all duration-300"
        >
          <Copy size={16} className="mr-2" />
          <span className="text-sm">Copy</span>
        </motion.button>
      </div>
    </motion.div>
  );
};

export default PromptCard;