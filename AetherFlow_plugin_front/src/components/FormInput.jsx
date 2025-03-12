import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RiEyeLine, RiEyeOffLine } from 'react-icons/ri';

const FormInput = ({
  type = 'text',
  label,
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
    <div className="space-y-1 form-group">
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
        <input
          type={inputType}
          className={`w-full bg-gray-800/50 border border-gray-700 rounded-lg py-2 px-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-transparent ${
            error ? 'border-red-500' : ''
          } ${className}`}
          placeholder={placeholder}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          {...register}
          {...props}
        />
        
        {showPasswordToggle && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <button
              type="button"
              className="text-gray-400 hover:text-white transition-colors"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <RiEyeOffLine size={18} /> : <RiEyeLine size={18} />}
            </button>
          </div>
        )}
      </div>
      
      <AnimatePresence>
        {error && !label && (
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