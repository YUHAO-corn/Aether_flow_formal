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
    0: { label: 'Very Weak', color: 'bg-red-500', width: '20%' },
    1: { label: 'Weak', color: 'bg-orange-500', width: '40%' },
    2: { label: 'Fair', color: 'bg-yellow-500', width: '60%' },
    3: { label: 'Good', color: 'bg-blue-500', width: '80%' },
    4: { label: 'Strong', color: 'bg-green-500', width: '100%' },
    5: { label: 'Very Strong', color: 'bg-purple-500', width: '100%' }
  };

  const currentStrength = strengthInfo[strength];

  return (
    <div className="space-y-1">
      <div className="h-1 w-full bg-gray-700 rounded-full overflow-hidden">
        <motion.div
          className={`h-full ${currentStrength.color}`}
          initial={{ width: '0%' }}
          animate={{ width: currentStrength.width }}
          transition={{ duration: 0.3 }}
        />
      </div>
      <div className="flex justify-between items-center text-xs">
        <span className={`${strength > 2 ? 'text-green-400' : 'text-gray-400'}`}>
          {currentStrength.label}
        </span>
        {password && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-gray-400"
          >
            {strength < 3 && (
              <ul className="list-disc list-inside">
                {password.length < 8 && <li>At least 8 characters</li>}
                {!/[A-Z]/.test(password) && <li>Include uppercase letter</li>}
                {!/[0-9]/.test(password) && <li>Include number</li>}
                {!/[^A-Za-z0-9]/.test(password) && <li>Include special character</li>}
              </ul>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default PasswordStrengthMeter;