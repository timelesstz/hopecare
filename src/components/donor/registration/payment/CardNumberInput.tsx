```typescript
import React from 'react';
import { CreditCard } from 'lucide-react';
import { UseFormRegister } from 'react-hook-form';
import AccessibleLabel from '../AccessibleLabel';
import AccessibleErrorMessage from '../AccessibleErrorMessage';

interface CardNumberInputProps {
  register: UseFormRegister<any>;
  error?: string;
}

const CardNumberInput: React.FC<CardNumberInputProps> = ({ register, error }) => {
  const formatCardNumber = (value: string) => {
    return value.replace(/\s/g, '').match(/.{1,4}/g)?.join(' ') || value;
  };

  return (
    <div>
      <AccessibleLabel
        id="cardNumber"
        label="Card Number"
        required
        error={error}
      />
      <div className="mt-1 relative">
        <CreditCard className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
        <input
          {...register('cardNumber', {
            onChange: (e) => {
              e.target.value = formatCardNumber(e.target.value);
            }
          })}
          id="cardNumber"
          type="text"
          autoComplete="cc-number"
          maxLength={19}
          className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-rose-500 focus:border-rose-500"
          aria-invalid={error ? 'true' : 'false'}
        />
      </div>
      {error && (
        <AccessibleErrorMessage
          id="cardNumber"
          message={error}
        />
      )}
    </div>
  );
};

export default CardNumberInput;
```