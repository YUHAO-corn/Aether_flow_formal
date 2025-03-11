import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import App from './App.tsx'
import './index.css'
import AppProviders from './contexts'

// 导入页面组件
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import PromptManager from './pages/PromptManager'
import PromptOptimizer from './pages/PromptOptimizer'
// import ConversationManager from './pages/ConversationManager'
import Settings from './pages/Settings'
import NotFound from './pages/NotFound'

// 导入认证保护组件
import ProtectedRoute from './components/ProtectedRoute'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AppProviders>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<App />}>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="login" element={<Login />} />
            <Route path="register" element={<Register />} />
            
            {/* 受保护的路由 */}
            <Route path="dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="prompts" element={<ProtectedRoute><PromptManager /></ProtectedRoute>} />
            <Route path="optimizer" element={<ProtectedRoute><PromptOptimizer /></ProtectedRoute>} />
            {/* <Route path="conversations" element={<ProtectedRoute><ConversationManager /></ProtectedRoute>} /> */}
            <Route path="settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
            
            {/* 404页面 */}
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AppProviders>
  </React.StrictMode>,
)
