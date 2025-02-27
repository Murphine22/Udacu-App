import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { supabase } from '../lib/supabase';

interface FinancialSummaryProps {
  isAdmin: boolean;
  selectedYear: number;
}

interface Transaction {
  id: string;
  amount: number;
  description?: string;
  member_name?: string;
  created_at: string;
}

const FinancialSummary: React.FC<FinancialSummaryProps> = ({ isAdmin, selectedYear }) => {
  const [totalDues, setTotalDues] = useState(0);
  const [contributions, setContributions] = useState<Transaction[]>([]);
  const [donations, setDonations] = useState<Transaction[]>([]);
  const [expenses, setExpenses] = useState<Transaction[]>([]);
  const [showAddForm, setShowAddForm] = useState<'contribution' | 'donation' | 'expense' | null>(null);
  const [newTransaction, setNewTransaction] = useState({
    amount: '',
    description: '',
    member_id: ''
  });
  const [members, setMembers] = useState<{ id: string; name: string }[]>([]);

  useEffect(() => {
    loadFinancialData();
    loadMembers();
  }, [selectedYear]);

  const loadMembers = async () => {
    const { data, error } = await supabase
      .from('members')
      .select('id, name')
      .order('name');
    
    if (error) {
      toast.error('Error loading members');
      return;
    }
    
    setMembers(data || []);
  };

  const loadFinancialData = async () => {
    try {
      // Load total dues for the selected year
      const { data: duesData, error: duesError } = await supabase
        .from('monthly_dues')
        .select('amount')
        .eq('year', selectedYear);
      
      if (duesError) throw duesError;
      const totalDuesAmount = (duesData || []).reduce((sum, due) => sum + (due.amount || 500), 0);
      setTotalDues(totalDuesAmount);

      // Load contributions for the selected year
      const startDate = `${selectedYear}-01-01`;
      const endDate = `${selectedYear}-12-31`;

      const { data: contributionsData, error: contributionsError } = await supabase
        .from('contributions')
        .select('*, members(name)')
        .gte('created_at', startDate)
        .lte('created_at', endDate)
        .order('created_at', { ascending: false });
      
      if (contributionsError) throw contributionsError;
      setContributions(contributionsData.map(c => ({
        ...c,
        member_name: c.members?.name
      })));

      // Load donations for the selected year
      const { data: donationsData, error: donationsError } = await supabase
        .from('donations')
        .select('*, members(name)')
        .gte('created_at', startDate)
        .lte('created_at', endDate)
        .order('created_at', { ascending: false });
      
      if (donationsError) throw donationsError;
      setDonations(donationsData.map(d => ({
        ...d,
        member_name: d.members?.name
      })));

      // Load expenses for the selected year
      const { data: expensesData, error: expensesError } = await supabase
        .from('expenses')
        .select('*')
        .gte('created_at', startDate)
        .lte('created_at', endDate)
        .order('created_at', { ascending: false });
      
      if (expensesError) throw expensesError;
      setExpenses(expensesData);

    } catch (error: any) {
      toast.error('Error loading financial data');
    }
  };

  const handleAddTransaction = async () => {
    try {
      const amount = parseInt(newTransaction.amount);
      if (!amount || amount <= 0) {
        toast.error('Please enter a valid amount');
        return;
      }

      if (showAddForm === 'expense' && !newTransaction.description) {
        toast.error('Please enter a description');
        return;
      }

      if ((showAddForm === 'contribution' || showAddForm === 'donation') && !newTransaction.member_id) {
        toast.error('Please select a member');
        return;
      }

      const table = {
        contribution: 'contributions',
        donation: 'donations',
        expense: 'expenses'
      }[showAddForm!];

      const { error } = await supabase
        .from(table)
        .insert([{
          amount,
          description: newTransaction.description,
          member_id: ['contribution', 'donation'].includes(showAddForm!) ? newTransaction.member_id : undefined
        }]);

      if (error) throw error;

      toast.success('Transaction added successfully');
      setNewTransaction({ amount: '', description: '', member_id: '' });
      setShowAddForm(null);
      loadFinancialData();
    } catch (error: any) {
      toast.error('Error adding transaction');
    }
  };

  const handleDelete = async (type: string, id: string) => {
    try {
      const { error } = await supabase
        .from(type)
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast.success('Transaction deleted successfully');
      loadFinancialData();
    } catch (error: any) {
      toast.error('Error deleting transaction');
    }
  };

  const totalIncome = totalDues +
    contributions.reduce((sum, c) => sum + c.amount, 0) +
    donations.reduce((sum, d) => sum + d.amount, 0);
  
  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
  const netBalance = totalIncome - totalExpenses;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg"
        >
          <h3 className="text-lg font-semibold mb-2 text-current">Total Income</h3>
          <p className="text-2xl font-bold text-green-600">₦{totalIncome.toLocaleString()}</p>
          <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            <div>Monthly Dues: ₦{totalDues.toLocaleString()}</div>
            <div>Contributions: ₦{contributions.reduce((sum, c) => sum + c.amount, 0).toLocaleString()}</div>
            <div>Donations: ₦{donations.reduce((sum, d) => sum + d.amount, 0).toLocaleString()}</div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg"
        >
          <h3 className="text-lg font-semibold mb-2 text-current">Total Expenses</h3>
          <p className="text-2xl font-bold text-red-600">₦{totalExpenses.toLocaleString()}</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg"
        >
          <h3 className="text-lg font-semibold mb-2 text-current">Net Balance</h3>
          <p className={`text-2xl font-bold ${netBalance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            ₦{netBalance.toLocaleString()}
          </p>
        </motion.div>
      </div>

      {isAdmin && (
        <div className="flex space-x-4">
          <button
            onClick={() => setShowAddForm('contribution')}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Add Contribution
          </button>
          <button
            onClick={() => setShowAddForm('donation')}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            Add Donation
          </button>
          <button
            onClick={() => setShowAddForm('expense')}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            Add Expense
          </button>
        </div>
      )}

      {showAddForm && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg"
        >
          <h3 className="text-lg font-semibold mb-4 text-current">
            Add {showAddForm.charAt(0).toUpperCase() + showAddForm.slice(1)}
          </h3>
          <div className="space-y-4">
            {(showAddForm === 'contribution' || showAddForm === 'donation') && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Member</label>
                <select
                  value={newTransaction.member_id}
                  onChange={(e) => setNewTransaction({ ...newTransaction, member_id: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                >
                  <option value="">Select Member</option>
                  {members.map(member => (
                    <option key={member.id} value={member.id}>{member.name}</option>
                  ))}
                </select>
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Amount (₦)</label>
              <input
                type="number"
                value={newTransaction.amount}
                onChange={(e) => setNewTransaction({ ...newTransaction, amount: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>
            {(showAddForm === 'contribution' || showAddForm === 'expense') && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Description</label>
                <textarea
                  value={newTransaction.description}
                  onChange={(e) => setNewTransaction({ ...newTransaction, description: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>
            )}
            <div className="flex space-x-4">
              <button
                onClick={handleAddTransaction}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Add
              </button>
              <button
                onClick={() => setShowAddForm(null)}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
              >
                Cancel
              </button>
            </div>
          </div>
        </motion.div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg"
        >
          <h3 className="text-lg font-semibold mb-4 text-current">Recent Contributions</h3>
          <div className="space-y-4">
            {contributions.map(contribution => (
              <div key={contribution.id} className="flex justify-between items-start border-b dark:border-gray-700 pb-2">
                <div>
                  <p className="font-medium text-current">{contribution.member_name}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{contribution.description}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {new Date(contribution.created_at).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="font-semibold text-green-600">₦{contribution.amount.toLocaleString()}</span>
                  {isAdmin && (
                    <button
                      onClick={() => handleDelete('contributions', contribution.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg"
        >
          <h3 className="text-lg font-semibold mb-4 text-current">Recent Donations</h3>
          <div className="space-y-4">
            {donations.map(donation => (
              <div key={donation.id} className="flex justify-between items-start border-b dark:border-gray-700 pb-2">
                <div>
                  <p className="font-medium text-current">{donation.member_name}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {new Date(donation.created_at).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="font-semibold text-green-600">₦{donation.amount.toLocaleString()}</span>
                  {isAdmin && (
                    <button
                      onClick={() => handleDelete('donations', donation.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg md:col-span-2"
        >
          <h3 className="text-lg font-semibold mb-4 text-current">Recent Expenses</h3>
          <div className="space-y-4">
            {expenses.map(expense => (
              <div key={expense.id} className="flex justify-between items-start border-b dark:border-gray-700 pb-2">
                <div>
                  <p className="font-medium text-current">{expense.description}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {new Date(expense.created_at).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="font-semibold text-red-600">₦{expense.amount.toLocaleString()}</span>
                  {isAdmin && (
                    <button
                      onClick={() => handleDelete('expenses', expense.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default FinancialSummary;