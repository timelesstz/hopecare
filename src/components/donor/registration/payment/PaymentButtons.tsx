import React from 'react';

interface PaymentButtonsProps {
  onBack: () => void;
  isProcessing: boolean;
}

const PaymentButtons: React.FC<PaymentButtonsProps> = ({ onBack, isProcessing }) => {
  return (
    <div className="flex justify-between">
      <button
        type="button"
        onClick={onBack}
        className="text-gray-600 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
        disabled={isProcessing}
      >
        Back
      </button>
      <button
        type="submit"
        className="bg-rose-600 text-white px-6 py-2 rounded-md hover:bg-rose-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
        disabled={isProcessing}
      >
        {isProcessing ? (
          <>
            <span className="animate-spin mr-2">⋯</span>
            Processing...
          </>
        ) : (
          'Complete Registration'
        )}
      </button>
    </div>
  );
};

export default PaymentButtons;