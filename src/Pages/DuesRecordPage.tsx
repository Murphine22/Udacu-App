import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Edit2, Trash2, X, Check, Printer, ChevronLeft, ChevronRight } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { supabase } from '../lib/supabase';
import MemberCount from '../components/MemberCount';

interface Member {
  id: string;
  name: string;
  dues?: Record<string, boolean>;
}

const DuesRecordPage: React.FC = () => {
  const [members, setMembers] = useState<Member[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [newMember, setNewMember] = useState({ name: '' });
  const [showAddMember, setShowAddMember] = useState(false);
  const [editingMember, setEditingMember] = useState<{ id: string; name: string } | null>(null);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  useEffect(() => {
    checkAdminStatus();
    loadMembers();
  }, [selectedYear]);

  const checkAdminStatus = async () => {
    try {
      const { data, error } = await supabase.rpc('check_admin_status');
      if (error) throw error;
      setIsAdmin(data || false);
    } catch (error) {
      console.error('Error checking admin status:', error);
    }
  };

  const loadMembers = async () => {
    try {
      const { data: membersData, error: membersError } = await supabase
        .from('members')
        .select('*')
        .order('name');

      if (membersError) throw membersError;

      const { data: duesData, error: duesError } = await supabase
        .from('monthly_dues')
        .select('*')
        .eq('year', selectedYear);

      if (duesError) throw duesError;

      const membersWithDues = membersData.map(member => ({
        ...member,
        dues: duesData
          .filter(due => due.member_id === member.id)
          .reduce((acc, due) => ({
            ...acc,
            [due.month]: true
          }), {})
      }));

      setMembers(membersWithDues);
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAddMember = async () => {
    if (!newMember.name.trim()) {
      toast.error('Please enter member name');
      return;
    }

    const isDuplicate = members.some(
      member => member.name.toLowerCase() === newMember.name.toLowerCase()
    );

    if (isDuplicate) {
      toast.error('A member with this name already exists');
      return;
    }

    try {
      const { data, error } = await supabase
        .from('members')
        .insert([{
          name: newMember.name,
          created_by: (await supabase.auth.getUser()).data.user?.id
        }])
        .select()
        .single();

      if (error) throw error;

      setMembers([...members, { ...data, dues: {} }]);
      setNewMember({ name: '' });
      setShowAddMember(false);
      toast.success('Member added successfully');
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handleEditMember = async () => {
    if (!editingMember) return;

    if (!editingMember.name.trim()) {
      toast.error('Please enter member name');
      return;
    }

    const isDuplicate = members.some(
      member => member.id !== editingMember.id && 
                member.name.toLowerCase() === editingMember.name.toLowerCase()
    );

    if (isDuplicate) {
      toast.error('A member with this name already exists');
      return;
    }

    try {
      const { error } = await supabase
        .from('members')
        .update({ name: editingMember.name })
        .eq('id', editingMember.id);

      if (error) throw error;

      await loadMembers();
      setEditingMember(null);
      toast.success('Member updated successfully');
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handleDeleteMember = async (memberId: string) => {
    if (!window.confirm('Are you sure you want to delete this member? This action cannot be undone.')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('members')
        .delete()
        .eq('id', memberId);

      if (error) throw error;

      setMembers(members.filter(m => m.id !== memberId));
      toast.success('Member deleted successfully');
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const toggleDues = async (memberId: string, month: number) => {
    try {
      const member = members.find(m => m.id === memberId);
      const isPaid = member?.dues?.[month];

      if (isPaid) {
        const { error } = await supabase
          .from('monthly_dues')
          .delete()
          .eq('member_id', memberId)
          .eq('month', month)
          .eq('year', selectedYear);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('monthly_dues')
          .insert([{
            member_id: memberId,
            month,
            year: selectedYear,
            recorded_by: (await supabase.auth.getUser()).data.user?.id
          }]);

        if (error) throw error;
      }

      await loadMembers();
      toast.success(isPaid ? 'Payment record removed' : 'Payment recorded');
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const calculateTotal = (memberDues: Record<string, boolean> = {}) => {
    return Object.values(memberDues).filter(Boolean).length * 500;
  };

  const handlePrint = () => {
    window.print();
  };

  const handleYearChange = (increment: number) => {
    setSelectedYear(prev => prev + increment);
  };

  if (loading) {
    return <div className="flex justify-center items-center h-96">Loading...</div>;
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen p-4"
    >
      <div className="max-w-full mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div className="space-y-4">
            <h1 className="text-3xl font-bold text-blue-600 dark:text-blue-400">Monthly Dues Record</h1>
            <MemberCount />
          </div>
          <div className="flex space-x-4">
            {isAdmin && (
              <>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowAddMember(!showAddMember)}
                  className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  <Plus size={20} className="mr-2" />
                  Add Member
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handlePrint}
                  className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 print:hidden"
                >
                  <Printer size={20} className="mr-2" />
                  Print Record
                </motion.button>
              </>
            )}
          </div>
        </div>

        {/* Year Selection */}
        <div className="flex justify-center items-center space-x-4 mb-6">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => handleYearChange(-1)}
            className="p-2 bg-gray-200 dark:bg-gray-700 rounded-full"
          >
            <ChevronLeft size={20} />
          </motion.button>
          <span className="text-xl font-semibold text-current">{selectedYear}</span>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => handleYearChange(1)}
            className="p-2 bg-gray-200 dark:bg-gray-700 rounded-full"
          >
            <ChevronRight size={20} />
          </motion.button>
        </div>

        {showAddMember && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 bg-white dark:bg-gray-800 rounded-lg shadow-md"
          >
            <div className="flex gap-4">
              <input
                type="text"
                placeholder="Member Name"
                value={newMember.name}
                onChange={(e) => setNewMember({ name: e.target.value })}
                className="flex-1 px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
              <button
                onClick={handleAddMember}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                Save Member
              </button>
            </div>
          </motion.div>
        )}

        <div className="overflow-x-auto">
          <table className="min-w-full bg-white dark:bg-gray-800 rounded-lg shadow-md">
            <thead>
              <tr className="bg-gray-100 dark:bg-gray-700">
                <th className="sticky left-0 bg-gray-100 dark:bg-gray-700 px-4 py-2 text-current">S/N</th>
                <th className="sticky left-12 bg-gray-100 dark:bg-gray-700 px-4 py-2 text-current">Name</th>
                {months.map(month => (
                  <th key={month} className="px-4 py-2 text-center text-current">{month}</th>
                ))}
                <th className="px-4 py-2 text-center text-current">Total (₦)</th>
                {isAdmin && <th className="px-4 py-2 text-center text-current">Actions</th>}
              </tr>
            </thead>
            <tbody>
              {members.map((member, index) => (
                <tr key={member.id} className="border-t dark:border-gray-700">
                  <td className="sticky left-0 bg-white dark:bg-gray-800 px-4 py-2 text-current">{index + 1}</td>
                  <td className="sticky left-12 bg-white dark:bg-gray-800 px-4 py-2 text-current">
                    {editingMember?.id === member.id ? (
                      <div className="flex items-center space-x-2">
                        <input
                          type="text"
                          value={editingMember.name}
                          onChange={(e) => setEditingMember({ ...editingMember, name: e.target.value })}
                          className="px-2 py-1 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        />
                        <button
                          onClick={handleEditMember}
                          className="p-1 text-green-600 hover:text-green-700"
                        >
                          <Check size={16} />
                        </button>
                        <button
                          onClick={() => setEditingMember(null)}
                          className="p-1 text-red-600 hover:text-red-700"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    ) : (
                      member.name
                    )}
                  </td>
                  {months.map((_, monthIndex) => (
                    <td key={monthIndex} className="px-4 py-2 text-center">
                      <input
                        type="checkbox"
                        checked={member.dues?.[monthIndex + 1] || false}
                        onChange={() => isAdmin && toggleDues(member.id, monthIndex + 1)}
                        disabled={!isAdmin}
                        className="w-4 h-4 text-blue-600 dark:text-blue-400 rounded focus:ring-blue-500"
                      />
                    </td>
                  ))}
                  <td className="px-4 py-2 text-center font-semibold text-current">
                    ₦{calculateTotal(member.dues).toLocaleString()}
                  </td>
                  {isAdmin && (
                    <td className="px-4 py-2 text-center">
                      <div className="flex items-center justify-center space-x-2">
                        <button
                          onClick={() => setEditingMember({ id: member.id, name: member.name })}
                          className="p-1 text-blue-600 hover:text-blue-700"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={() => handleDeleteMember(member.id)}
                          className="p-1 text-red-600 hover:text-red-700"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </motion.div>
  );
};

export default DuesRecordPage;