```typescript
import React from 'react';
import { CreditCard } from 'lucide-react';
import { UseFormRegister } from 'react-hook-form';
import AccessibleLabel from '../AccessibleLabel';
import AccessibleErrorMessage from '../AccessibleErrorMessage';

interface CardNameInputProps {
  register: UseFormRegister<any>;
  error?: string;
}

const CardNameInput: React.FC<CardNameInputProps> = ({ register, error }) => {
  return (
    <div>
      <AccessibleLabel
        id="cardName"
        label="Name on Card"
        required
        error={error}
        description="Enter the name exactly as it appears on your card"
      />
      <div className="mt-1 relative">
        <CreditCard className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
        <input
          {...register('cardName')}
          id="cardName"
          type="text"
          autoComplete="cc-name"
          className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-rose-500 focus:border-rose-500"
          aria-invalid={error ? 'true' : 'false'}
        />
      </div>
      {error && (
        <AccessibleErrorMessage
          id="cardName"
          message={error}
        />
      )}
    </div>
  );
};

export default CardNameInput;
```