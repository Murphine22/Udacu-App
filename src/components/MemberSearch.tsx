import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, User, Calendar, DollarSign } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { supabase } from '../lib/supabase';

interface MemberDetails {
  id: string;
  name: string;
  monthly_dues: Array<{ month: number; year: number; amount: number }>;
  contributions: Array<{ amount: number; description: string; created_at: string }>;
  donations: Array<{ amount: number; created_at: string }>;
}

const MemberSearch: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<MemberDetails[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [loading, setLoading] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  const searchMember = async (term: string) => {
    if (!term.trim()) {
      setSearchResults([]);
      return;
    }

    setLoading(true);
    try {
      const { data: members, error: membersError } = await supabase
        .from('members')
        .select('id, name')
        .ilike('name', `%${term}%`);

      if (membersError) throw membersError;

      const memberDetails = await Promise.all((members || []).map(async (member) => {
        const [dues, contributions, donations] = await Promise.all([
          supabase
            .from('monthly_dues')
            .select('month, year, amount')
            .eq('member_id', member.id),
          supabase
            .from('contributions')
            .select('amount, description, created_at')
            .eq('member_id', member.id),
          supabase
            .from('donations')
            .select('amount, created_at')
            .eq('member_id', member.id)
        ]);

        return {
          ...member,
          monthly_dues: dues.data || [],
          contributions: contributions.data || [],
          donations: donations.data || []
        };
      }));

      setSearchResults(memberDetails);
    } catch (error) {
      console.error('Error searching members:', error);
      toast.error('Error searching members');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      searchMember(searchTerm);
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [searchTerm]);

  useEffect(() => {
    // Handle clicks outside of search component to close results
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowResults(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const highlightSearchTerm = (text: string) => {
    if (!searchTerm) return text;
    const parts = text.split(new RegExp(`(${searchTerm})`, 'gi'));
    return parts.map((part, index) => 
      part.toLowerCase() === searchTerm.toLowerCase() ? 
        <span key={index} className="bg-yellow-200 dark:bg-yellow-600 font-semibold">{part}</span> : 
        part
    );
  };

  return (
    <div className="relative w-full max-w-xl" ref={searchRef}>
      <motion.div
        initial={{ scale: 0.95 }}
        animate={{ scale: 1 }}
        className="flex items-center bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden border border-gray-200 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-400 transition-colors"
      >
        <div className="flex-shrink-0 p-3">
          <Search className="w-5 h-5 text-gray-400" />
        </div>
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setShowResults(true);
          }}
          onFocus={() => setShowResults(true)}
          placeholder="Search members..."
          className="w-full bg-transparent border-none focus:outline-none text-gray-700 dark:text-gray-200 placeholder-gray-400 pr-3 py-3"
        />
        {searchTerm && (
          <motion.button
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            onClick={() => {
              setSearchTerm('');
              setSearchResults([]);
              setShowResults(false);
            }}
            className="p-3 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
          >
            <X className="w-4 h-4 text-gray-400" />
          </motion.button>
        )}
      </motion.div>

      <AnimatePresence>
        {showResults && searchTerm && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute z-50 w-full mt-2 bg-white dark:bg-gray-800 rounded-lg shadow-xl max-h-[80vh] overflow-y-auto border border-gray-200 dark:border-gray-700"
          >
            {loading ? (
              <div className="p-4 text-center text-gray-600 dark:text-gray-400">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="inline-block w-6 h-6 border-2 border-gray-300 border-t-blue-500 rounded-full"
                />
                <span className="ml-2">Searching...</span>
              </div>
            ) : searchResults.length > 0 ? (
              searchResults.map((member) => (
                <motion.div
                  key={member.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="p-4 border-b dark:border-gray-700 last:border-0 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
                    <h3 className="text-xl font-bold text-blue-600 dark:text-blue-400 flex items-center">
                      <User className="w-5 h-5 mr-2 text-blue-500" />
                      {highlightSearchTerm(member.name)}
                    </h3>
                    
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center bg-blue-100 dark:bg-blue-900/30 px-3 py-1 rounded-full">
                        <Calendar className="w-4 h-4 mr-1 text-blue-600 dark:text-blue-400" />
                        <span className="text-sm font-medium text-blue-600 dark:text-blue-400">
                          {member.monthly_dues.length} Payments
                        </span>
                      </div>
                      
                      <div className="flex items-center bg-green-100 dark:bg-green-900/30 px-3 py-1 rounded-full">
                        <DollarSign className="w-4 h-4 mr-1 text-green-600 dark:text-green-400" />
                        <span className="text-sm font-medium text-green-600 dark:text-green-400">
                          {member.contributions.length + member.donations.length} Contributions
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    {member.monthly_dues.length > 0 && (
                      <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
                        <h4 className="font-medium text-blue-600 dark:text-blue-400 mb-3 flex items-center">
                          <Calendar className="w-4 h-4 mr-2" />
                          Monthly Dues
                        </h4>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                          {member.monthly_dues.map((due, index) => (
                            <motion.div 
                              key={index} 
                              whileHover={{ y: -2, boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)" }}
                              className="bg-white dark:bg-gray-800 p-2 rounded-lg shadow-sm transition-shadow"
                            >
                              <span className="text-sm text-gray-600 dark:text-gray-400">
                                {new Date(due.year, due.month - 1).toLocaleDateString('default', { month: 'short', year: 'numeric' })}
                              </span>
                              <span className="block font-medium text-current text-lg">₦{due.amount.toLocaleString()}</span>
                            </motion.div>
                          ))}
                        </div>
                      </div>
                    )}

                    {member.contributions.length > 0 && (
                      <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
                        <h4 className="font-medium text-green-600 mb-3 flex items-center">
                          <DollarSign className="w-4 h-4 mr-2" />
                          Contributions
                        </h4>
                        <div className="space-y-2">
                          {member.contributions.map((contribution, index) => (
                            <motion.div 
                              key={index} 
                              whileHover={{ x: 2 }}
                              className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow-sm transition-shadow"
                            >
                              <div className="flex justify-between items-center">
                                <span className="text-current font-medium">{contribution.description}</span>
                                <span className="font-bold text-green-600">₦{contribution.amount.toLocaleString()}</span>
                              </div>
                              <span className="text-sm text-gray-500 dark:text-gray-400">
                                {new Date(contribution.created_at).toLocaleDateString()}
                              </span>
                            </motion.div>
                          ))}
                        </div>
                      </div>
                    )}

                    {member.donations.length > 0 && (
                      <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
                        <h4 className="font-medium text-purple-600 mb-3 flex items-center">
                          <DollarSign className="w-4 h-4 mr-2" />
                          Donations
                        </h4>
                        <div className="space-y-2">
                          {member.donations.map((donation, index) => (
                            <motion.div 
                              key={index}
                              whileHover={{ x: 2 }}
                              className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow-sm transition-shadow"
                            >
                              <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-500 dark:text-gray-400">
                                  {new Date(donation.created_at).toLocaleDateString()}
                                </span>
                                <span className="font-bold text-purple-600">₦{donation.amount.toLocaleString()}</span>
                              </div>
                            </motion.div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="p-4 text-center text-gray-600 dark:text-gray-400">
                No members found matching "{searchTerm}"
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MemberSearch;