import React from 'react';
import { motion } from 'framer-motion';
import { CreditCard, Copy, CheckCircle } from 'lucide-react';
import { toast } from 'react-hot-toast';

const BankDetails: React.FC = () => {
  const [copied, setCopied] = React.useState<string | null>(null);
  
  const bankAccounts = [
    {
      bank: 'Standard Chartered Bank',
      accountName: 'Arome And Rosemary',
      accountNumber: '0004926342',
      accountType: 'Current Account'
    },
  ];

  const handleCopy = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    setCopied(type);
    toast.success(`${type} copied to clipboard!`);
    
    setTimeout(() => {
      setCopied(null);
    }, 2000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6"
    >
      <h2 className="text-2xl font-semibold mb-6 flex items-center text-current">
        <CreditCard className="w-6 h-6 text-blue-500 mr-2" />
        Bank Account Details
      </h2>
      <div className="space-y-6">
        {bankAccounts.map((account) => (
          <motion.div
            key={account.accountNumber}
            whileHover={{ y: -5 }}
            transition={{ duration: 0.3 }}
            className="border dark:border-gray-700 rounded-lg p-6 hover:shadow-lg transition-shadow bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-800 dark:border-blue-900/30"
          >
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h3 className="text-xl font-bold text-blue-600 dark:text-blue-400 mb-2">
                  {account.bank}
                </h3>
                <div className="space-y-3">
                  <div className="flex flex-col">
                    <span className="text-sm text-gray-500 dark:text-gray-400">Account Name</span>
                    <div className="flex items-center mt-1">
                      <span className="font-medium text-current">{account.accountName}</span>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => handleCopy(account.accountName, 'Account name')}
                        className="ml-2 p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"
                      >
                        {copied === 'Account name' ? (
                          <CheckCircle className="w-4 h-4 text-green-500" />
                        ) : (
                          <Copy className="w-4 h-4 text-gray-500" />
                        )}
                      </motion.button>
                    </div>
                  </div>
                  
                  <div className="flex flex-col">
                    <span className="text-sm text-gray-500 dark:text-gray-400">Account Number</span>
                    <div className="flex items-center mt-1">
                      <span className="font-medium text-current">{account.accountNumber}</span>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => handleCopy(account.accountNumber, 'Account number')}
                        className="ml-2 p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"
                      >
                        {copied === 'Account number' ? (
                          <CheckCircle className="w-4 h-4 text-green-500" />
                        ) : (
                          <Copy className="w-4 h-4 text-gray-500" />
                        )}
                      </motion.button>
                    </div>
                  </div>
                  
                  <div className="flex flex-col">
                    <span className="text-sm text-gray-500 dark:text-gray-400">Account Type</span>
                    <span className="font-medium text-current">{account.accountType}</span>
                  </div>
                </div>
              </div>
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleCopy(`Bank: ${account.bank}\nAccount Name: ${account.accountName}\nAccount Number: ${account.accountNumber}\nAccount Type: ${account.accountType}`, 'All details')}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center justify-center"
              >
                {copied === 'All details' ? (
                  <>
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Copied
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 mr-2" />
                    Copy All Details
                  </>
                )}
              </motion.button>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

export default BankDetails;