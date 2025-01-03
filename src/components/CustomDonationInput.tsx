import { useState } from 'react';
import { DollarSign } from 'lucide-react';

interface CustomDonationInputProps {
  value: string;
  onChange: (value: string) => void;
  onSelect?: () => void;
  selected?: boolean;
  error?: string | null;
  donationType?: 'one-time' | 'monthly';
}

const CustomDonationInput: React.FC<CustomDonationInputProps> = ({
  value,
  onChange,
  onSelect,
  selected = false,
  error = null,
  donationType = 'one-time',
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^\d.]/g, '');
    onChange(value);
  };

  const suggestedAmounts = [500, 1000, 2000];

  return (
    <div className="w-full">
      <div className="mb-4">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <span className="text-gray-500 text-lg">$</span>
          </div>
          <input
            type="text"
            value={value}
            onChange={handleChange}
            onClick={onSelect}
            className={`
              block w-full pl-16 pr-12 py-3 text-lg
              border-2 rounded-lg transition-all duration-200
              ${selected 
                ? 'border-blue-500 ring-2 ring-blue-200' 
                : 'border-gray-300 hover:border-blue-300'
              }
              ${error ? 'border-red-300' : ''}
              focus:ring-2 focus:ring-blue-500 focus:border-blue-500
              placeholder-gray-400
            `}
            placeholder="Enter custom amount"
          />
          {value && donationType === 'monthly' && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">
              /month
            </div>
          )}
        </div>
        {error && (
          <p className="mt-2 text-sm text-red-600">{error}</p>
        )}
      </div>

      <div className="text-sm text-gray-600 mb-6">
        <p className="mb-3">Quick amounts:</p>
        <div className="grid grid-cols-3 gap-2">
          {suggestedAmounts.map((amount) => (
            <button
              key={amount}
              onClick={() => {
                onChange(amount.toString());
                onSelect?.();
              }}
              className={`
                py-2 px-4 rounded-lg text-sm font-medium
                border border-gray-200 hover:border-blue-300
                hover:bg-blue-50 transition-all duration-200
              `}
            >
              ${amount}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CustomDonationInput;