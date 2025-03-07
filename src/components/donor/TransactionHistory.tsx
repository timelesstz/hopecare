import React, { useEffect, useState } from 'react';
import { getTransactionHistory } from '../../services/api/payment';
import { useFirebaseAuth } from '../../context/FirebaseAuthContext';
import { format } from 'date-fns';
import { motion } from 'framer-motion';

interface Transaction {
  transaction_id: string;
  amount: number;
  currency: string;
  status: 'pending' | 'successful' | 'failed';
  payment_type: string;
  created_at: string;
}

const TransactionHistory: React.FC = () => {
  const { user } = useFirebaseAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTransactions = async () => {
      if (!user?.id) return;
      
      try {
        setLoading(true);
        const data = await getTransactionHistory(user.id);
        setTransactions(data);
      } catch (err) {
        setError('Failed to load transaction history');
        console.error('Error fetching transactions:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, [user?.id]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[200px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-600 py-4">
        {error}
      </div>
    );
  }

  if (!transactions.length) {
    return (
      <div className="text-center text-gray-500 py-8">
        No transactions found. Make your first donation to see your history here!
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="px-4 py-5 sm:px-6">
        <h3 className="text-lg font-medium leading-6 text-gray-900">
          Transaction History
        </h3>
        <p className="mt-1 text-sm text-gray-500">
          Your complete donation history with HopeCare
        </p>
      </div>
      
      <div className="border-t border-gray-200">
        <ul className="divide-y divide-gray-200">
          {transactions.map((transaction, index) => (
            <motion.li
              key={transaction.transaction_id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              className="px-4 py-4 sm:px-6 hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div className="flex flex-col">
                  <p className="text-sm font-medium text-gray-900">
                    {transaction.payment_type.charAt(0).toUpperCase() + 
                     transaction.payment_type.slice(1)} Donation
                  </p>
                  <p className="text-sm text-gray-500">
                    {format(new Date(transaction.created_at), 'PPP')}
                  </p>
                </div>
                <div className="flex items-center">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full
                    ${
                      transaction.status === 'successful'
                        ? 'bg-green-100 text-green-800'
                        : transaction.status === 'pending'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {transaction.status.charAt(0).toUpperCase() + 
                     transaction.status.slice(1)}
                  </span>
                  <span className="ml-4 text-sm font-medium text-gray-900">
                    {transaction.currency} {transaction.amount.toFixed(2)}
                  </span>
                </div>
              </div>
            </motion.li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default TransactionHistory; 