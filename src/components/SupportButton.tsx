import React from 'react';
import { motion } from 'framer-motion';
import { HelpCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

const SupportButton: React.FC = () => {
  return (
    <Link to="/support">
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        className="p-4 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 transition-colors"
      >
        <HelpCircle size={24} />
      </motion.button>
    </Link>
  );
};

export default SupportButton;