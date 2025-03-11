import React, { createContext, useContext, useReducer, useMemo } from 'react';
import type { ReactNode } from 'react';

// 定义状态类型
interface AppState {
  isLoading: boolean;
  isMenuOpen: boolean;
  currentView: string;
  searchQuery: string;
  filterOptions: {
    sortBy: string;
    filterByTag: string[];
    showFavorites: boolean;
  };
}

// 定义操作类型
type Action = 
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'TOGGLE_MENU' }
  | { type: 'SET_MENU'; payload: boolean }
  | { type: 'SET_VIEW'; payload: string }
  | { type: 'SET_SEARCH_QUERY'; payload: string }
  | { type: 'SET_SORT_BY'; payload: string }
  | { type: 'TOGGLE_FAVORITE_FILTER' }
  | { type: 'ADD_TAG_FILTER'; payload: string }
  | { type: 'REMOVE_TAG_FILTER'; payload: string }
  | { type: 'CLEAR_TAG_FILTERS' };

// 初始状态
const initialState: AppState = {
  isLoading: false,
  isMenuOpen: false,
  currentView: 'dashboard',
  searchQuery: '',
  filterOptions: {
    sortBy: 'newest',
    filterByTag: [],
    showFavorites: false,
  },
};

// 创建reducer函数
const appReducer = (state: AppState, action: Action): AppState => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    
    case 'TOGGLE_MENU':
      return { ...state, isMenuOpen: !state.isMenuOpen };
    
    case 'SET_MENU':
      return { ...state, isMenuOpen: action.payload };
    
    case 'SET_VIEW':
      return { ...state, currentView: action.payload };
    
    case 'SET_SEARCH_QUERY':
      return { ...state, searchQuery: action.payload };
    
    case 'SET_SORT_BY':
      return { 
        ...state, 
        filterOptions: { 
          ...state.filterOptions, 
          sortBy: action.payload 
        } 
      };
    
    case 'TOGGLE_FAVORITE_FILTER':
      return { 
        ...state, 
        filterOptions: { 
          ...state.filterOptions, 
          showFavorites: !state.filterOptions.showFavorites 
        } 
      };
    
    case 'ADD_TAG_FILTER':
      // 避免添加重复标签
      if (state.filterOptions.filterByTag.includes(action.payload)) {
        return state;
      }
      return { 
        ...state, 
        filterOptions: { 
          ...state.filterOptions, 
          filterByTag: [...state.filterOptions.filterByTag, action.payload] 
        } 
      };
    
    case 'REMOVE_TAG_FILTER':
      return { 
        ...state, 
        filterOptions: { 
          ...state.filterOptions, 
          filterByTag: state.filterOptions.filterByTag.filter(tag => tag !== action.payload) 
        } 
      };
    
    case 'CLEAR_TAG_FILTERS':
      return { 
        ...state, 
        filterOptions: { 
          ...state.filterOptions, 
          filterByTag: [] 
        } 
      };
    
    default:
      return state;
  }
};

// 创建上下文
interface StateContextType {
  state: AppState;
  dispatch: React.Dispatch<Action>;
}

const StateContext = createContext<StateContextType | undefined>(undefined);

// 创建Provider组件
interface StateProviderProps {
  children: ReactNode;
}

export const StateProvider: React.FC<StateProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, initialState);
  
  // 使用useMemo缓存上下文值，避免不必要的重渲染
  const contextValue = useMemo(() => ({ state, dispatch }), [state]);
  
  return (
    <StateContext.Provider value={contextValue}>
      {children}
    </StateContext.Provider>
  );
};

// 创建自定义Hook
export const useAppState = () => {
  const context = useContext(StateContext);
  if (context === undefined) {
    throw new Error('useAppState must be used within a StateProvider');
  }
  return context;
};

// 导出便捷的action creators
export const actions = {
  setLoading: (isLoading: boolean) => ({ 
    type: 'SET_LOADING' as const, 
    payload: isLoading 
  }),
  
  toggleMenu: () => ({ 
    type: 'TOGGLE_MENU' as const 
  }),
  
  setMenu: (isOpen: boolean) => ({ 
    type: 'SET_MENU' as const, 
    payload: isOpen 
  }),
  
  setView: (view: string) => ({ 
    type: 'SET_VIEW' as const, 
    payload: view 
  }),
  
  setSearchQuery: (query: string) => ({ 
    type: 'SET_SEARCH_QUERY' as const, 
    payload: query 
  }),
  
  setSortBy: (sortBy: string) => ({ 
    type: 'SET_SORT_BY' as const, 
    payload: sortBy 
  }),
  
  toggleFavoriteFilter: () => ({ 
    type: 'TOGGLE_FAVORITE_FILTER' as const 
  }),
  
  addTagFilter: (tag: string) => ({ 
    type: 'ADD_TAG_FILTER' as const, 
    payload: tag 
  }),
  
  removeTagFilter: (tag: string) => ({ 
    type: 'REMOVE_TAG_FILTER' as const, 
    payload: tag 
  }),
  
  clearTagFilters: () => ({ 
    type: 'CLEAR_TAG_FILTERS' as const 
  })
}; 