import React from 'react';
import { Control, UseFormRegister, FieldErrors, Controller } from 'react-hook-form';
import {
  TextField,
  Grid,
  Autocomplete,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  Typography,
  Box
} from '@mui/material';
import { VolunteerFormData } from '../../../types/volunteer';

interface SkillsLanguagesSectionProps {
  control: Control<VolunteerFormData>;
  register: UseFormRegister<VolunteerFormData>;
  errors: FieldErrors<VolunteerFormData>;
}

const skillOptions = [
  'Teaching',
  'Mentoring',
  'Healthcare',
  'First Aid',
  'Counseling',
  'Project Management',
  'Event Planning',
  'Social Media',
  'Fundraising',
  'Grant Writing',
  'Web Development',
  'Graphic Design',
  'Photography',
  'Video Editing',
  'Translation',
  'Public Speaking',
  'Leadership',
  'Administrative',
  'Research',
  'Data Analysis'
];

const languageOptions = [
  'English',
  'Spanish',
  'French',
  'Arabic',
  'Mandarin',
  'Hindi',
  'Portuguese',
  'Bengali',
  'Russian',
  'Japanese',
  'Swahili',
  'Korean',
  'German',
  'Italian',
  'Turkish'
];

const proficiencyLevels = [
  'Beginner',
  'Intermediate',
  'Advanced',
  'Native/Fluent'
];

const SkillsLanguagesSection: React.FC<SkillsLanguagesSectionProps> = ({
  control,
  errors
}) => {
  return (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Typography variant="h6" gutterBottom>
          Skills & Expertise
        </Typography>
      </Grid>

      <Grid item xs={12}>
        <Controller
          name="skills"
          control={control}
          render={({ field: { onChange, value } }) => (
            <Autocomplete
              multiple
              options={skillOptions}
              value={value || []}
              onChange={(_, newValue) => onChange(newValue)}
              renderTags={(tagValue, getTagProps) =>
                tagValue.map((option, index) => (
                  <Chip
                    label={option}
                    {...getTagProps({ index })}
                    color="primary"
                    variant="outlined"
                  />
                ))
              }
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Skills"
                  error={!!errors.skills}
                  helperText={errors.skills?.message}
                  placeholder="Select your skills"
                />
              )}
            />
          )}
        />
      </Grid>

      <Grid item xs={12}>
        <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
          Languages
        </Typography>
      </Grid>

      <Grid item xs={12}>
        <Controller
          name="languages"
          control={control}
          render={({ field: { onChange, value } }) => (
            <Box>
              {(value || []).map((lang: any, index: number) => (
                <Grid container spacing={2} key={index} sx={{ mb: 2 }}>
                  <Grid item xs={12} sm={6}>
                    <Autocomplete
                      options={languageOptions}
                      value={lang.language || ''}
                      onChange={(_, newValue) => {
                        const newLanguages = [...(value || [])];
                        newLanguages[index] = {
                          ...newLanguages[index],
                          language: newValue
                        };
                        onChange(newLanguages);
                      }}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label="Language"
                          error={!!errors.languages?.[index]?.language}
                          helperText={errors.languages?.[index]?.language?.message}
                        />
                      )}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <FormControl
                      fullWidth
                      error={!!errors.languages?.[index]?.proficiency}
                    >
                      <InputLabel>Proficiency Level</InputLabel>
                      <Select
                        value={lang.proficiency || ''}
                        onChange={(e) => {
                          const newLanguages = [...(value || [])];
                          newLanguages[index] = {
                            ...newLanguages[index],
                            proficiency: e.target.value
                          };
                          onChange(newLanguages);
                        }}
                        label="Proficiency Level"
                      >
                        {proficiencyLevels.map((level) => (
                          <MenuItem key={level} value={level}>
                            {level}
                          </MenuItem>
                        ))}
                      </Select>
                      {errors.languages?.[index]?.proficiency && (
                        <FormHelperText>
                          {errors.languages[index]?.proficiency?.message}
                        </FormHelperText>
                      )}
                    </FormControl>
                  </Grid>
                </Grid>
              ))}
              <Box sx={{ mt: 2 }}>
                <Typography
                  variant="button"
                  sx={{ cursor: 'pointer', color: 'primary.main' }}
                  onClick={() => {
                    onChange([...(value || []), { language: '', proficiency: '' }]);
                  }}
                >
                  + Add Language
                </Typography>
              </Box>
            </Box>
          )}
        />
      </Grid>

      <Grid item xs={12}>
        <Controller
          name="additionalSkills"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              fullWidth
              multiline
              rows={4}
              label="Additional Skills or Certifications"
              placeholder="Please list any additional skills, certifications, or qualifications you'd like to share"
              error={!!errors.additionalSkills}
              helperText={errors.additionalSkills?.message}
            />
          )}
        />
      </Grid>
    </Grid>
  );
};

export default SkillsLanguagesSection;