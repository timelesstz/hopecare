import { User, Mail, Phone, Award } from 'lucide-react';

interface TeamMember {
  id: number;
  name: string;
  role: string;
  email: string;
  phone: string;
  skills: string[];
  availability: string[];
}

const VolunteerTeam: React.FC = () => {
  const teamMembers: TeamMember[] = [
    {
      id: 1,
      name: "Sarah Johnson",
      role: "Team Member",
      email: "sarah.j@example.com",
      phone: "(555) 123-4567",
      skills: ["Teaching", "First Aid"],
      availability: ["Weekdays", "Evenings"]
    },
    {
      id: 2,
      name: "Michael Chen",
      role: "Team Member",
      email: "m.chen@example.com",
      phone: "(555) 987-6543",
      skills: ["Photography", "Event Planning"],
      availability: ["Weekends"]
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">My Team</h2>
        <button className="bg-rose-600 text-white px-4 py-2 rounded-md hover:bg-rose-700 transition">
          Add Team Member
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {teamMembers.map((member) => (
          <div key={member.id} className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center mb-4">
              <div className="h-12 w-12 bg-rose-100 rounded-full flex items-center justify-center">
                <User className="h-6 w-6 text-rose-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-medium text-gray-900">{member.name}</h3>
                <p className="text-sm text-rose-600">{member.role}</p>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center text-gray-600">
                <Mail className="h-4 w-4 mr-2" />
                {member.email}
              </div>
              <div className="flex items-center text-gray-600">
                <Phone className="h-4 w-4 mr-2" />
                {member.phone}
              </div>
            </div>

            <div className="mt-4">
              <h4 className="text-sm font-medium text-gray-900 mb-2">Skills</h4>
              <div className="flex flex-wrap gap-2">
                {member.skills.map((skill, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-rose-100 text-rose-800"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            <div className="mt-4">
              <h4 className="text-sm font-medium text-gray-900 mb-2">Availability</h4>
              <div className="flex flex-wrap gap-2">
                {member.availability.map((time, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800"
                  >
                    {time}
                  </span>
                ))}
              </div>
            </div>

            <div className="mt-6 flex justify-end space-x-4">
              <button className="text-gray-600 hover:text-gray-900">
                Message
              </button>
              <button className="text-rose-600 hover:text-rose-700">
                Schedule
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default VolunteerTeam;