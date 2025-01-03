import { Calendar, Clock, MapPin, Users } from 'lucide-react';

interface Event {
  id: number;
  title: string;
  date: string;
  time: string;
  location: string;
  role: string;
  teamSize: number;
}

const UpcomingEvents: React.FC = () => {
  const events: Event[] = [
    {
      id: 1,
      title: "Community Garden Project",
      date: "March 20, 2024",
      time: "9:00 AM - 2:00 PM",
      location: "Green Valley Park",
      role: "Team Lead",
      teamSize: 8
    },
    {
      id: 2,
      title: "Youth Mentoring Session",
      date: "March 22, 2024",
      time: "3:00 PM - 5:00 PM",
      location: "City Library",
      role: "Mentor",
      teamSize: 4
    }
  ];

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-6">Upcoming Events</h3>
      <div className="space-y-6">
        {events.map((event) => (
          <div key={event.id} className="border rounded-lg p-4">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h4 className="font-medium text-gray-900">{event.title}</h4>
                <p className="text-sm text-rose-600">{event.role}</p>
              </div>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                Confirmed
              </span>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center text-gray-600">
                <Calendar className="h-4 w-4 mr-2" />
                {event.date}
              </div>
              <div className="flex items-center text-gray-600">
                <Clock className="h-4 w-4 mr-2" />
                {event.time}
              </div>
              <div className="flex items-center text-gray-600">
                <MapPin className="h-4 w-4 mr-2" />
                {event.location}
              </div>
              <div className="flex items-center text-gray-600">
                <Users className="h-4 w-4 mr-2" />
                Team of {event.teamSize}
              </div>
            </div>

            <div className="mt-4 flex justify-end space-x-4">
              <button className="text-gray-600 hover:text-gray-900">
                View Details
              </button>
              <button className="text-rose-600 hover:text-rose-700">
                Cancel
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default UpcomingEvents;