import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users } from 'lucide-react';
import { supabase } from '../lib/supabase';

const MemberCounter: React.FC = () => {
  const [memberCount, setMemberCount] = useState(0);

  useEffect(() => {
    const fetchMemberCount = async () => {
      const { count, error } = await supabase
        .from('members')
        .select('*', { count: 'exact', head: true });
      
      if (error) {
        console.error('Error fetching member count:', error);
        return;
      }

      setMemberCount(count || 0);
    };

    fetchMemberCount();
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex items-center space-x-2 bg-white dark:bg-gray-800 px-4 py-2 rounded-lg shadow-lg"
    >
      <Users className="w-5 h-5 text-blue-600 dark:text-blue-400" />
      <span className="font-medium text-current">Total Members:</span>
      <span className="font-bold text-blue-600 dark:text-blue-400">{memberCount}</span>
    </motion.div>
  );
};

export default MemberCounter