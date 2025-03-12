// Supabase client import removed - using Firebase instead
import { db, auth } from '../../lib/firebase';
import { 
  collection, 
  addDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  doc, 
  updateDoc, 
  getDoc,
  serverTimestamp,
  Timestamp
} from 'firebase/firestore';

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
    const transactionsCollection = collection(db, 'transactions');
    
    const docRef = await addDoc(transactionsCollection, {
      ...transaction,
      created_at: new Date().toISOString(),
      timestamp: serverTimestamp(),
    });
    
    const newDoc = await getDoc(docRef);
    return { id: docRef.id, ...newDoc.data() };
  } catch (error) {
    console.error('Error logging transaction:', error);
    throw new Error('Failed to log transaction');
  }
};

export const getTransactionHistory = async (userId: string) => {
  try {
    const transactionsCollection = collection(db, 'transactions');
    const transactionsQuery = query(
      transactionsCollection,
      where('user_id', '==', userId),
      orderBy('created_at', 'desc')
    );
    
    const querySnapshot = await getDocs(transactionsQuery);
    
    const transactions: any[] = [];
    querySnapshot.forEach((doc) => {
      transactions.push({ id: doc.id, ...doc.data() });
    });
    
    return transactions;
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
    const transactionsCollection = collection(db, 'transactions');
    const transactionsQuery = query(
      transactionsCollection,
      where('transaction_id', '==', transactionId)
    );
    
    const querySnapshot = await getDocs(transactionsQuery);
    
    if (querySnapshot.empty) {
      throw new Error(`Transaction with ID ${transactionId} not found`);
    }
    
    const transactionDoc = querySnapshot.docs[0];
    const transactionRef = doc(db, 'transactions', transactionDoc.id);
    
    const updateData: any = { status };
    
    if (metadata) {
      updateData.metadata = {
        ...transactionDoc.data().metadata,
        ...metadata,
        updated_at: new Date().toISOString()
      };
    }
    
    await updateDoc(transactionRef, updateData);
    
    const updatedDoc = await getDoc(transactionRef);
    return { id: transactionRef.id, ...updatedDoc.data() };
  } catch (error) {
    console.error('Error updating transaction status:', error);
    throw new Error('Failed to update transaction status');
  }
};

export const getDonationStats = async () => {
  try {
    // Get total donation stats
    const donationsCollection = collection(db, 'donations');
    const donationsQuery = query(
      donationsCollection,
      where('status', '==', 'completed')
    );
    
    const querySnapshot = await getDocs(donationsQuery);
    
    let totalAmount = 0;
    let totalCount = 0;
    let donorCount = new Set();
    
    querySnapshot.forEach((doc) => {
      const donation = doc.data();
      totalAmount += donation.amount;
      totalCount++;
      if (donation.user_id) {
        donorCount.add(donation.user_id);
      }
    });
    
    // Get monthly donation stats
    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    
    const monthlyDonationsQuery = query(
      donationsCollection,
      where('status', '==', 'completed'),
      where('created_at', '>=', firstDayOfMonth.toISOString())
    );
    
    const monthlySnapshot = await getDocs(monthlyDonationsQuery);
    
    let monthlyAmount = 0;
    let monthlyCount = 0;
    let monthlyDonors = new Set();
    
    monthlySnapshot.forEach((doc) => {
      const donation = doc.data();
      monthlyAmount += donation.amount;
      monthlyCount++;
      if (donation.user_id) {
        monthlyDonors.add(donation.user_id);
      }
    });
    
    return {
      total: {
        amount: totalAmount,
        count: totalCount,
        donors: donorCount.size
      },
      monthly: {
        amount: monthlyAmount,
        count: monthlyCount,
        donors: monthlyDonors.size
      }
    };
  } catch (error) {
    console.error('Error fetching donation stats:', error);
    throw new Error('Failed to fetch donation statistics');
  }
}; 