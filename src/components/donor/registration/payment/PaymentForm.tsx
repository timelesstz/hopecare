import React, { useEffect } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { donorSchema } from '../../../../types/donor';
import { useFormAnalytics } from '../../../../hooks/useFormAnalytics';
import CardNameInput from './CardNameInput';
import CardNumberInput from './CardNumberInput';
import ExpiryDateInput from './ExpiryDateInput';
import CVVInput from './CVVInput';
import PaymentButtons from './PaymentButtons';
import PaymentSummary from './PaymentSummary';

interface PaymentFormProps {
  defaultValues?: any;
  onSubmit: (data: any) => Promise<void>;
  onBack: () => void;
  isProcessing: boolean;
}

const PaymentForm: React.FC<PaymentFormProps> = ({
  defaultValues,
  onSubmit,
  onBack,
  isProcessing
}) => {
  const { trackError } = useFormAnalytics('donor-registration');
  const { register, handleSubmit, control, formState: { errors } } = useForm({
    resolver: zodResolver(donorSchema.shape.payment),
    defaultValues
  });

  const cardName = useWatch({ control, name: 'cardName', defaultValue: '' });
  const cardNumber = useWatch({ control, name: 'cardNumber', defaultValue: '' });
  const expiryDate = useWatch({ control, name: 'expiryDate', defaultValue: '' });

  useEffect(() => {
    if (Object.keys(errors).length > 0) {
      Object.keys(errors).forEach(fieldName => {
        trackError(fieldName);
      });
    }
  }, [errors, trackError]);

  const showSummary = cardName && cardNumber && expiryDate;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {showSummary && (
        <PaymentSummary
          cardName={cardName}
          cardNumber={cardNumber}
          expiryDate={expiryDate}
        />
      )}

      <CardNameInput
        register={register}
        error={errors.cardName?.message as string}
      />

      <CardNumberInput
        register={register}
        error={errors.cardNumber?.message as string}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <ExpiryDateInput
          register={register}
          error={errors.expiryDate?.message as string}
        />

        <CVVInput
          register={register}
          error={errors.cvv?.message as string}
        />
      </div>

      <PaymentButtons
        onBack={onBack}
        isProcessing={isProcessing}
      />
    </form>
  );
};

export default PaymentForm;