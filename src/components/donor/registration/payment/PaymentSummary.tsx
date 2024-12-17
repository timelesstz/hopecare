import React from 'react';
import { CreditCard, Calendar, Lock, User } from 'lucide-react';
import { getCardType } from '../../../../utils/paymentUtils';

interface PaymentSummaryProps {
  cardName: string;
  cardNumber: string;
  expiryDate: string;
}

const PaymentSummary: React.FC<PaymentSummaryProps> = ({
  cardName,
  cardNumber,
  expiryDate
}) => {
  const cardType = getCardType(cardNumber.replace(/\s/g, ''));
  const lastFourDigits = cardNumber.replace(/\s/g, '').slice(-4);

  return (
    <div className="bg-gray-50 rounded-lg p-4 mb-6" role="region" aria-label="Payment Summary">
      <h3 className="text-sm font-medium text-gray-900 mb-4">Payment Summary</h3>
      
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center text-gray-600">
            <CreditCard className="h-4 w-4 mr-2" />
            <span className="text-sm">Card Type</span>
          </div>
          <span className="text-sm font-medium text-gray-900 capitalize">
            {cardType}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center text-gray-600">
            <Lock className="h-4 w-4 mr-2" />
            <span className="text-sm">Card Number</span>
          </div>
          <span className="text-sm font-medium text-gray-900">
            •••• {lastFourDigits}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center text-gray-600">
            <Calendar className="h-4 w-4 mr-2" />
            <span className="text-sm">Expiry Date</span>
          </div>
          <span className="text-sm font-medium text-gray-900">
            {expiryDate}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center text-gray-600">
            <User className="h-4 w-4 mr-2" />
            <span className="text-sm">Card Holder</span>
          </div>
          <span className="text-sm font-medium text-gray-900">
            {cardName}
          </span>
        </div>
      </div>
    </div>
  );
};

export default PaymentSummary;