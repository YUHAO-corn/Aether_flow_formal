import React, { createContext, useContext, useState, useCallback } from 'react';
import { Loader } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface LoadingContextType {
  showLoading: (key: string, timeout?: number) => void;
  hideLoading: (key: string) => void;
  isLoading: boolean;
  activeLoadings: Set<string>;
}

interface LoadingProviderProps {
  children: React.ReactNode;
  defaultTimeout?: number;
}

const LoadingContext = createContext<LoadingContextType | null>(null);

export const LoadingProvider: React.FC<LoadingProviderProps> = ({
  children,
  defaultTimeout = 30000, // 30 seconds default timeout
}) => {
  const [loadingStates, setLoadingStates] = useState<Set<string>>(new Set());
  const timeoutRefs = React.useRef<{ [key: string]: NodeJS.Timeout }>({});

  const showLoading = useCallback((key: string, timeout: number = defaultTimeout) => {
    setLoadingStates((prev) => new Set(prev).add(key));

    // Clear existing timeout if any
    if (timeoutRefs.current[key]) {
      clearTimeout(timeoutRefs.current[key]);
    }

    // Set new timeout
    timeoutRefs.current[key] = setTimeout(() => {
      hideLoading(key);
    }, timeout);
  }, [defaultTimeout]);

  const hideLoading = useCallback((key: string) => {
    setLoadingStates((prev) => {
      const newStates = new Set(prev);
      newStates.delete(key);
      return newStates;
    });

    // Clear timeout
    if (timeoutRefs.current[key]) {
      clearTimeout(timeoutRefs.current[key]);
      delete timeoutRefs.current[key];
    }
  }, []);

  // Cleanup timeouts on unmount
  React.useEffect(() => {
    return () => {
      Object.values(timeoutRefs.current).forEach(clearTimeout);
    };
  }, []);

  return (
    <LoadingContext.Provider
      value={{
        showLoading,
        hideLoading,
        isLoading: loadingStates.size > 0,
        activeLoadings: loadingStates,
      }}
    >
      {children}
      <AnimatePresence>
        {loadingStates.size > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/50 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-gray-800 border border-gray-700 rounded-xl p-6 shadow-xl"
            >
              <div className="flex items-center space-x-4">
                <Loader className="w-6 h-6 text-purple-400 animate-spin" />
                <span className="text-gray-200">Loading...</span>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </LoadingContext.Provider>
  );
};

export const useLoading = () => {
  const context = useContext(LoadingContext);
  if (!context) {
    throw new Error('useLoading must be used within a LoadingProvider');
  }
  return context;
};