import React from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Box, Button, Stepper, Step, StepLabel } from '@mui/material';
import { volunteerSchema, VolunteerFormData } from '../../types/volunteer';
import PersonalInfoSection from './volunteer/PersonalInfoSection';
import SkillsLanguagesSection from './volunteer/SkillsLanguagesSection';
import AvailabilitySection from './volunteer/AvailabilitySection';
import InterestsSection from './volunteer/InterestsSection';
import EmergencyContactSection from './volunteer/EmergencyContactSection';

interface VolunteerRegistrationFormProps {
  onSubmit: (data: VolunteerFormData) => void;
  isLoading: boolean;
}

const steps = [
  'Personal Information',
  'Skills & Languages',
  'Availability',
  'Interests',
  'Emergency Contact'
];

const VolunteerRegistrationForm: React.FC<VolunteerRegistrationFormProps> = ({
  onSubmit,
  isLoading
}) => {
  const [activeStep, setActiveStep] = React.useState(0);
  const {
    control,
    register,
    watch,
    handleSubmit,
    formState: { errors, isValid }
  } = useForm<VolunteerFormData>({
    resolver: zodResolver(volunteerSchema),
    mode: 'onChange'
  });

  const password = watch('password', '');

  const handleNext = () => {
    setActiveStep((prevStep) => prevStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };

  const renderStepContent = (step: number) => {
    switch (step) {
      case 0:
        return (
          <PersonalInfoSection
            control={control}
            register={register}
            errors={errors}
            password={password}
          />
        );
      case 1:
        return (
          <SkillsLanguagesSection
            control={control}
            register={register}
            errors={errors}
          />
        );
      case 2:
        return (
          <AvailabilitySection
            control={control}
            register={register}
          />
        );
      case 3:
        return (
          <InterestsSection
            control={control}
            register={register}
            errors={errors}
          />
        );
      case 4:
        return (
          <EmergencyContactSection
            control={control}
            register={register}
            errors={errors}
          />
        );
      default:
        return null;
    }
  };

  return (
    <Box sx={{ width: '100%' }}>
      <Stepper activeStep={activeStep} alternativeLabel sx={{ mb: 4 }}>
        {steps.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>

      <form onSubmit={handleSubmit(onSubmit)}>
        {renderStepContent(activeStep)}

        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
          <Button
            variant="outlined"
            onClick={handleBack}
            disabled={activeStep === 0 || isLoading}
          >
            Back
          </Button>
          
          {activeStep === steps.length - 1 ? (
            <Button
              type="submit"
              variant="contained"
              disabled={!isValid || isLoading}
            >
              {isLoading ? 'Registering...' : 'Register'}
            </Button>
          ) : (
            <Button
              variant="contained"
              onClick={handleNext}
              disabled={!isValid || isLoading}
            >
              Next
            </Button>
          )}
        </Box>
      </form>
    </Box>
  );
};

export default VolunteerRegistrationForm;