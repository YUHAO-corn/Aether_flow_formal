import React, { useState, useEffect } from 'react';
import { useAuth } from './contexts/AuthContext';
import { apiClient } from './utils/apiClient';

const [activeTab, setActiveTab] = useState('prompts');
const [searchQuery, setSearchQuery] = useState('');
const [selectedTags, setSelectedTags] = useState<string[]>([]);
const [sortBy, setSortBy] = useState('newest');
const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
const [prompts, setPrompts] = useState(samplePrompts);
const [isLoading, setIsLoading] = useState(false);
const [selectedPrompt, setSelectedPrompt] = useState<any>(null);
const [isModalOpen, setIsModalOpen] = useState(false);
const [isSortDropdownOpen, setIsSortDropdownOpen] = useState(false);
const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
const [isAccountMenuOpen, setIsAccountMenuOpen] = useState(false);
const [authModalMode, setAuthModalMode] = useState<'login' | 'register'>('login');
const { isAuthenticated, user, logout } = useAuth();

// 获取提示词数据
useEffect(() => {
  const fetchPrompts = async () => {
    if (!isAuthenticated) {
      return;
    }
    
    try {
      const response = await apiClient.get('/prompts');
      if (response && response.data && response.data.prompts) {
        setPrompts(response.data.prompts);
      }
    } catch (error) {
      console.error('Error fetching prompts:', error);
    }
  };

  fetchPrompts();
}, [isAuthenticated]); 