import React from 'react';
import { motion } from 'framer-motion';
import { XCircle, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const DonationCancel: React.FC = () => {
  const navigate = useNavigate();

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4"
    >
      <div className="max-w-md w-full bg-white rounded-2xl shadow-sm p-8 text-center">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="mx-auto w-16 h-16 mb-6"
        >
          <XCircle className="w-16 h-16 text-rose-500" />
        </motion.div>

        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Donation Cancelled
        </h1>
        
        <p className="text-gray-600 mb-6">
          Your donation was not completed. No charges have been made to your account.
        </p>

        <div className="flex flex-col gap-3">
          <button
            onClick={() => navigate(-1)}
            className="w-full py-3 px-4 rounded-lg bg-primary-600 text-white hover:bg-primary-700 transition-colors flex items-center justify-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Try Again</span>
          </button>
          
          <button
            onClick={() => navigate('/')}
            className="w-full py-3 px-4 rounded-lg bg-primary-50 text-primary-600 hover:bg-primary-100 transition-colors"
          >
            Return Home
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default DonationCancel;
