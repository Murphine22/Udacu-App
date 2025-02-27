import React from 'react';
import { motion } from 'framer-motion';
import { Printer } from 'lucide-react';

interface PrintButtonProps {
  onPrint: () => void;
}

const PrintButton: React.FC<PrintButtonProps> = ({ onPrint }) => {
  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={onPrint}
      className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
    >
      <Printer size={20} className="mr-2" />
      Print
    </motion.button>
  );
};

export default PrintButton;