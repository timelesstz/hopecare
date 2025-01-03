import React from 'react';
import { motion } from 'framer-motion';
import { Heart, Share2, Download, Mail, Twitter, Facebook, LinkedIn, Calendar } from 'lucide-react';

interface DonationThankYouProps {
  donorName: string;
  amount: number;
  donationType: 'one-time' | 'monthly' | 'recurring';
  recurringInterval?: 'weekly' | 'biweekly' | 'monthly';
  transactionId: string;
  date: string;
  impact: {
    description: string;
    metrics: Array<{
      label: string;
      value: string;
    }>;
  };
}

const DonationThankYou: React.FC<DonationThankYouProps> = ({
  donorName,
  amount,
  donationType,
  recurringInterval = 'monthly',
  transactionId,
  date,
  impact,
}) => {
  const shareUrl = typeof window !== 'undefined' ? window.location.href : '';
  
  const shareText = \`I just donated to support healthcare access for those in need! Join me in making a difference.\`;

  const handleShare = (platform: string) => {
    const urls = {
      twitter: \`https://twitter.com/intent/tweet?text=\${encodeURIComponent(shareText)}&url=\${encodeURIComponent(shareUrl)}\`,
      facebook: \`https://www.facebook.com/sharer/sharer.php?u=\${encodeURIComponent(shareUrl)}\`,
      linkedin: \`https://www.linkedin.com/shareArticle?mini=true&url=\${encodeURIComponent(shareUrl)}&title=\${encodeURIComponent('I Just Donated!')}&summary=\${encodeURIComponent(shareText)}\`,
    };

    window.open(urls[platform as keyof typeof urls], '_blank');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-2xl mx-auto space-y-8"
    >
      {/* Thank You Header */}
      <div className="text-center space-y-4">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2 }}
          className="w-20 h-20 bg-rose-100 rounded-full mx-auto flex items-center justify-center"
        >
          <Heart className="w-10 h-10 text-rose-600" />
        </motion.div>
        <h1 className="text-3xl font-bold text-gray-900">
          Thank You for Your Donation, {donorName}!
        </h1>
        <p className="text-gray-600">
          Your generosity helps us provide essential healthcare services to those in need
        </p>
      </div>

      {/* Donation Details */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-100">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                ${amount.toLocaleString()}
                {donationType !== 'one-time' && (
                  <span className="text-gray-500 text-lg font-normal">
                    /{recurringInterval}
                  </span>
                )}
              </h2>
              <p className="text-gray-600">
                {donationType === 'one-time'
                  ? 'One-time donation'
                  : \`\${recurringInterval.charAt(0).toUpperCase() + 
                      recurringInterval.slice(1)} donation\`}
              </p>
            </div>
            {donationType !== 'one-time' && (
              <span className="px-3 py-1 bg-green-100 text-green-600 rounded-full text-sm font-medium">
                Recurring
              </span>
            )}
          </div>
          
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-500">Transaction ID</p>
              <p className="font-medium text-gray-900">{transactionId}</p>
            </div>
            <div>
              <p className="text-gray-500">Date</p>
              <p className="font-medium text-gray-900">{date}</p>
            </div>
          </div>
        </div>

        {/* Impact Section */}
        <div className="p-6 bg-gradient-to-br from-rose-50 to-purple-50">
          <h3 className="font-semibold text-gray-900 mb-4">Your Impact</h3>
          <p className="text-gray-600 mb-6">{impact.description}</p>
          
          <div className="grid grid-cols-2 gap-4">
            {impact.metrics.map((metric, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + index * 0.1 }}
                className="bg-white/80 backdrop-blur-sm rounded-lg p-4"
              >
                <p className="font-bold text-gray-900 text-lg">{metric.value}</p>
                <p className="text-gray-600 text-sm">{metric.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="grid grid-cols-2 gap-4">
        <button
          onClick={() => {/* Add download logic */}}
          className="flex items-center justify-center gap-2 p-4 bg-white rounded-lg
            border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors"
        >
          <Download className="w-5 h-5" />
          <span>Download Receipt</span>
        </button>
        
        <button
          onClick={() => {/* Add email logic */}}
          className="flex items-center justify-center gap-2 p-4 bg-white rounded-lg
            border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors"
        >
          <Mail className="w-5 h-5" />
          <span>Email Receipt</span>
        </button>
      </div>

      {/* Share Section */}
      <div className="text-center space-y-4">
        <h3 className="font-semibold text-gray-900">Share Your Support</h3>
        <p className="text-gray-600">
          Inspire others to join our mission of providing healthcare access
        </p>
        <div className="flex justify-center gap-4">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => handleShare('twitter')}
            className="p-3 bg-[#1DA1F2] text-white rounded-full hover:bg-opacity-90"
          >
            <Twitter className="w-5 h-5" />
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => handleShare('facebook')}
            className="p-3 bg-[#4267B2] text-white rounded-full hover:bg-opacity-90"
          >
            <Facebook className="w-5 h-5" />
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => handleShare('linkedin')}
            className="p-3 bg-[#0077B5] text-white rounded-full hover:bg-opacity-90"
          >
            <LinkedIn className="w-5 h-5" />
          </motion.button>
        </div>
      </div>

      {/* Next Steps */}
      {donationType !== 'one-time' && (
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <div className="flex items-center gap-3 mb-4">
            <Calendar className="w-6 h-6 text-rose-500" />
            <h3 className="font-semibold text-gray-900">Next Steps</h3>
          </div>
          <ul className="space-y-3 text-gray-600">
            <li>• Your next donation will be processed on {/* Add next date logic */}</li>
            <li>• You can manage your recurring donation from your account settings</li>
            <li>• We'll send you impact updates and tax receipts via email</li>
          </ul>
        </div>
      )}
    </motion.div>
  );
};

export default DonationThankYou;
