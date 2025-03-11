import React, { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { NotificationProvider } from './contexts/NotificationContext';
import Layout from './components/Layout';
import LoadingScreen from './components/LoadingScreen';

// 懒加载路由组件
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const PromptLibrary = lazy(() => import('./pages/PromptLibrary'));
const PromptEditor = lazy(() => import('./pages/PromptEditor'));
const PromptOptimizer = lazy(() => import('./pages/PromptOptimizer'));
const PromptTester = lazy(() => import('./pages/PromptTester'));
const Settings = lazy(() => import('./pages/Settings'));
const Profile = lazy(() => import('./pages/Profile'));
const Analytics = lazy(() => import('./pages/Analytics'));
const NotFound = lazy(() => import('./pages/NotFound'));

// 路由守卫组件
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const isAuthenticated = localStorage.getItem('token') !== null;
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" />;
};

const PublicRoute = ({ children }: { children: React.ReactNode }) => {
  const isAuthenticated = localStorage.getItem('token') !== null;
  return isAuthenticated ? <Navigate to="/dashboard" /> : <>{children}</>;
};

function App() {
  return (
    <ThemeProvider>
      <NotificationProvider>
        <AuthProvider>
          <Router>
            <Suspense fallback={<LoadingScreen />}>
              <Routes>
                {/* 公共路由 */}
                <Route 
                  path="/login" 
                  element={
                    <PublicRoute>
                      <Login />
                    </PublicRoute>
                  } 
                />
                <Route 
                  path="/register" 
                  element={
                    <PublicRoute>
                      <Register />
                    </PublicRoute>
                  } 
                />
                
                {/* 受保护路由 */}
                <Route element={<Layout />}>
                  <Route 
                    path="/dashboard" 
                    element={
                      <ProtectedRoute>
                        <Dashboard />
                      </ProtectedRoute>
                    } 
                  />
                  <Route 
                    path="/prompts" 
                    element={
                      <ProtectedRoute>
                        <PromptLibrary />
                      </ProtectedRoute>
                    } 
                  />
                  <Route 
                    path="/editor" 
                    element={
                      <ProtectedRoute>
                        <PromptEditor />
                      </ProtectedRoute>
                    } 
                  />
                  <Route 
                    path="/editor/:id" 
                    element={
                      <ProtectedRoute>
                        <PromptEditor />
                      </ProtectedRoute>
                    } 
                  />
                  <Route 
                    path="/optimizer" 
                    element={
                      <ProtectedRoute>
                        <PromptOptimizer />
                      </ProtectedRoute>
                    } 
                  />
                  <Route 
                    path="/tester" 
                    element={
                      <ProtectedRoute>
                        <PromptTester />
                      </ProtectedRoute>
                    } 
                  />
                  <Route 
                    path="/analytics" 
                    element={
                      <ProtectedRoute>
                        <Analytics />
                      </ProtectedRoute>
                    } 
                  />
                  <Route 
                    path="/settings" 
                    element={
                      <ProtectedRoute>
                        <Settings />
                      </ProtectedRoute>
                    } 
                  />
                  <Route 
                    path="/profile" 
                    element={
                      <ProtectedRoute>
                        <Profile />
                      </ProtectedRoute>
                    } 
                  />
                </Route>
                
                {/* 重定向和404 */}
                <Route path="/" element={<Navigate to="/dashboard" />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
          </Router>
        </AuthProvider>
      </NotificationProvider>
    </ThemeProvider>
  );
}

export default App;