import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '../tests/utils';
import VolunteerCalendar from './VolunteerCalendar';
import { volunteerService } from '../../services/volunteerService';

// Mock volunteerService
vi.mock('../../services/volunteerService', () => ({
  volunteerService: {
    getVolunteerSchedule: vi.fn(),
    requestShiftSwap: vi.fn(),
    cancelShift: vi.fn(),
  },
}));

describe('VolunteerCalendar', () => {
  const mockUserId = 'test-user-id';
  const mockSchedule = [
    {
      assignment_id: '1',
      opportunity_id: '1',
      opportunity_title: 'Test Opportunity',
      date: '2024-03-20',
      start_time: '09:00',
      end_time: '17:00',
      status: 'approved',
    },
  ];

  beforeEach(() => {
    vi.resetAllMocks();
    (volunteerService.getVolunteerSchedule as any).mockResolvedValue(mockSchedule);
  });

  it('renders loading state initially', () => {
    render(<VolunteerCalendar userId={mockUserId} />);
    expect(screen.getByText('Loading schedule...')).toBeInTheDocument();
  });

  it('displays schedule after loading', async () => {
    render(<VolunteerCalendar userId={mockUserId} />);
    
    await waitFor(() => {
      expect(screen.queryByText('Loading schedule...')).not.toBeInTheDocument();
    });
    
    expect(screen.getByText('Test Opportunity')).toBeInTheDocument();
  });

  it('handles shift cancellation', async () => {
    (volunteerService.cancelShift as any).mockResolvedValue(true);
    
    render(<VolunteerCalendar userId={mockUserId} />);
    
    await waitFor(() => {
      expect(screen.queryByText('Loading schedule...')).not.toBeInTheDocument();
    });
    
    // Click on the event to open the dialog
    fireEvent.click(screen.getByText('Test Opportunity'));
    
    // Click cancel button
    const cancelButton = screen.getByLabelText('Cancel shift');
    fireEvent.click(cancelButton);
    
    await waitFor(() => {
      expect(volunteerService.cancelShift).toHaveBeenCalledWith('1');
    });
  });

  it('handles error state', async () => {
    (volunteerService.getVolunteerSchedule as any).mockRejectedValue(new Error('Failed to load'));
    
    render(<VolunteerCalendar userId={mockUserId} />);
    
    await waitFor(() => {
      expect(screen.getByText('Failed to load schedule')).toBeInTheDocument();
    });
  });
}); 