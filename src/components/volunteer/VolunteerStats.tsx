import { Clock, Users, Award, Calendar } from 'lucide-react';

const VolunteerStats = () => {
  const stats = [
    {
      id: 1,
      name: 'Hours Contributed',
      value: '120',
      change: '+12%',
      changeType: 'increase',
      icon: Clock,
      description: 'Total volunteer hours this month'
    },
    {
      id: 2,
      name: 'Lives Impacted',
      value: '250',
      change: '+25%',
      changeType: 'increase',
      icon: Users,
      description: 'People helped through your service'
    },
    {
      id: 3,
      name: 'Projects Completed',
      value: '15',
      change: '+5',
      changeType: 'increase',
      icon: Award,
      description: 'Successfully completed projects'
    },
    {
      id: 4,
      name: 'Upcoming Events',
      value: '3',
      change: 'This Week',
      changeType: 'neutral',
      icon: Calendar,
      description: 'Events scheduled this week'
    }
  ];

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Impact Dashboard</h2>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((item) => (
            <div key={item.id} className="relative overflow-hidden rounded-lg bg-white px-4 py-5 border border-gray-100 hover:border-rose-200 transition-all">
              <dt>
                <div className="absolute rounded-md bg-rose-50 p-3">
                  <item.icon className="h-6 w-6 text-rose-600" aria-hidden="true" />
                </div>
                <p className="ml-16 truncate text-sm font-medium text-gray-500">{item.name}</p>
              </dt>
              <dd className="ml-16 flex items-baseline">
                <p className="text-2xl font-semibold text-gray-900">{item.value}</p>
                <p className="ml-2 flex items-baseline text-sm font-semibold text-green-600">
                  {item.change}
                </p>
                <p className="ml-2 text-xs text-gray-500">{item.description}</p>
              </dd>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default VolunteerStats;