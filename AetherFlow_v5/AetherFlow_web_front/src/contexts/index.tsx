import React, { ReactNode } from 'react';
import { AuthProvider } from './AuthContext';
export { useAuth } from './AuthContext';

interface AppProvidersProps {
  children: ReactNode;
}

// 应用上下文提供者组件，包装所有上下文提供者
const AppProviders: React.FC<AppProvidersProps> = ({ children }) => {
  return (
    <AuthProvider>
      {children}
    </AuthProvider>
  );
};

export default AppProviders; 