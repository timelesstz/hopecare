import React from 'react';
import { Control, UseFormRegister, Controller } from 'react-hook-form';
import {
  Grid,
  FormControl,
  FormControlLabel,
  FormGroup,
  FormLabel,
  Checkbox,
  TextField,
  Typography,
  Radio,
  RadioGroup,
  FormHelperText
} from '@mui/material';
import { VolunteerFormData } from '../../../types/volunteer';

interface AvailabilitySectionProps {
  control: Control<VolunteerFormData>;
  register: UseFormRegister<VolunteerFormData>;
}

const daysOfWeek = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday'
];

const timeSlots = [
  'Morning (9am-12pm)',
  'Afternoon (12pm-5pm)',
  'Evening (5pm-9pm)'
];

const commitmentLevels = [
  'Regular (Weekly)',
  'Occasional (Monthly)',
  'On-Call (As Needed)',
  'Project-Based'
];

const AvailabilitySection: React.FC<AvailabilitySectionProps> = ({
  control
}) => {
  return (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Typography variant="h6" gutterBottom>
          Availability & Commitment
        </Typography>
      </Grid>

      <Grid item xs={12}>
        <FormControl component="fieldset">
          <FormLabel component="legend">Preferred Commitment Level</FormLabel>
          <Controller
            name="commitmentLevel"
            control={control}
            render={({ field }) => (
              <RadioGroup {...field} row>
                {commitmentLevels.map((level) => (
                  <FormControlLabel
                    key={level}
                    value={level}
                    control={<Radio />}
                    label={level}
                  />
                ))}
              </RadioGroup>
            )}
          />
        </FormControl>
      </Grid>

      <Grid item xs={12}>
        <FormControl component="fieldset">
          <FormLabel component="legend">Available Days</FormLabel>
          <FormGroup row>
            {daysOfWeek.map((day) => (
              <Controller
                key={day}
                name={`availableDays.${day.toLowerCase()}`}
                control={control}
                render={({ field: { value, ...field } }) => (
                  <FormControlLabel
                    control={
                      <Checkbox
                        {...field}
                        checked={value || false}
                      />
                    }
                    label={day}
                  />
                )}
              />
            ))}
          </FormGroup>
        </FormControl>
      </Grid>

      <Grid item xs={12}>
        <FormControl component="fieldset">
          <FormLabel component="legend">Preferred Time Slots</FormLabel>
          <FormGroup row>
            {timeSlots.map((slot) => (
              <Controller
                key={slot}
                name={`timeSlots.${slot.split(' ')[0].toLowerCase()}`}
                control={control}
                render={({ field: { value, ...field } }) => (
                  <FormControlLabel
                    control={
                      <Checkbox
                        {...field}
                        checked={value || false}
                      />
                    }
                    label={slot}
                  />
                )}
              />
            ))}
          </FormGroup>
        </FormControl>
      </Grid>

      <Grid item xs={12}>
        <Controller
          name="hoursPerWeek"
          control={control}
          render={({ field, fieldState: { error } }) => (
            <FormControl fullWidth error={!!error}>
              <TextField
                {...field}
                type="number"
                label="Hours Available Per Week"
                InputProps={{ inputProps: { min: 1, max: 40 } }}
                error={!!error}
                helperText={error?.message}
              />
            </FormControl>
          )}
        />
      </Grid>

      <Grid item xs={12}>
        <Controller
          name="availabilityNotes"
          control={control}
          render={({ field, fieldState: { error } }) => (
            <TextField
              {...field}
              fullWidth
              multiline
              rows={4}
              label="Additional Availability Notes"
              placeholder="Please provide any additional information about your availability or scheduling preferences"
              error={!!error}
              helperText={error?.message}
            />
          )}
        />
      </Grid>

      <Grid item xs={12}>
        <FormControl component="fieldset">
          <FormLabel component="legend">Notice Period</FormLabel>
          <Controller
            name="noticePeriod"
            control={control}
            render={({ field }) => (
              <RadioGroup {...field} row>
                <FormControlLabel
                  value="1day"
                  control={<Radio />}
                  label="1 Day"
                />
                <FormControlLabel
                  value="3days"
                  control={<Radio />}
                  label="3 Days"
                />
                <FormControlLabel
                  value="1week"
                  control={<Radio />}
                  label="1 Week"
                />
                <FormControlLabel
                  value="2weeks"
                  control={<Radio />}
                  label="2 Weeks"
                />
              </RadioGroup>
            )}
          />
        </FormControl>
      </Grid>
    </Grid>
  );
};

export default AvailabilitySection;