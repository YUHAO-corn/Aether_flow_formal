import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RiEyeLine, RiEyeOffLine } from 'react-icons/ri';

const FormInput = ({
  type = 'text',
  label,
  icon: Icon,
  error,
  register,
  validation,
  placeholder,
  className = '',
  showPasswordToggle = false,
  ...props
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  const inputType = showPasswordToggle ? (showPassword ? 'text' : 'password') : type;

  return (
    <div className="space-y-1">
      {label && (
        <label className="text-sm text-gray-300 flex items-center justify-between">
          <span>{label}</span>
          {error && (
            <motion.span
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="text-red-400 text-xs"
            >
              {error}
            </motion.span>
          )}
        </label>
      )}
      
      <div className="relative">
        {Icon && (
          <Icon className={`absolute left-3 top-1/2 -translate-y-1/2 ${
            error ? 'text-red-400' : isFocused ? 'text-purple-400' : 'text-gray-400'
          }`} />
        )}
        
        <input
          type={inputType}
          className={`w-full bg-gray-700/50 border ${
            error 
              ? 'border-red-500/50 focus:ring-red-500/50' 
              : 'border-gray-600 focus:ring-purple-500/50'
          } rounded-lg py-2 ${Icon ? 'pl-10' : 'pl-4'} pr-${showPasswordToggle ? '10' : '4'} 
          text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:border-transparent
          ${className}`}
          placeholder={placeholder}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          {...register}
          {...props}
        />
        
        {showPasswordToggle && (
          <button
            type="button"
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-300"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? <RiEyeOffLine /> : <RiEyeLine />}
          </button>
        )}
      </div>
      
      <AnimatePresence>
        {error && (
          <motion.p
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="text-xs text-red-400 mt-1"
          >
            {error}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
};

export default FormInput;