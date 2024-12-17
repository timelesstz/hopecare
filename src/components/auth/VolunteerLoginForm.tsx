import React from 'react';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { TextField, Button, FormControlLabel, Checkbox, Box } from '@mui/material';
import { Mail, Lock } from 'lucide-react';

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  rememberMe: z.boolean().optional()
});

type LoginFormData = z.infer<typeof loginSchema>;

interface VolunteerLoginFormProps {
  onSubmit: (data: LoginFormData) => void;
  isLoading: boolean;
}

const VolunteerLoginForm: React.FC<VolunteerLoginFormProps> = ({ onSubmit, isLoading }) => {
  const { control, handleSubmit, formState: { errors } } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
      rememberMe: false
    }
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Controller
        name="email"
        control={control}
        render={({ field }) => (
          <Box sx={{ position: 'relative' }}>
            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <TextField
              {...field}
              margin="normal"
              required
              fullWidth
              id="email"
              label="Email Address"
              autoComplete="email"
              autoFocus
              error={!!errors.email}
              helperText={errors.email?.message}
              disabled={isLoading}
              InputProps={{
                sx: { pl: 5 }
              }}
            />
          </Box>
        )}
      />

      <Controller
        name="password"
        control={control}
        render={({ field }) => (
          <Box sx={{ position: 'relative' }}>
            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <TextField
              {...field}
              margin="normal"
              required
              fullWidth
              label="Password"
              type="password"
              id="password"
              autoComplete="current-password"
              error={!!errors.password}
              helperText={errors.password?.message}
              disabled={isLoading}
              InputProps={{
                sx: { pl: 5 }
              }}
            />
          </Box>
        )}
      />

      <Controller
        name="rememberMe"
        control={control}
        render={({ field }) => (
          <FormControlLabel
            control={
              <Checkbox
                {...field}
                checked={field.value}
                color="primary"
                disabled={isLoading}
              />
            }
            label="Remember me"
          />
        )}
      />

      <Box sx={{ mt: 3 }}>
        <Button
          type="submit"
          fullWidth
          variant="contained"
          disabled={isLoading}
        >
          {isLoading ? 'Signing in...' : 'Sign In'}
        </Button>
      </Box>

      <Box sx={{ mt: 4, textAlign: 'left' }}>
        <p>Sample volunteer accounts:</p>
        <ul>
          <li><strong>Program Lead:</strong> emma.parker@example.com / Volunteer2024!</li>
          <li><strong>Event Volunteer:</strong> michael.chen@example.com / Community2024@</li>
          <li><strong>Coordinator:</strong> sofia.rodriguez@example.com / Helping2024#</li>
        </ul>
      </Box>
    </form>
  );
};

export default VolunteerLoginForm;