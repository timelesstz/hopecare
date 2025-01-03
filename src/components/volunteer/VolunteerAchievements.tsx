import { Award, Star, Clock, Heart, Users, Trophy } from 'lucide-react';

const VolunteerAchievements = () => {
  const achievements = [
    {
      id: 1,
      title: 'Dedicated Volunteer',
      description: '100+ hours of service',
      icon: Clock,
      earned: true,
      date: 'Earned 2 months ago',
      progress: 100,
    },
    {
      id: 2,
      title: 'Community Champion',
      description: 'Participated in 25+ events',
      icon: Trophy,
      earned: true,
      date: 'Earned 1 month ago',
      progress: 100,
    },
    {
      id: 3,
      title: 'Team Leader',
      description: 'Led 5+ volunteer teams',
      icon: Users,
      earned: false,
      progress: 80,
    },
    {
      id: 4,
      title: 'Impact Maker',
      description: 'Helped 1000+ people',
      icon: Heart,
      earned: false,
      progress: 65,
    },
  ];

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold">Achievements & Badges</h2>
        <div className="flex items-center space-x-2">
          <Award className="h-5 w-5 text-rose-600" />
          <span className="text-gray-600">2/4 Earned</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {achievements.map((achievement) => (
          <div
            key={achievement.id}
            className={`rounded-lg p-4 ${
              achievement.earned ? 'bg-rose-50' : 'bg-gray-50'
            } hover:shadow-md transition-shadow duration-300`}
          >
            <div className="flex items-start space-x-4">
              <div className={`p-2 rounded-lg ${
                achievement.earned ? 'bg-rose-100' : 'bg-gray-200'
              }`}>
                <achievement.icon className={`h-6 w-6 ${
                  achievement.earned ? 'text-rose-600' : 'text-gray-500'
                }`} />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium">{achievement.title}</h3>
                  {achievement.earned && (
                    <Star className="h-4 w-4 text-yellow-400 fill-current" />
                  )}
                </div>
                <p className="text-sm text-gray-600 mt-1">
                  {achievement.description}
                </p>
                {achievement.earned ? (
                  <p className="text-sm text-rose-600 mt-2">
                    {achievement.date}
                  </p>
                ) : (
                  <div className="mt-2">
                    <div className="flex items-center justify-between text-sm text-gray-600 mb-1">
                      <span>Progress</span>
                      <span>{achievement.progress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-rose-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${achievement.progress}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default VolunteerAchievements;
