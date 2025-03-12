import React from 'react';
import { motion } from 'framer-motion';

const PasswordStrengthMeter = ({ password }) => {
  const calculateStrength = (pass) => {
    let strength = 0;
    
    if (!pass) return strength;
    
    // Length check
    if (pass.length >= 8) strength += 1;
    if (pass.length >= 12) strength += 1;
    
    // Character type checks
    if (/[A-Z]/.test(pass)) strength += 1;
    if (/[0-9]/.test(pass)) strength += 1;
    if (/[^A-Za-z0-9]/.test(pass)) strength += 1;
    
    return strength;
  };

  const strength = calculateStrength(password);
  
  const strengthInfo = {
    0: { label: '非常弱', color: 'bg-red-500', width: '20%' },
    1: { label: '弱', color: 'bg-orange-500', width: '40%' },
    2: { label: '一般', color: 'bg-yellow-500', width: '60%' },
    3: { label: '良好', color: 'bg-blue-500', width: '80%' },
    4: { label: '强', color: 'bg-green-500', width: '100%' },
    5: { label: '非常强', color: 'bg-purple-500', width: '100%' }
  };

  const currentStrength = strengthInfo[strength];

  return (
    <div className="space-y-2 mb-4">
      <div className="h-1.5 w-full bg-gray-700 rounded-full overflow-hidden">
        <motion.div
          className={`h-full ${currentStrength.color}`}
          initial={{ width: '0%' }}
          animate={{ width: currentStrength.width }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        />
      </div>
      <div className="flex justify-between items-start text-xs">
        <span className={`${strength > 2 ? 'text-green-400' : 'text-gray-400'}`}>
          {currentStrength.label}
        </span>
        {password && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-gray-400 text-right"
          >
            {strength < 3 && (
              <ul className="list-none space-y-1">
                {password.length < 8 && <li className="text-red-400">• 至少8个字符</li>}
                {!/[A-Z]/.test(password) && <li className="text-red-400">• 包含大写字母</li>}
                {!/[0-9]/.test(password) && <li className="text-red-400">• 包含数字</li>}
                {!/[^A-Za-z0-9]/.test(password) && <li className="text-red-400">• 包含特殊字符</li>}
              </ul>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default PasswordStrengthMeter;