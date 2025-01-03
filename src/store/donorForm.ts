import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { DonorFormData } from '../types/donor';

interface DonorFormState {
  currentStep: number;
  formData: Partial<DonorFormData>;
  setStep: (step: number) => void;
  updateFormData: (data: Partial<DonorFormData>) => void;
  resetForm: () => void;
}

const initialFormData: Partial<DonorFormData> = {
  preferences: {
    newsletter: true,
    taxReceipts: true,
    communication: 'email',
    interests: []
  }
};

export const useDonorForm = create<DonorFormState>()(
  persist(
    (set) => ({
      currentStep: 0,
      formData: initialFormData,
      setStep: (step) => set({ currentStep: step }),
      updateFormData: (data) =>
        set((state) => ({
          formData: { ...state.formData, ...data }
        })),
      resetForm: () => set({ currentStep: 0, formData: initialFormData })
    }),
    {
      name: 'donor-form-storage'
    }
  )
);