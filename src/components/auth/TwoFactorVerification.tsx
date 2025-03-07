import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  CircularProgress,
  Alert,
} from '@mui/material';
import { userService } from '../../services/userService';

interface TwoFactorVerificationProps {
  userId: string;
  onVerificationSuccess: () => void;
  onCancel: () => void;
}

const TwoFactorVerification: React.FC<TwoFactorVerificationProps> = ({
  userId,
  onVerificationSuccess,
  onCancel,
}) => {
  const [verificationCode, setVerificationCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const isValid = await userService.verifyTwoFactorToken(
        userId,
        verificationCode
      );

      if (isValid) {
        onVerificationSuccess();
      } else {
        setError('Invalid verification code');
      }
    } catch (error) {
      console.error('2FA verification error:', error);
      setError('Failed to verify code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardContent>
        <Box
          component="form"
          onSubmit={handleSubmit}
          display="flex"
          flexDirection="column"
          alignItems="center"
          gap={3}
        >
          <Typography variant="h5" component="h2" gutterBottom>
            Two-Factor Authentication
          </Typography>

          <Typography variant="body1" color="textSecondary" align="center">
            Please enter the verification code from your authenticator app to
            continue.
          </Typography>

          <TextField
            fullWidth
            label="Verification Code"
            value={verificationCode}
            onChange={(e) => setVerificationCode(e.target.value)}
            disabled={loading}
            autoFocus
            inputProps={{
              maxLength: 6,
              pattern: '[0-9]*',
            }}
            placeholder="000000"
          />

          {error && (
            <Alert severity="error" sx={{ width: '100%' }}>
              {error}
            </Alert>
          )}

          <Box display="flex" gap={2} width="100%">
            <Button
              variant="outlined"
              onClick={onCancel}
              disabled={loading}
              fullWidth
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              disabled={loading || verificationCode.length !== 6}
              fullWidth
            >
              {loading ? <CircularProgress size={24} /> : 'Verify'}
            </Button>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

export default TwoFactorVerification; 