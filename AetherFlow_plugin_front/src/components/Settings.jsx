import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { 
  RiSettings4Line, 
  RiSaveLine, 
  RiLightbulbLine,
  RiMailSendLine,
  RiInformationLine,
  RiUserLine,
  RiLockLine,
  RiMailLine,
  RiPhoneLine,
  RiLogoutBoxLine
} from 'react-icons/ri';
import FormInput from './FormInput';
import PasswordStrengthMeter from './PasswordStrengthMeter';
import UserAvatar from './UserAvatar';
import { loginSchema, registerSchema, emailSchema } from '../utils/validation';

const Settings = ({ 
  reducedMotion, 
  autoSaveEnabled, 
  setAutoSaveEnabled,
  smartSuggestionsEnabled,
  setSmartSuggestionsEnabled,
  user,
  isAuthenticated,
  onLogin,
  onRegister,
  onLogout,
  className = ''
}) => {
  const [feedbackText, setFeedbackText] = useState('');
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);
  const [activeSettingsTab, setActiveSettingsTab] = useState('features');
  const [authMode, setAuthMode] = useState('login');
  const [forgotPassword, setForgotPassword] = useState(false);
  
  // Login form
  const { 
    register: registerLogin, 
    handleSubmit: handleLoginSubmit, 
    formState: { errors: loginErrors } 
  } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      identifier: '',
      password: '',
      rememberMe: true
    }
  });

  // Register form
  const { 
    register: registerSignup, 
    handleSubmit: handleSignupSubmit, 
    formState: { errors: signupErrors },
    watch: watchSignup
  } = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: '',
      email: '',
      password: '',
      confirmPassword: '',
      phone: ''
    }
  });

  // Forgot password form
  const { 
    register: registerForgot, 
    handleSubmit: handleForgotSubmit, 
    formState: { errors: forgotErrors } 
  } = useForm({
    resolver: zodResolver(emailSchema),
    defaultValues: {
      email: ''
    }
  });

  // Watch password input to show password strength
  const password = watchSignup ? watchSignup('password') : '';

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

  const onLoginSubmit = (data) => {
    console.log('Login data:', data);
    // Simulate successful login
    onLogin({
      username: data.identifier,
      email: data.identifier.includes('@') ? data.identifier : `${data.identifier}@example.com`
    });
  };

  const onSignupSubmit = (data) => {
    console.log('Signup data:', data);
    // Simulate successful registration
    onRegister({
      username: data.username,
      email: data.email
    });
  };

  const onForgotSubmit = (data) => {
    console.log('Forgot password data:', data);
    // Simulate sending reset password email
    alert(`Password reset link has been sent to ${data.email}`);
    setForgotPassword(false);
    setAuthMode('login');
  };
  
  return (
    <div className={`space-y-6 ${className}`}>
      <div className="flex items-center space-x-2 mb-4">
        <RiSettings4Line className="text-purple-400" size={20} />
        <h2 className="text-xl font-semibold text-white">Settings</h2>
      </div>
      
      {/* Settings tabs */}
      <div className="flex space-x-2 border-b border-gray-700 mb-4">
        <button
          className={`px-4 py-2 text-sm ${activeSettingsTab === 'features' ? 'text-purple-400 border-b-2 border-purple-400' : 'text-gray-400 hover:text-gray-200'}`}
          onClick={() => setActiveSettingsTab('features')}
        >
          Features
        </button>
        <button
          className={`px-4 py-2 text-sm ${activeSettingsTab === 'account' ? 'text-purple-400 border-b-2 border-purple-400' : 'text-gray-400 hover:text-gray-200'}`}
          onClick={() => setActiveSettingsTab('account')}
        >
          Account
        </button>
        <button
          className={`px-4 py-2 text-sm ${activeSettingsTab === 'feedback' ? 'text-purple-400 border-b-2 border-purple-400' : 'text-gray-400 hover:text-gray-200'}`}
          onClick={() => setActiveSettingsTab('feedback')}
        >
          Feedback
        </button>
      </div>
      
      <div className="space-y-4">
        {/* Features settings */}
        {activeSettingsTab === 'features' && (
          <div className="p-4 bg-gray-800/50 border border-gray-700 rounded-lg">
            <h3 className="font-medium text-white mb-4">Features</h3>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <RiSaveLine className="text-blue-400" />
                  <div>
                    <p className="text-gray-200">Auto-Save</p>
                    <p className="text-xs text-gray-400">Automatically save your prompts</p>
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
                    <p className="text-gray-200">Smart Suggestions</p>
                    <p className="text-xs text-gray-400">Get AI-powered suggestions</p>
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
        )}

        {/* Account settings */}
        {activeSettingsTab === 'account' && (
          <div className="p-4 bg-gray-800/50 border border-gray-700 rounded-lg">
            <h3 className="font-medium text-white mb-4">Account</h3>
            
            {isAuthenticated ? (
              <div className="space-y-4">
                <div className="flex items-center space-x-4">
                  <UserAvatar user={user} size="lg" />
                  <div>
                    <h4 className="text-lg font-medium text-white">{user.username}</h4>
                    <p className="text-sm text-gray-400">{user.email}</p>
                  </div>
                </div>
                
                <button
                  onClick={onLogout}
                  className="flex items-center space-x-2 px-4 py-2 bg-red-600/20 text-red-400 rounded-lg hover:bg-red-600/30 transition-colors"
                >
                  <RiLogoutBoxLine />
                  <span>Logout</span>
                </button>
              </div>
            ) : (
              <div>
                {!forgotPassword ? (
                  <div className="space-y-4">
                    {/* Login/Register toggle */}
                    <div className="flex rounded-lg overflow-hidden">
                      <button
                        className={`flex-1 py-2 text-center ${authMode === 'login' ? 'bg-purple-600 text-white' : 'bg-gray-700 text-gray-300'}`}
                        onClick={() => setAuthMode('login')}
                      >
                        Login
                      </button>
                      <button
                        className={`flex-1 py-2 text-center ${authMode === 'register' ? 'bg-purple-600 text-white' : 'bg-gray-700 text-gray-300'}`}
                        onClick={() => setAuthMode('register')}
                      >
                        Register
                      </button>
                    </div>
                    
                    {/* Login form */}
                    {authMode === 'login' && (
                      <form onSubmit={handleLoginSubmit(onLoginSubmit)} className="space-y-4">
                        <FormInput
                          label="Username or Email"
                          icon={RiUserLine}
                          placeholder="Enter username or email"
                          register={registerLogin('identifier')}
                          error={loginErrors.identifier?.message}
                        />
                        
                        <FormInput
                          type="password"
                          label="Password"
                          icon={RiLockLine}
                          placeholder="Enter password"
                          register={registerLogin('password')}
                          error={loginErrors.password?.message}
                          showPasswordToggle
                        />
                        
                        <div className="flex items-center justify-between">
                          <label className="flex items-center space-x-2 text-sm text-gray-300">
                            <input
                              type="checkbox"
                              className="rounded bg-gray-700 border-gray-600 text-purple-600 focus:ring-purple-500"
                              {...registerLogin('rememberMe')}
                            />
                            <span>Remember me</span>
                          </label>
                          
                          <button
                            type="button"
                            className="text-sm text-purple-400 hover:text-purple-300"
                            onClick={() => setForgotPassword(true)}
                          >
                            Forgot password?
                          </button>
                        </div>
                        
                        <button
                          type="submit"
                          className="w-full py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 transition-colors"
                        >
                          Login
                        </button>
                      </form>
                    )}
                    
                    {/* Register form */}
                    {authMode === 'register' && (
                      <form onSubmit={handleSignupSubmit(onSignupSubmit)} className="space-y-4">
                        <FormInput
                          label="Username"
                          icon={RiUserLine}
                          placeholder="Choose username"
                          register={registerSignup('username')}
                          error={signupErrors.username?.message}
                        />
                        
                        <FormInput
                          label="Email"
                          icon={RiMailLine}
                          placeholder="Enter email"
                          register={registerSignup('email')}
                          error={signupErrors.email?.message}
                        />
                        
                        <FormInput
                          type="password"
                          label="Password"
                          icon={RiLockLine}
                          placeholder="Create password"
                          register={registerSignup('password')}
                          error={signupErrors.password?.message}
                          showPasswordToggle
                        />
                        
                        <PasswordStrengthMeter password={password} />
                        
                        <FormInput
                          type="password"
                          label="Confirm Password"
                          icon={RiLockLine}
                          placeholder="Confirm password"
                          register={registerSignup('confirmPassword')}
                          error={signupErrors.confirmPassword?.message}
                          showPasswordToggle
                        />
                        
                        <FormInput
                          label="Phone (optional)"
                          icon={RiPhoneLine}
                          placeholder="Enter phone number"
                          register={registerSignup('phone')}
                          error={signupErrors.phone?.message}
                        />
                        
                        <button
                          type="submit"
                          className="w-full py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 transition-colors"
                        >
                          Register
                        </button>
                      </form>
                    )}
                  </div>
                ) : (
                  <div className="space-y-4">
                    <h4 className="text-lg font-medium text-white">Reset Password</h4>
                    <p className="text-sm text-gray-300">
                      Enter your email and we'll send you a password reset link.
                    </p>
                    
                    <form onSubmit={handleForgotSubmit(onForgotSubmit)} className="space-y-4">
                      <FormInput
                        label="Email"
                        icon={RiMailLine}
                        placeholder="Enter email"
                        register={registerForgot('email')}
                        error={forgotErrors.email?.message}
                      />
                      
                      <div className="flex space-x-3">
                        <button
                          type="button"
                          className="flex-1 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
                          onClick={() => setForgotPassword(false)}
                        >
                          Back
                        </button>
                        <button
                          type="submit"
                          className="flex-1 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 transition-colors"
                        >
                          Send
                        </button>
                      </div>
                    </form>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
        
        {/* Feedback settings */}
        {activeSettingsTab === 'feedback' && (
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
        )}
        
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