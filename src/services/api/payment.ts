// Supabase client import removed - using Firebase instead
import { db, auth } from '../lib/firebase';

interface TransactionLog {
  transaction_id: string;
  user_id: string;
  amount: number;
  currency: string;
  status: 'pending' | 'successful' | 'failed';
  payment_type: 'one-time' | 'monthly' | 'recurring';
  metadata?: Record<string, any>;
  created_at?: string;
}

export const logTransaction = async (transaction: Omit<TransactionLog, 'created_at'>) => {
  try {
    const { data, error } = await supabase
      .from('transactions')
      .insert([{
        ...transaction,
        created_at: new Date().toISOString(),
      }])
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error logging transaction:', error);
    throw new Error('Failed to log transaction');
  }
};

export const getTransactionHistory = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching transaction history:', error);
    throw new Error('Failed to fetch transaction history');
  }
};

export const updateTransactionStatus = async (
  transactionId: string,
  status: TransactionLog['status'],
  metadata?: Record<string, any>
) => {
  try {
    const { data, error } = await supabase
      .from('transactions')
      .update({
        status,
        metadata: metadata ? { ...metadata, updated_at: new Date().toISOString() } : undefined,
      })
      .eq('transaction_id', transactionId)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error updating transaction status:', error);
    throw new Error('Failed to update transaction status');
  }
};

export const getDonationStats = async () => {
  try {
    const { data: totalData, error: totalError } = await supabase
      .rpc('get_donation_stats');

    if (totalError) throw totalError;

    const { data: monthlyData, error: monthlyError } = await supabase
      .rpc('get_monthly_donation_stats');

    if (monthlyError) throw monthlyError;

    return {
      total: totalData,
      monthly: monthlyData
    };
  } catch (error) {
    console.error('Error fetching donation stats:', error);
    throw new Error('Failed to fetch donation statistics');
  }
}; 