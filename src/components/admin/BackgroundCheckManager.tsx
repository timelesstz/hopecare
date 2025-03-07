import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  IconButton,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  CircularProgress,
  Alert,
  Tooltip,
  Link,
} from '@mui/material';
import {
  Visibility as ViewIcon,
  CheckCircle as ApproveIcon,
  Cancel as RejectIcon,
  Download as DownloadIcon,
} from '@mui/icons-material';
import { volunteerService } from '../../services/volunteerService';

interface BackgroundCheck {
  id: string;
  volunteer_id: string;
  volunteer_name: string;
  status: string;
  documents: {
    type: string;
    url: string;
    uploaded_at: string;
  }[];
  submitted_at: string;
  processed_at?: string;
  notes?: string;
}

const BackgroundCheckManager: React.FC = () => {
  const [checks, setChecks] = useState<BackgroundCheck[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCheck, setSelectedCheck] = useState<BackgroundCheck | null>(null);
  const [showDialog, setShowDialog] = useState(false);
  const [processingNotes, setProcessingNotes] = useState('');

  useEffect(() => {
    fetchBackgroundChecks();
  }, []);

  const fetchBackgroundChecks = async () => {
    try {
      setLoading(true);
      const data = await volunteerService.getPendingBackgroundChecks();
      setChecks(data);
    } catch (error) {
      console.error('Error fetching background checks:', error);
      setError('Failed to load background checks');
    } finally {
      setLoading(false);
    }
  };

  const handleProcess = async (status: 'approved' | 'rejected') => {
    if (!selectedCheck) return;

    try {
      setLoading(true);
      await volunteerService.processBackgroundCheck(
        selectedCheck.volunteer_id,
        status,
        processingNotes
      );
      setShowDialog(false);
      setProcessingNotes('');
      fetchBackgroundChecks();
    } catch (error) {
      console.error('Error processing background check:', error);
      setError('Failed to process background check');
    } finally {
      setLoading(false);
    }
  };

  const handleView = (check: BackgroundCheck) => {
    setSelectedCheck(check);
    setShowDialog(true);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'success';
      case 'rejected':
        return 'error';
      case 'pending':
        return 'warning';
      default:
        return 'default';
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
            Background Check Management
          </Typography>

          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Volunteer</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Submitted</TableCell>
                  <TableCell>Documents</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {checks.map((check) => (
                  <TableRow key={check.id}>
                    <TableCell>{check.volunteer_name}</TableCell>
                    <TableCell>
                      <Chip
                        label={check.status}
                        color={getStatusColor(check.status)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      {new Date(check.submitted_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      {check.documents.length} document(s)
                    </TableCell>
                    <TableCell>
                      <Tooltip title="View Details">
                        <IconButton
                          size="small"
                          onClick={() => handleView(check)}
                        >
                          <ViewIcon />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          {error && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {error}
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Details Dialog */}
      <Dialog
        open={showDialog}
        onClose={() => setShowDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Background Check Details
        </DialogTitle>
        <DialogContent>
          {selectedCheck && (
            <Box py={2}>
              <Typography variant="subtitle1" gutterBottom>
                Volunteer: {selectedCheck.volunteer_name}
              </Typography>
              
              <Typography variant="subtitle2" gutterBottom sx={{ mt: 2 }}>
                Submitted Documents
              </Typography>
              <TableContainer component={Paper} variant="outlined">
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Type</TableCell>
                      <TableCell>Uploaded</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {selectedCheck.documents.map((doc) => (
                      <TableRow key={doc.type}>
                        <TableCell>{doc.type}</TableCell>
                        <TableCell>
                          {new Date(doc.uploaded_at).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <Link href={doc.url} target="_blank">
                            <IconButton size="small">
                              <DownloadIcon />
                            </IconButton>
                          </Link>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>

              <TextField
                fullWidth
                multiline
                rows={4}
                label="Processing Notes"
                value={processingNotes}
                onChange={(e) => setProcessingNotes(e.target.value)}
                margin="normal"
              />
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowDialog(false)}>
            Cancel
          </Button>
          <Button
            startIcon={<RejectIcon />}
            color="error"
            onClick={() => handleProcess('rejected')}
            disabled={loading}
          >
            Reject
          </Button>
          <Button
            startIcon={<ApproveIcon />}
            color="success"
            variant="contained"
            onClick={() => handleProcess('approved')}
            disabled={loading}
          >
            Approve
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default BackgroundCheckManager; 