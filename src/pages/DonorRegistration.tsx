import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useDonorForm } from '../store/donorForm';
import { DonorRegistrationStep } from '../types/donor';
import FormProgress from '../components/donor/registration/FormProgress';
import PersonalInfoStep from '../components/donor/registration/PersonalInfoStep';
import AddressStep from '../components/donor/registration/AddressStep';
import PreferencesStep from '../components/donor/registration/PreferencesStep';
import PaymentStep from '../components/donor/registration/PaymentStep';
import FormAnalytics from '../components/donor/registration/FormAnalytics';

const steps: DonorRegistrationStep[] = [
  {
    id: 'personal-info',
    title: 'Personal Information',
    description: 'Tell us about yourself',
    component: PersonalInfoStep
  },
  {
    id: 'address',
    title: 'Address',
    description: 'Where can we reach you?',
    component: AddressStep
  },
  {
    id: 'preferences',
    title: 'Preferences',
    description: 'Customize your experience',
    component: PreferencesStep
  },
  {
    id: 'payment',
    title: 'Payment Information',
    description: 'Set up your payment method',
    component: PaymentStep
  }
];

const DonorRegistration = () => {
  const navigate = useNavigate();
  const { currentStep, formData } = useDonorForm();

  const CurrentStepComponent = steps[currentStep].component;

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <FormProgress steps={steps} currentStep={currentStep} />
        
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            {steps[currentStep].title}
          </h2>
          <p className="text-gray-600 mb-8">
            {steps[currentStep].description}
          </p>

          <CurrentStepComponent />
        </div>

        <FormAnalytics
          formId="donor-registration"
          currentStep={currentStep}
          formData={formData}
        />
      </div>
    </div>
  );
};

export default DonorRegistration;