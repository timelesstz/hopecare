import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { VolunteerFormData } from '../types/volunteer';

interface VolunteerFormState {
  currentStep: number;
  formData: Partial<VolunteerFormData>;
  setStep: (step: number) => void;
  updateFormData: (data: Partial<VolunteerFormData>) => void;
  resetForm: () => void;
}

const initialFormData: Partial<VolunteerFormData> = {
  availability: {
    weekdays: false,
    weekends: false,
    evenings: false
  }
};

export const useVolunteerForm = create<VolunteerFormState>()(
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
      name: 'volunteer-form-storage'
    }
  )
);