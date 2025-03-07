import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Grid,
  Typography,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
  Alert,
  IconButton,
  Tooltip,
  Chip,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PendingIcon from '@mui/icons-material/Pending';
import { volunteerService } from '../../services/volunteerService';

interface HourLog {
  id: string;
  opportunity_id: string;
  opportunity_title: string;
  date: string;
  hours: number;
  minutes: number;
  description: string;
  status: 'pending' | 'approved' | 'rejected';
  notes?: string;
  created_at: string;
  updated_at: string;
}

interface HourTrackerProps {
  userId: string;
  opportunityId?: string;
}

const HourTracker: React.FC<HourTrackerProps> = ({ userId, opportunityId }) => {
  const [loading, setLoading] = useState(true);
  const [hourLogs, setHourLogs] = useState<HourLog[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [showDialog, setShowDialog] = useState(false);
  const [selectedLog, setSelectedLog] = useState<HourLog | null>(null);
  const [totalHours, setTotalHours] = useState(0);

  // Form state
  const [formData, setFormData] = useState({
    date: new Date(),
    startTime: new Date(),
    endTime: new Date(),
    description: '',
    opportunity_id: opportunityId || '',
  });

  useEffect(() => {
    fetchHourLogs();
  }, [userId, opportunityId]);

  const fetchHourLogs = async () => {
    try {
      setLoading(true);
      const data = await volunteerService.getVolunteerHours(userId, opportunityId);
      setHourLogs(data.logs);
      setTotalHours(data.total_hours);
    } catch (error) {
      console.error('Error fetching hour logs:', error);
      setError('Failed to load hour logs');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    try {
      const startTime = formData.startTime;
      const endTime = formData.endTime;
      const diffInMinutes = Math.round((endTime.getTime() - startTime.getTime()) / 1000 / 60);
      const hours = Math.floor(diffInMinutes / 60);
      const minutes = diffInMinutes % 60;

      const logData = {
        opportunity_id: formData.opportunity_id,
        date: formData.date.toISOString().split('T')[0],
        hours,
        minutes,
        description: formData.description,
      };

      if (selectedLog) {
        await volunteerService.updateHourLog(selectedLog.id, logData);
      } else {
        await volunteerService.logHours(userId, logData);
      }

      setShowDialog(false);
      setSelectedLog(null);
      resetForm();
      fetchHourLogs();
    } catch (error) {
      console.error('Error saving hour log:', error);
      setError('Failed to save hour log');
    }
  };

  const handleEdit = (log: HourLog) => {
    setSelectedLog(log);
    const logDate = new Date(log.date);
    const baseTime = new Date(log.date);
    
    setFormData({
      date: logDate,
      startTime: baseTime,
      endTime: new Date(baseTime.getTime() + (log.hours * 60 + log.minutes) * 60000),
      description: log.description,
      opportunity_id: log.opportunity_id,
    });
    
    setShowDialog(true);
  };

  const handleDelete = async (logId: string) => {
    if (!window.confirm('Are you sure you want to delete this hour log?')) {
      return;
    }

    try {
      await volunteerService.deleteHourLog(logId);
      fetchHourLogs();
    } catch (error) {
      console.error('Error deleting hour log:', error);
      setError('Failed to delete hour log');
    }
  };

  const resetForm = () => {
    setFormData({
      date: new Date(),
      startTime: new Date(),
      endTime: new Date(),
      description: '',
      opportunity_id: opportunityId || '',
    });
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
      {/* Summary Card */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={6}>
              <Typography variant="h6" gutterBottom>
                Total Volunteer Hours
              </Typography>
              <Typography variant="h3" color="primary">
                {totalHours.toFixed(1)}
              </Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <Box display="flex" justifyContent="flex-end">
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => {
                    setSelectedLog(null);
                    resetForm();
                    setShowDialog(true);
                  }}
                >
                  Log Hours
                </Button>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Hour Logs Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Date</TableCell>
              <TableCell>Opportunity</TableCell>
              <TableCell>Hours</TableCell>
              <TableCell>Description</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {hourLogs.map((log) => (
              <TableRow key={log.id}>
                <TableCell>
                  {new Date(log.date).toLocaleDateString()}
                </TableCell>
                <TableCell>{log.opportunity_title}</TableCell>
                <TableCell>
                  {log.hours + (log.minutes / 60).toFixed(1)}
                </TableCell>
                <TableCell>{log.description}</TableCell>
                <TableCell>
                  <Chip
                    icon={log.status === 'approved' ? <CheckCircleIcon /> : <PendingIcon />}
                    label={log.status.charAt(0).toUpperCase() + log.status.slice(1)}
                    color={log.status === 'approved' ? 'success' : 'default'}
                    variant="outlined"
                  />
                </TableCell>
                <TableCell>
                  <Tooltip title="Edit">
                    <IconButton
                      size="small"
                      onClick={() => handleEdit(log)}
                      disabled={log.status === 'approved'}
                    >
                      <EditIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Delete">
                    <IconButton
                      size="small"
                      onClick={() => handleDelete(log.id)}
                      disabled={log.status === 'approved'}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Log Hours Dialog */}
      <Dialog
        open={showDialog}
        onClose={() => setShowDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {selectedLog ? 'Edit Hours' : 'Log Hours'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <DatePicker
                label="Date"
                value={formData.date}
                onChange={(newValue) => newValue && setFormData({ ...formData, date: newValue })}
                sx={{ width: '100%' }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TimePicker
                label="Start Time"
                value={formData.startTime}
                onChange={(newValue) => newValue && setFormData({ ...formData, startTime: newValue })}
                sx={{ width: '100%' }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TimePicker
                label="End Time"
                value={formData.endTime}
                onChange={(newValue) => newValue && setFormData({ ...formData, endTime: newValue })}
                sx={{ width: '100%' }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={3}
                label="Description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowDialog(false)}>
            Cancel
          </Button>
          <Button
            variant="contained"
            color="primary"
            onClick={handleSubmit}
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>

      {/* Error Notification */}
      {error && (
        <Alert severity="error" onClose={() => setError(null)} sx={{ mt: 2 }}>
          {error}
        </Alert>
      )}
    </Box>
  );
};

export default HourTracker; 