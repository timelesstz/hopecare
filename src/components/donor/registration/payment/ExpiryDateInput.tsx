```typescript
import React from 'react';
import { Calendar } from 'lucide-react';
import { UseFormRegister } from 'react-hook-form';
import AccessibleLabel from '../AccessibleLabel';
import AccessibleErrorMessage from '../AccessibleErrorMessage';

interface ExpiryDateInputProps {
  register: UseFormRegister<any>;
  error?: string;
}

const ExpiryDateInput: React.FC<ExpiryDateInputProps> = ({ register, error }) => {
  const formatExpiryDate = (value: string) => {
    const cleaned = value.replace(/\D/g, '');
    if (cleaned.length >= 2) {
      return `${cleaned.slice(0, 2)}/${cleaned.slice(2, 4)}`;
    }
    return cleaned;
  };

  return (
    <div>
      <AccessibleLabel
        id="expiryDate"
        label="Expiry Date"
        required
        error={error}
      />
      <div className="mt-1 relative">
        <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
        <input
          {...register('expiryDate', {
            onChange: (e) => {
              e.target.value = formatExpiryDate(e.target.value);
            }
          })}
          id="expiryDate"
          type="text"
          autoComplete="cc-exp"
          placeholder="MM/YY"
          maxLength={5}
          className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-rose-500 focus:border-rose-500"
          aria-invalid={error ? 'true' : 'false'}
        />
      </div>
      {error && (
        <AccessibleErrorMessage
          id="expiryDate"
          message={error}
        />
      )}
    </div>
  );
};

export default ExpiryDateInput;
```