import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Stepper,
  Step,
  StepLabel,
  CircularProgress,
  Alert,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
} from '@mui/material';
import {
  CloudUpload as UploadIcon,
  CheckCircle as CheckIcon,
  Error as ErrorIcon,
  Pending as PendingIcon,
} from '@mui/icons-material';
import { volunteerService } from '../../services/volunteerService';
import { ImageProcessor } from '../../utils/imageProcessor';

interface BackgroundCheckProps {
  userId: string;
  onStatusChange?: (status: string) => void;
}

interface Document {
  type: string;
  url: string;
  uploaded_at: string;
}

const BackgroundCheck: React.FC<BackgroundCheckProps> = ({
  userId,
  onStatusChange,
}) => {
  const [status, setStatus] = useState<string>('pending');
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [uploadType, setUploadType] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    fetchBackgroundCheck();
  }, [userId]);

  const fetchBackgroundCheck = async () => {
    try {
      setLoading(true);
      const data = await volunteerService.getBackgroundCheckStatus(userId);
      setStatus(data.status);
      setDocuments(data.documents || []);
      setNotes(data.notes || '');
      onStatusChange?.(data.status);
    } catch (error) {
      console.error('Error fetching background check:', error);
      setError('Failed to load background check status');
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setLoading(true);
      setError(null);

      // Process and upload document
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', uploadType);

      await volunteerService.submitBackgroundCheck(userId, [{
        type: uploadType,
        url: await ImageProcessor.uploadProfileImage(userId, file, file.type)
      }]);

      setShowUploadDialog(false);
      fetchBackgroundCheck();
    } catch (error) {
      console.error('Error uploading document:', error);
      setError('Failed to upload document');
    } finally {
      setLoading(false);
    }
  };

  const getStepIcon = (stepStatus: string) => {
    switch (stepStatus) {
      case 'approved':
        return <CheckIcon color="success" />;
      case 'rejected':
        return <ErrorIcon color="error" />;
      case 'pending':
        return <PendingIcon color="warning" />;
      default:
        return <PendingIcon />;
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight={400}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Background Check Status
          </Typography>

          <Stepper activeStep={getStepNumber(status)} sx={{ mb: 4 }}>
            <Step>
              <StepLabel StepIconComponent={() => getStepIcon('approved')}>
                Documents Submitted
              </StepLabel>
            </Step>
            <Step>
              <StepLabel StepIconComponent={() => getStepIcon(status)}>
                Verification
              </StepLabel>
            </Step>
            <Step>
              <StepLabel StepIconComponent={() => getStepIcon(status === 'approved' ? 'approved' : 'pending')}>
                Approval
              </StepLabel>
            </Step>
          </Stepper>

          <Box mb={4}>
            <Typography variant="subtitle1" gutterBottom>
              Required Documents
            </Typography>
            <List>
              {documents.map((doc) => (
                <ListItem key={doc.type}>
                  <ListItemIcon>
                    <CheckIcon color="success" />
                  </ListItemIcon>
                  <ListItemText
                    primary={doc.type}
                    secondary={`Uploaded on ${new Date(doc.uploaded_at).toLocaleDateString()}`}
                  />
                </ListItem>
              ))}
            </List>

            {status !== 'approved' && (
              <Button
                variant="contained"
                startIcon={<UploadIcon />}
                onClick={() => setShowUploadDialog(true)}
                disabled={loading}
              >
                Upload Document
              </Button>
            )}
          </Box>

          {notes && (
            <Box mt={2}>
              <Typography variant="subtitle2" gutterBottom>
                Notes
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {notes}
              </Typography>
            </Box>
          )}

          {error && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {error}
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Upload Dialog */}
      <Dialog
        open={showUploadDialog}
        onClose={() => setShowUploadDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Upload Document</DialogTitle>
        <DialogContent>
          <Box py={2}>
            <TextField
              fullWidth
              select
              label="Document Type"
              value={uploadType}
              onChange={(e) => setUploadType(e.target.value)}
              SelectProps={{
                native: true,
              }}
              margin="normal"
            >
              <option value="">Select type</option>
              <option value="id">Government ID</option>
              <option value="criminal_record">Criminal Record Check</option>
              <option value="reference">Reference Letter</option>
            </TextField>

            <Box mt={2}>
              <input
                type="file"
                id="document-upload"
                hidden
                accept="image/*,.pdf"
                onChange={handleFileUpload}
              />
              <Button
                variant="outlined"
                component="label"
                htmlFor="document-upload"
                startIcon={<UploadIcon />}
                disabled={!uploadType}
                fullWidth
              >
                Select File
              </Button>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowUploadDialog(false)}>
            Cancel
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

const getStepNumber = (status: string): number => {
  switch (status) {
    case 'approved':
      return 3;
    case 'rejected':
      return 1;
    case 'pending':
      return 1;
    default:
      return 0;
  }
};

export default BackgroundCheck; 