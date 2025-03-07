import React, { useState, useEffect } from 'react';
import { userService } from '../../services/userService';
import {
  Card,
  CardContent,
  CardHeader,
  Divider,
  Grid,
  TextField,
  Button,
  Switch,
  FormControlLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Alert,
  Snackbar,
  Box,
} from '@mui/material';
import QRCode from 'qrcode.react';

interface SecuritySettingsProps {
  userId: string;
}

const SecuritySettings: React.FC<SecuritySettingsProps> = ({ userId }) => {
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [showQRCode, setShowQRCode] = useState(false);
  const [qrCodeData, setQRCodeData] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [notification, setNotification] = useState<{
    message: string;
    type: 'success' | 'error';
  } | null>(null);

  useEffect(() => {
    fetchSecuritySettings();
  }, [userId]);

  const fetchSecuritySettings = async () => {
    try {
      const user = await userService.getUserWithProfile(userId);
      setTwoFactorEnabled(user.two_factor_enabled);
    } catch (error) {
      console.error('Error fetching security settings:', error);
      showNotification('Failed to load security settings', 'error');
    }
  };

  const handlePasswordChange = async (event: React.FormEvent) => {
    event.preventDefault();

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      showNotification('New passwords do not match', 'error');
      return;
    }

    try {
      await userService.changePassword(
        userId,
        passwordForm.currentPassword,
        passwordForm.newPassword
      );

      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });

      showNotification('Password changed successfully', 'success');
    } catch (error) {
      console.error('Error changing password:', error);
      showNotification('Failed to change password', 'error');
    }
  };

  const handleTwoFactorToggle = async () => {
    if (!twoFactorEnabled) {
      try {
        const { secret, qrCode } = await userService.initializeTwoFactor(userId);
        setQRCodeData(qrCode);
        setShowQRCode(true);
      } catch (error) {
        console.error('Error initializing 2FA:', error);
        showNotification('Failed to initialize two-factor authentication', 'error');
      }
    } else {
      try {
        await userService.disableTwoFactor(userId);
        setTwoFactorEnabled(false);
        showNotification('Two-factor authentication disabled', 'success');
      } catch (error) {
        console.error('Error disabling 2FA:', error);
        showNotification('Failed to disable two-factor authentication', 'error');
      }
    }
  };

  const handleVerifyTwoFactor = async () => {
    try {
      await userService.verifyAndEnableTwoFactor(userId, verificationCode);
      setTwoFactorEnabled(true);
      setShowQRCode(false);
      setVerificationCode('');
      showNotification('Two-factor authentication enabled', 'success');
    } catch (error) {
      console.error('Error verifying 2FA:', error);
      showNotification('Invalid verification code', 'error');
    }
  };

  const showNotification = (message: string, type: 'success' | 'error') => {
    setNotification({ message, type });
  };

  return (
    <Grid container spacing={3}>
      {/* Password Change Section */}
      <Grid item xs={12}>
        <Card>
          <CardHeader title="Change Password" />
          <Divider />
          <CardContent>
            <form onSubmit={handlePasswordChange}>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Current Password"
                    type="password"
                    value={passwordForm.currentPassword}
                    onChange={(e) =>
                      setPasswordForm({
                        ...passwordForm,
                        currentPassword: e.target.value,
                      })
                    }
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="New Password"
                    type="password"
                    value={passwordForm.newPassword}
                    onChange={(e) =>
                      setPasswordForm({
                        ...passwordForm,
                        newPassword: e.target.value,
                      })
                    }
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Confirm New Password"
                    type="password"
                    value={passwordForm.confirmPassword}
                    onChange={(e) =>
                      setPasswordForm({
                        ...passwordForm,
                        confirmPassword: e.target.value,
                      })
                    }
                  />
                </Grid>
                <Grid item xs={12}>
                  <Button
                    type="submit"
                    variant="contained"
                    color="primary"
                    disabled={
                      !passwordForm.currentPassword ||
                      !passwordForm.newPassword ||
                      !passwordForm.confirmPassword
                    }
                  >
                    Change Password
                  </Button>
                </Grid>
              </Grid>
            </form>
          </CardContent>
        </Card>
      </Grid>

      {/* Two-Factor Authentication Section */}
      <Grid item xs={12}>
        <Card>
          <CardHeader title="Two-Factor Authentication" />
          <Divider />
          <CardContent>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={twoFactorEnabled}
                      onChange={handleTwoFactorToggle}
                      color="primary"
                    />
                  }
                  label={`Two-factor authentication is ${
                    twoFactorEnabled ? 'enabled' : 'disabled'
                  }`}
                />
              </Grid>
              <Grid item xs={12}>
                <Typography variant="body2" color="textSecondary">
                  Two-factor authentication adds an extra layer of security to your
                  account by requiring a verification code in addition to your
                  password when signing in.
                </Typography>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Grid>

      {/* QR Code Dialog */}
      <Dialog open={showQRCode} onClose={() => setShowQRCode(false)}>
        <DialogTitle>Set Up Two-Factor Authentication</DialogTitle>
        <DialogContent>
          <Box display="flex" flexDirection="column" alignItems="center" p={2}>
            <Typography variant="body1" gutterBottom>
              1. Scan this QR code with your authenticator app
            </Typography>
            <Box my={2}>
              <QRCode value={qrCodeData} size={200} />
            </Box>
            <Typography variant="body1" gutterBottom>
              2. Enter the verification code from your app
            </Typography>
            <TextField
              fullWidth
              label="Verification Code"
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value)}
              margin="normal"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowQRCode(false)}>Cancel</Button>
          <Button
            onClick={handleVerifyTwoFactor}
            color="primary"
            disabled={!verificationCode}
          >
            Verify and Enable
          </Button>
        </DialogActions>
      </Dialog>

      {/* Notification */}
      <Snackbar
        open={!!notification}
        autoHideDuration={6000}
        onClose={() => setNotification(null)}
      >
        {notification && (
          <Alert
            onClose={() => setNotification(null)}
            severity={notification.type}
          >
            {notification.message}
          </Alert>
        )}
      </Snackbar>
    </Grid>
  );
};

export default SecuritySettings; 