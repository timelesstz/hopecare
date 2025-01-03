import React, { useState, useEffect } from 'react';
import { Save, X } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import { Database } from '../../types/supabase';

type VolunteerAvailability = Database['public']['Tables']['volunteer_availability']['Row'];

interface TimeSlot {
  id: string;
  day: string;
  startTime: string;
  endTime: string;
  isRecurring: boolean;
}

const DAYS_OF_WEEK = [
  'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'
];

const TIME_SLOTS = Array.from({ length: 24 }, (_, i) => {
  const hour = i.toString().padStart(2, '0');
  return `${hour}:00`;
});

const VolunteerAvailabilityComponent: React.FC = () => {
  const { user } = useAuth();
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadAvailability();
  }, [user]);

  const loadAvailability = async () => {
    if (!user?.id) return;

    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('volunteer_availability')
        .select('*')
        .eq('volunteer_id', user.id);

      if (error) throw error;

      if (data) {
        const formattedSlots: TimeSlot[] = data.map(slot => ({
          id: slot.id,
          day: slot.day,
          startTime: slot.start_time,
          endTime: slot.end_time,
          isRecurring: slot.is_recurring
        }));
        setTimeSlots(formattedSlots);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const addTimeSlot = () => {
    const newSlot: TimeSlot = {
      id: Date.now().toString(),
      day: DAYS_OF_WEEK[0],
      startTime: '09:00',
      endTime: '17:00',
      isRecurring: true
    };
    setTimeSlots([...timeSlots, newSlot]);
  };

  const removeTimeSlot = (id: string) => {
    setTimeSlots(timeSlots.filter(slot => slot.id !== id));
  };

  const updateTimeSlot = (id: string, updates: Partial<TimeSlot>) => {
    setTimeSlots(timeSlots.map(slot =>
      slot.id === id ? { ...slot, ...updates } : slot
    ));
  };

  const saveAvailability = async () => {
    if (!user?.id) return;

    try {
      setIsLoading(true);
      setError(null);

      // Validate time slots
      for (const slot of timeSlots) {
        if (slot.startTime >= slot.endTime) {
          throw new Error('End time must be after start time');
        }
      }

      // Delete existing availability
      await supabase
        .from('volunteer_availability')
        .delete()
        .eq('volunteer_id', user.id);

      // Insert new availability
      const { error } = await supabase
        .from('volunteer_availability')
        .insert(timeSlots.map(slot => ({
          volunteer_id: user.id,
          day: slot.day,
          start_time: slot.startTime,
          end_time: slot.endTime,
          is_recurring: slot.isRecurring
        })));

      if (error) throw error;

      setIsEditing(false);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-rose-600"></div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-900">Availability Schedule</h2>
        <div className="flex space-x-2">
          {isEditing ? (
            <>
              <button
                onClick={saveAvailability}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-rose-600 hover:bg-rose-700"
              >
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </button>
              <button
                onClick={() => {
                  setIsEditing(false);
                  loadAvailability();
                }}
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                <X className="h-4 w-4 mr-2" />
                Cancel
              </button>
            </>
          ) : (
            <button
              onClick={() => setIsEditing(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-rose-600 hover:bg-rose-700"
            >
              Edit Schedule
            </button>
          )}
        </div>
      </div>

      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md">
          {error}
        </div>
      )}

      <div className="space-y-4">
        {timeSlots.map(slot => (
          <div
            key={slot.id}
            className="flex items-center space-x-4 p-4 border rounded-lg hover:border-rose-200"
          >
            <div className="flex-1">
              <select
                value={slot.day}
                onChange={(e) => updateTimeSlot(slot.id, { day: e.target.value })}
                disabled={!isEditing}
                className="mr-4 border-gray-300 rounded-md shadow-sm focus:border-rose-500 focus:ring-rose-500"
              >
                {DAYS_OF_WEEK.map(day => (
                  <option key={day} value={day}>{day}</option>
                ))}
              </select>

              <select
                value={slot.startTime}
                onChange={(e) => updateTimeSlot(slot.id, { startTime: e.target.value })}
                disabled={!isEditing}
                className="mr-2 border-gray-300 rounded-md shadow-sm focus:border-rose-500 focus:ring-rose-500"
              >
                {TIME_SLOTS.map(time => (
                  <option key={time} value={time}>{time}</option>
                ))}
              </select>

              <span className="mx-2">to</span>

              <select
                value={slot.endTime}
                onChange={(e) => updateTimeSlot(slot.id, { endTime: e.target.value })}
                disabled={!isEditing}
                className="mr-4 border-gray-300 rounded-md shadow-sm focus:border-rose-500 focus:ring-rose-500"
              >
                {TIME_SLOTS.map(time => (
                  <option key={time} value={time}>{time}</option>
                ))}
              </select>

              <label className="inline-flex items-center">
                <input
                  type="checkbox"
                  checked={slot.isRecurring}
                  onChange={(e) => updateTimeSlot(slot.id, { isRecurring: e.target.checked })}
                  disabled={!isEditing}
                  className="rounded border-gray-300 text-rose-600 focus:ring-rose-500"
                />
                <span className="ml-2 text-sm text-gray-600">Recurring</span>
              </label>
            </div>

            {isEditing && (
              <button
                onClick={() => removeTimeSlot(slot.id)}
                className="text-gray-400 hover:text-gray-500"
              >
                <X className="h-5 w-5" />
              </button>
            )}
          </div>
        ))}

        {isEditing && (
          <button
            onClick={addTimeSlot}
            className="w-full py-2 px-4 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-rose-300 hover:text-rose-600"
          >
            + Add Time Slot
          </button>
        )}
      </div>
    </div>
  );
};

export default VolunteerAvailabilityComponent;
