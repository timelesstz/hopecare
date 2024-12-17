import { Calendar, Clock, MapPin } from 'lucide-react';

interface ScheduleProps {
  expanded?: boolean;
}

const VolunteerSchedule: React.FC<ScheduleProps> = ({ expanded = false }) => {
  const schedule = [
    {
      id: 1,
      title: "Morning Shift - Food Bank",
      date: "Monday, March 18",
      time: "9:00 AM - 12:00 PM",
      location: "Community Center",
      role: "Food Distribution"
    },
    {
      id: 2,
      title: "Afternoon Tutoring",
      date: "Wednesday, March 20",
      time: "3:00 PM - 5:00 PM",
      location: "Public Library",
      role: "Education Support"
    },
    {
      id: 3,
      title: "Weekend Garden Project",
      date: "Saturday, March 23",
      time: "10:00 AM - 2:00 PM",
      location: "Community Garden",
      role: "Team Lead"
    }
  ];

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-semibold text-gray-900">My Schedule</h3>
        {!expanded && (
          <button className="text-rose-600 hover:text-rose-700 text-sm font-medium">
            View Full Schedule
          </button>
        )}
      </div>

      <div className="space-y-4">
        {schedule.map((shift) => (
          <div key={shift.id} className="border rounded-lg p-4">
            <div className="flex justify-between items-start mb-2">
              <h4 className="font-medium text-gray-900">{shift.title}</h4>
              <span className="text-sm text-rose-600">{shift.role}</span>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center text-gray-600">
                <Calendar className="h-4 w-4 mr-2" />
                {shift.date}
              </div>
              <div className="flex items-center text-gray-600">
                <Clock className="h-4 w-4 mr-2" />
                {shift.time}
              </div>
              <div className="flex items-center text-gray-600">
                <MapPin className="h-4 w-4 mr-2" />
                {shift.location}
              </div>
            </div>

            {expanded && (
              <div className="mt-4 flex justify-end space-x-4">
                <button className="text-gray-600 hover:text-gray-900">
                  Request Coverage
                </button>
                <button className="text-rose-600 hover:text-rose-700">
                  Cancel Shift
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {expanded && (
        <div className="mt-6 flex justify-center">
          <button className="bg-rose-600 text-white px-4 py-2 rounded-md hover:bg-rose-700 transition">
            Add New Shift
          </button>
        </div>
      )}
    </div>
  );
};

export default VolunteerSchedule;