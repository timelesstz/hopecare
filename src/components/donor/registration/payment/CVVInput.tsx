```typescript
import React from 'react';
import { Lock } from 'lucide-react';
import { UseFormRegister } from 'react-hook-form';
import AccessibleLabel from '../AccessibleLabel';
import AccessibleErrorMessage from '../AccessibleErrorMessage';

interface CVVInputProps {
  register: UseFormRegister<any>;
  error?: string;
}

const CVVInput: React.FC<CVVInputProps> = ({ register, error }) => {
  return (
    <div>
      <AccessibleLabel
        id="cvv"
        label="CVV"
        required
        error={error}
        description="3 or 4 digit security code"
      />
      <div className="mt-1 relative">
        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
        <input
          {...register('cvv')}
          id="cvv"
          type="password"
          autoComplete="cc-csc"
          maxLength={4}
          className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-rose-500 focus:border-rose-500"
          aria-invalid={error ? 'true' : 'false'}
        />
      </div>
      {error && (
        <AccessibleErrorMessage
          id="cvv"
          message={error}
        />
      )}
    </div>
  );
};

export default CVVInput;
```