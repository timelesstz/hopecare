import { useState } from 'react';
import { User, Mail, Phone, Award, Users, Calendar, ChevronDown, Plus, MessageSquare } from 'lucide-react';
import { Team } from '../../hooks/useVolunteerData';
import { useFirebaseAuth } from '../../context/FirebaseAuthContext';

interface TeamMember {
  id: string;
  name: string;
  role: string;
  email: string;
  phone: string;
  skills: string[];
  availability: string[];
}

interface VolunteerTeamProps {
  teams?: Team[];
}

const VolunteerTeam: React.FC<VolunteerTeamProps> = ({ teams = [] }) => {
  const { user } = useFirebaseAuth();
  const [activeTeam, setActiveTeam] = useState<string | null>(teams.length > 0 ? teams[0].id : null);
  const [expandedTeam, setExpandedTeam] = useState<string | null>(null);
  
  // Default team members if no teams are provided
  const defaultTeamMembers: TeamMember[] = [
    {
      id: '1',
      name: "Sarah Johnson",
      role: "Team Member",
      email: "sarah.j@example.com",
      phone: "(555) 123-4567",
      skills: ["Teaching", "First Aid"],
      availability: ["Weekdays", "Evenings"]
    },
    {
      id: '2',
      name: "Michael Chen",
      role: "Team Member",
      email: "m.chen@example.com",
      phone: "(555) 987-6543",
      skills: ["Photography", "Event Planning"],
      availability: ["Weekends"]
    }
  ];

  // If we have teams from Firebase, create team members from them
  const teamMembers: TeamMember[] = teams.length > 0 
    ? teams.flatMap(team => {
        // For each team, create a team member for the leader
        const leaderMember: TeamMember = {
          id: `leader-${team.id}`,
          name: team.leader,
          role: "Team Leader",
          email: `${team.leader.toLowerCase().replace(' ', '.')}@example.com`,
          phone: "(555) 123-4567",
          skills: ["Leadership", "Organization"],
          availability: ["Weekdays", "Weekends"]
        };
        
        // Return the leader and potentially other members
        return [leaderMember];
      })
    : defaultTeamMembers;

  // Mock upcoming team events
  const teamEvents = [
    {
      id: '1',
      title: 'Team Planning Meeting',
      date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toLocaleDateString(),
      location: 'Virtual (Zoom)',
      team: teams.length > 0 ? teams[0].id : '1'
    },
    {
      id: '2',
      title: 'Volunteer Training Session',
      date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString(),
      location: 'Community Center',
      team: teams.length > 0 ? teams[0].id : '1'
    }
  ];

  const toggleTeamExpansion = (teamId: string) => {
    if (expandedTeam === teamId) {
      setExpandedTeam(null);
    } else {
      setExpandedTeam(teamId);
      setActiveTeam(teamId);
    }
  };

  return (
    <div className="space-y-8">
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">My Teams</h2>
          <button className="bg-rose-600 text-white px-4 py-2 rounded-md hover:bg-rose-700 transition flex items-center">
            <Plus className="h-4 w-4 mr-2" />
            Join Team
          </button>
        </div>

        {/* Teams List */}
        {teams.length > 0 ? (
          <div className="space-y-4">
            {teams.map(team => (
              <div key={team.id} className="border border-gray-200 rounded-lg overflow-hidden">
                <div 
                  className={`p-4 cursor-pointer hover:bg-gray-50 ${activeTeam === team.id ? 'bg-gray-50' : ''}`}
                  onClick={() => toggleTeamExpansion(team.id)}
                >
                  <div className="flex justify-between items-center">
                    <div className="flex items-center">
                      <div className="h-10 w-10 bg-rose-100 rounded-full flex items-center justify-center mr-4">
                        <Users className="h-5 w-5 text-rose-600" />
                      </div>
                      <div>
                        <h3 className="text-lg font-medium text-gray-900">{team.name}</h3>
                        <p className="text-sm text-gray-500">{team.members.length} members</p>
                      </div>
                    </div>
                    <ChevronDown className={`h-5 w-5 text-gray-400 transform transition-transform ${expandedTeam === team.id ? 'rotate-180' : ''}`} />
                  </div>
                </div>
                
                {expandedTeam === team.id && (
                  <div className="p-4 border-t border-gray-200 bg-gray-50">
                    <p className="text-gray-600 mb-4">{team.description}</p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="text-sm font-medium text-gray-700 mb-2">Team Leader</h4>
                        <div className="flex items-center p-3 bg-white rounded-lg border border-gray-200">
                          <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                            <User className="h-4 w-4 text-blue-600" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{team.leader}</p>
                            <p className="text-xs text-gray-500">Team Leader</p>
                          </div>
                        </div>
                      </div>
                      
                      <div>
                        <h4 className="text-sm font-medium text-gray-700 mb-2">Projects</h4>
                        <div className="flex flex-wrap gap-2">
                          {team.projects.map((project, index) => (
                            <span
                              key={index}
                              className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-rose-100 text-rose-800"
                            >
                              {project}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-6">
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Upcoming Team Events</h4>
                      <div className="space-y-3">
                        {teamEvents
                          .filter(event => event.team === team.id)
                          .map(event => (
                            <div key={event.id} className="flex items-center p-3 bg-white rounded-lg border border-gray-200">
                              <div className="h-8 w-8 bg-green-100 rounded-full flex items-center justify-center mr-3">
                                <Calendar className="h-4 w-4 text-green-600" />
                              </div>
                              <div className="flex-1">
                                <p className="font-medium text-gray-900">{event.title}</p>
                                <div className="flex items-center text-xs text-gray-500 mt-1">
                                  <span>{event.date}</span>
                                  <span className="mx-2">•</span>
                                  <span>{event.location}</span>
                                </div>
                              </div>
                              <button className="text-rose-600 hover:text-rose-700 text-sm font-medium">
                                RSVP
                              </button>
                            </div>
                          ))}
                        {teamEvents.filter(event => event.team === team.id).length === 0 && (
                          <p className="text-gray-500 text-sm">No upcoming events for this team</p>
                        )}
                      </div>
                    </div>
                    
                    <div className="mt-6 flex justify-end space-x-3">
                      <button className="text-gray-600 hover:text-gray-900 px-4 py-2 rounded-md border border-gray-300 flex items-center">
                        <MessageSquare className="h-4 w-4 mr-2" />
                        Message Team
                      </button>
                      <button className="bg-rose-600 text-white px-4 py-2 rounded-md hover:bg-rose-700 transition">
                        View Team Page
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 bg-gray-50 rounded-lg">
            <Users className="h-12 w-12 mx-auto text-gray-400 mb-3" />
            <h3 className="text-lg font-medium text-gray-900 mb-1">You're not part of any teams yet</h3>
            <p className="text-gray-500 mb-4">Join a team to collaborate with other volunteers</p>
            <button className="bg-rose-600 text-white px-4 py-2 rounded-md hover:bg-rose-700 transition">
              Browse Available Teams
            </button>
          </div>
        )}
      </div>

      {/* Team Members */}
      {teams.length > 0 && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Team Members</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {teamMembers
              .filter(member => activeTeam ? member.id.includes(activeTeam) : true)
              .map((member) => (
                <div key={member.id} className="bg-white rounded-lg border border-gray-200 p-4 hover:border-rose-200 transition-all">
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
                      View Profile
                    </button>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default VolunteerTeam;