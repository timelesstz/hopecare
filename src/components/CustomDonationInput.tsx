import { useState, useEffect } from 'react';
import { DollarSign, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

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
  const [inputValue, setInputValue] = useState(value);
  const [hasFocus, setHasFocus] = useState(false);

  // Update local state when prop value changes
  useEffect(() => {
    setInputValue(value);
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value.replace(/[^\d.]/g, '');
    setInputValue(newValue);
    onChange(newValue);
  };

  const handleBlur = () => {
    // Format the value on blur (e.g., ensure it has 2 decimal places if needed)
    setHasFocus(false);
    if (inputValue && !isNaN(parseFloat(inputValue))) {
      const formattedValue = parseFloat(inputValue).toFixed(2);
      if (formattedValue !== '0.00') {
        setInputValue(formattedValue);
        onChange(formattedValue);
      }
    }
  };

  const handleFocus = () => {
    setHasFocus(true);
    onSelect?.();
  };

  const suggestedAmounts = [50, 100, 250, 500];

  return (
    <motion.div 
      className="w-full"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="mb-6">
        <label htmlFor="custom-donation" className="block text-lg font-medium text-gray-800 mb-3">
          Enter Custom Amount
        </label>
        <motion.div 
          className="relative"
          whileHover={{ scale: 1.01 }}
          animate={{ 
            scale: selected ? 1.02 : 1,
            boxShadow: selected ? '0 4px 12px rgba(0,0,0,0.1)' : 'none'
          }}
          transition={{ duration: 0.2 }}
        >
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <DollarSign className={`h-6 w-6 ${selected ? 'text-rose-500' : 'text-gray-400'}`} />
          </div>
          <input
            id="custom-donation"
            type="text"
            value={inputValue}
            onChange={handleChange}
            onBlur={handleBlur}
            onFocus={handleFocus}
            onClick={() => onSelect?.()}
            className={`
              block w-full pl-12 pr-12 py-4 text-xl
              border-2 rounded-lg transition-all duration-200
              ${selected 
                ? 'border-rose-500 ring-2 ring-rose-200' 
                : 'border-gray-300 hover:border-rose-300'
              }
              ${hasFocus
                ? 'border-rose-500 ring-2 ring-rose-200'
                : ''
              }
              ${error ? 'border-red-300 ring-red-100' : ''}
              focus:ring-2 focus:ring-rose-500 focus:border-rose-500
              placeholder-gray-400 font-medium
            `}
            placeholder="Enter amount"
            aria-describedby={error ? "donation-error" : undefined}
          />
          {inputValue && donationType === 'monthly' && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">
              /month
            </div>
          )}
        </motion.div>
        {error && (
          <motion.p 
            id="donation-error" 
            className="mt-2 text-sm text-red-600"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {error}
          </motion.p>
        )}
        
        {selected && !error && parseFloat(inputValue) > 0 && (
          <motion.div 
            className="mt-2 flex items-center text-green-700"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            <Sparkles className="h-4 w-4 mr-2 text-green-500" />
            <span className="text-sm">
              {parseFloat(inputValue) >= 500 
                ? "Your generous donation will make a significant impact!" 
                : "Thank you for your contribution to our mission!"}
            </span>
          </motion.div>
        )}
      </div>

      <div className="text-gray-700 mb-6">
        <p className="mb-3 font-medium">Suggested amounts:</p>
        <div className="grid grid-cols-4 gap-3">
          {suggestedAmounts.map((amount) => (
            <motion.button
              key={amount}
              onClick={() => {
                setInputValue(amount.toString());
                onChange(amount.toString());
                onSelect?.();
              }}
              className={`
                py-3 px-4 rounded-lg text-base font-medium
                border transition-all duration-200
                ${parseFloat(inputValue) === amount
                  ? 'bg-rose-50 border-rose-300 text-rose-700'
                  : 'border-gray-200 hover:border-rose-300 hover:bg-rose-50 text-gray-700'
                }
              `}
              type="button"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
            >
              ${amount}
            </motion.button>
          ))}
        </div>
        
        <motion.div 
          className="mt-4 text-sm text-gray-500"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <p>100% of your donation goes directly to our healthcare initiatives. We're committed to transparency and responsible stewardship of your generosity.</p>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default CustomDonationInput;