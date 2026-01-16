import React from 'react';
import { motion } from 'framer-motion';

const backdropVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
};

const modalVariants = {
  hidden: { scale: 0.9, opacity: 0, y: 20 },
  visible: { 
    scale: 1, 
    opacity: 1, 
    y: 0,
    transition: { type: 'spring', stiffness: 300, damping: 25 }
  },
  exit: { scale: 0.95, opacity: 0, y: 20 }
};

export default function Modal({ onClose, children, title }) {
  return (
    <motion.div
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
      variants={backdropVariants}
      initial="hidden"
      animate="visible"
      exit="hidden"
      onClick={onClose} // 1. Close modal on outside click
    >
      <motion.div
        className="bg-white w-full max-w-lg rounded-2xl shadow-xl overflow-hidden"
        variants={modalVariants}
        onClick={(e) => e.stopPropagation()} // Prevent click from closing modal
      >
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-800">{title}</h2>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            &#10005;
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6">
          {children}
        </div>
      </motion.div>
    </motion.div>
  );
}