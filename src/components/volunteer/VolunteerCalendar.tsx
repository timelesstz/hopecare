import React, { useState, useEffect } from 'react';
import {
  Calendar,
  Views,
  DateLocalizer,
  momentLocalizer,
} from 'react-big-calendar';
import moment from 'moment';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Chip,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  Edit as EditIcon,
  SwapHoriz as SwapIcon,
  Cancel as CancelIcon,
} from '@mui/icons-material';
import { volunteerService } from '../../services/volunteerService';
import { useFirebaseAuth } from '../../context/FirebaseAuthContext';

const localizer = momentLocalizer(moment);

interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  opportunity_id: string;
  status: string;
}

interface VolunteerCalendarProps {
  userId: string;
}

const VolunteerCalendar: React.FC<VolunteerCalendarProps> = ({ userId }) => {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useFirebaseAuth();

  useEffect(() => {
    fetchSchedule();
  }, [userId]);

  const fetchSchedule = async () => {
    try {
      setLoading(true);
      const startDate = moment().startOf('month').toDate();
      const endDate = moment().add(3, 'months').endOf('month').toDate();

      const schedule = await volunteerService.getVolunteerSchedule(
        userId,
        startDate,
        endDate
      );

      const calendarEvents = schedule.map((assignment) => ({
        id: assignment.assignment_id,
        title: assignment.opportunity_title,
        start: new Date(`${assignment.date}T${assignment.start_time}`),
        end: new Date(`${assignment.date}T${assignment.end_time}`),
        opportunity_id: assignment.opportunity_id,
        status: assignment.status,
      }));

      setEvents(calendarEvents);
    } catch (error) {
      console.error('Error fetching schedule:', error);
      setError('Failed to load schedule');
    } finally {
      setLoading(false);
    }
  };

  const handleEventClick = (event: CalendarEvent) => {
    setSelectedEvent(event);
  };

  const handleRequestSwap = async () => {
    if (!selectedEvent) return;

    try {
      // Implement shift swap request logic
      await volunteerService.requestShiftSwap(selectedEvent.id);
      setSelectedEvent(null);
      // Show success message
    } catch (error) {
      console.error('Error requesting swap:', error);
      setError('Failed to request shift swap');
    }
  };

  const handleCancelShift = async () => {
    if (!selectedEvent) return;

    try {
      // Implement shift cancellation logic
      await volunteerService.cancelShift(selectedEvent.id);
      setSelectedEvent(null);
      await fetchSchedule(); // Refresh calendar
    } catch (error) {
      console.error('Error cancelling shift:', error);
      setError('Failed to cancel shift');
    }
  };

  const eventStyleGetter = (event: CalendarEvent) => {
    let backgroundColor = '#3174ad';
    switch (event.status) {
      case 'pending':
        backgroundColor = '#ffa726';
        break;
      case 'approved':
        backgroundColor = '#66bb6a';
        break;
      case 'cancelled':
        backgroundColor = '#ef5350';
        break;
    }

    return {
      style: {
        backgroundColor,
        borderRadius: '4px',
      },
    };
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight={400}>
        <Typography>Loading schedule...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight={400}>
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ height: 600 }}>
      <Calendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        views={['month', 'week', 'day']}
        defaultView={Views.MONTH}
        onSelectEvent={handleEventClick}
        eventPropGetter={eventStyleGetter}
        tooltipAccessor={(event) => event.title}
      />

      {/* Event Details Dialog */}
      <Dialog
        open={!!selectedEvent}
        onClose={() => setSelectedEvent(null)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Typography variant="h6">{selectedEvent?.title}</Typography>
          <Chip
            label={selectedEvent?.status}
            color={
              selectedEvent?.status === 'approved'
                ? 'success'
                : selectedEvent?.status === 'pending'
                ? 'warning'
                : 'error'
            }
            size="small"
            sx={{ ml: 1 }}
          />
        </DialogTitle>
        <DialogContent>
          <Box sx={{ py: 2 }}>
            <Typography variant="body1" gutterBottom>
              <strong>Date:</strong>{' '}
              {selectedEvent?.start.toLocaleDateString()}
            </Typography>
            <Typography variant="body1" gutterBottom>
              <strong>Time:</strong>{' '}
              {`${selectedEvent?.start.toLocaleTimeString()} - ${selectedEvent?.end.toLocaleTimeString()}`}
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSelectedEvent(null)}>Close</Button>
          <Tooltip title="Request shift swap">
            <IconButton
              onClick={handleRequestSwap}
              disabled={selectedEvent?.status === 'cancelled'}
            >
              <SwapIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Cancel shift">
            <IconButton
              onClick={handleCancelShift}
              disabled={selectedEvent?.status === 'cancelled'}
              color="error"
            >
              <CancelIcon />
            </IconButton>
          </Tooltip>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default VolunteerCalendar; 