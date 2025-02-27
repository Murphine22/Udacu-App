import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users } from 'lucide-react';
import { supabase } from '../lib/supabase';

const MemberCount: React.FC = () => {
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

    // Subscribe to changes in the members table
    const channel = supabase
      .channel('member_changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'members' },
        () => fetchMemberCount()
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex items-center space-x-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-lg"
    >
      <Users className="w-5 h-5 text-white" />
      <span className="text-white font-medium">Members:</span>
      <span className="text-white font-bold">{memberCount}</span>
    </motion.div>
  );
};

export default MemberCount;