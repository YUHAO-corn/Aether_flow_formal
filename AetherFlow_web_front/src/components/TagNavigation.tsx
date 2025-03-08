import React from 'react';
import { Tag, Plus } from 'lucide-react';

interface TagNavigationProps {
  allTags: string[];
  selectedTags: string[];
  onTagSelect: (tag: string) => void;
}

const TagNavigation: React.FC<TagNavigationProps> = ({ 
  allTags, 
  selectedTags, 
  onTagSelect 
}) => {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="font-medium text-lg">Tags</h2>
        <button className="text-purple-400 hover:text-purple-300 transition-colors duration-300">
          <Plus size={20} />
        </button>
      </div>
      
      <div className="space-y-1">
        {allTags.map(tag => (
          <button
            key={tag}
            onClick={() => onTagSelect(tag)}
            className={`w-full text-left px-3 py-2 rounded-lg flex items-center space-x-2 transition-all duration-300 ${
              selectedTags.includes(tag)
                ? 'bg-purple-900/30 text-purple-300'
                : 'text-gray-300 hover:bg-gray-700/50'
            }`}
          >
            <Tag size={16} />
            <span>{tag}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default TagNavigation;