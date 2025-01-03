import React from 'react';
import { Control, UseFormRegister, FieldErrors, Controller } from 'react-hook-form';
import { TextField, Grid, FormControl, FormHelperText } from '@mui/material';
import { VolunteerFormData } from '../../../types/volunteer';
import PasswordStrengthMeter from '../PasswordStrengthMeter';

interface PersonalInfoSectionProps {
  control: Control<VolunteerFormData>;
  register: UseFormRegister<VolunteerFormData>;
  errors: FieldErrors<VolunteerFormData>;
  password: string;
}

const PersonalInfoSection: React.FC<PersonalInfoSectionProps> = ({
  control,
  errors,
  password
}) => {
  return (
    <Grid container spacing={2}>
      <Grid item xs={12} sm={6}>
        <Controller
          name="firstName"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              fullWidth
              label="First Name"
              error={!!errors.firstName}
              helperText={errors.firstName?.message}
              required
            />
          )}
        />
      </Grid>

      <Grid item xs={12} sm={6}>
        <Controller
          name="lastName"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              fullWidth
              label="Last Name"
              error={!!errors.lastName}
              helperText={errors.lastName?.message}
              required
            />
          )}
        />
      </Grid>

      <Grid item xs={12}>
        <Controller
          name="email"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              fullWidth
              type="email"
              label="Email Address"
              error={!!errors.email}
              helperText={errors.email?.message}
              required
            />
          )}
        />
      </Grid>

      <Grid item xs={12}>
        <Controller
          name="phone"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              fullWidth
              label="Phone Number"
              error={!!errors.phone}
              helperText={errors.phone?.message}
              required
            />
          )}
        />
      </Grid>

      <Grid item xs={12}>
        <Controller
          name="password"
          control={control}
          render={({ field }) => (
            <FormControl fullWidth error={!!errors.password}>
              <TextField
                {...field}
                type="password"
                label="Password"
                error={!!errors.password}
                required
              />
              <FormHelperText>{errors.password?.message}</FormHelperText>
              <PasswordStrengthMeter password={password} />
            </FormControl>
          )}
        />
      </Grid>

      <Grid item xs={12}>
        <Controller
          name="confirmPassword"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              fullWidth
              type="password"
              label="Confirm Password"
              error={!!errors.confirmPassword}
              helperText={errors.confirmPassword?.message}
              required
            />
          )}
        />
      </Grid>

      <Grid item xs={12} sm={6}>
        <Controller
          name="birthDate"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              fullWidth
              type="date"
              label="Birth Date"
              error={!!errors.birthDate}
              helperText={errors.birthDate?.message}
              required
            />
          )}
        />
      </Grid>
    </Grid>
  );
};

export default PersonalInfoSection;