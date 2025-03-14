import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface ModalProps {
  children: React.ReactNode;
  onClose: () => void;
}

const Modal: React.FC<ModalProps> = ({ children, onClose }) => {
  const modalRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    
    const handleClickOutside = (e: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    
    document.addEventListener('keydown', handleEscape);
    document.addEventListener('mousedown', handleClickOutside);
    
    // Prevent scrolling on the body when modal is open
    document.body.style.overflow = 'hidden';
    
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.removeEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = 'auto';
    };
  }, [onClose]);
  
  return (
    <motion.div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm"
      initial={{ backgroundColor: 'rgba(0, 0, 0, 0)' }}
      animate={{ backgroundColor: 'rgba(0, 0, 0, 0.7)' }}
      exit={{ backgroundColor: 'rgba(0, 0, 0, 0)' }}
    >
      <motion.div 
        ref={modalRef}
        className="bg-gray-800 border border-gray-700 rounded-xl shadow-2xl shadow-purple-900/20 max-w-4xl w-full max-h-[90vh] overflow-auto"
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
      >
        {children}
      </motion.div>
    </motion.div>
  );
};

export default Modal;