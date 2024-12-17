import React, { useState } from 'react';
import { useDonorForm } from '../../../store/donorForm';
import PaymentForm from './payment/PaymentForm';

const PaymentStep = () => {
  const { formData, updateFormData, setStep, resetForm } = useDonorForm();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = async (data: any) => {
    setIsProcessing(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      updateFormData({ payment: data });
      resetForm();
    } catch (error) {
      console.error('Payment processing failed:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleBack = () => {
    setStep(2);
  };

  return (
    <PaymentForm
      defaultValues={formData.payment}
      onSubmit={handleSubmit}
      onBack={handleBack}
      isProcessing={isProcessing}
    />
  );
};

export default PaymentStep;