import { useState } from 'react';
import { Calendar, MapPin, Clock, Users } from 'lucide-react';

interface Opportunity {
  id: number;
  title: string;
  description: string;
  location: string;
  date: string;
  duration: string;
  spotsAvailable: number;
  category: string;
  skills: string[];
}

const VolunteerOpportunities = () => {
  const [selectedCategory, setSelectedCategory] = useState('all');

  const opportunities: Opportunity[] = [
    {
      id: 1,
      title: 'Community Food Drive',
      description: 'Help distribute food packages to families in need',
      location: 'Community Center',
      date: '2024-12-15',
      duration: '3 hours',
      spotsAvailable: 5,
      category: 'food-security',
      skills: ['Organization', 'Physical Labor', 'Communication']
    },
    {
      id: 2,
      title: 'Youth Mentoring Program',
      description: 'Mentor young students in academic subjects',
      location: 'Local School',
      date: '2024-12-18',
      duration: '2 hours',
      spotsAvailable: 3,
      category: 'education',
      skills: ['Teaching', 'Patience', 'Subject Knowledge']
    },
    {
      id: 3,
      title: 'Senior Care Visit',
      description: 'Spend time with elderly residents',
      location: 'Care Home',
      date: '2024-12-20',
      duration: '4 hours',
      spotsAvailable: 8,
      category: 'healthcare',
      skills: ['Empathy', 'Communication', 'Patience']
    }
  ];

  const categories = [
    { id: 'all', name: 'All Opportunities' },
    { id: 'food-security', name: 'Food Security' },
    { id: 'education', name: 'Education' },
    { id: 'healthcare', name: 'Healthcare' }
  ];

  const filteredOpportunities = selectedCategory === 'all' 
    ? opportunities 
    : opportunities.filter(opp => opp.category === selectedCategory);

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Volunteer Opportunities</h2>
          <div className="flex gap-2">
            {categories.map(category => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`px-4 py-2 rounded-md text-sm font-medium ${
                  selectedCategory === category.id
                    ? 'bg-rose-100 text-rose-700'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {category.name}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6">
          {filteredOpportunities.map((opportunity) => (
            <div 
              key={opportunity.id}
              className="border border-gray-200 rounded-lg p-6 hover:border-rose-200 transition-all"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-medium text-gray-900">{opportunity.title}</h3>
                  <p className="mt-2 text-gray-600">{opportunity.description}</p>
                </div>
                <button className="bg-rose-600 text-white px-4 py-2 rounded-md hover:bg-rose-700 transition-colors">
                  Sign Up
                </button>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-4">
                <div className="flex items-center text-gray-600">
                  <MapPin className="h-5 w-5 mr-2" />
                  {opportunity.location}
                </div>
                <div className="flex items-center text-gray-600">
                  <Calendar className="h-5 w-5 mr-2" />
                  {opportunity.date}
                </div>
                <div className="flex items-center text-gray-600">
                  <Clock className="h-5 w-5 mr-2" />
                  {opportunity.duration}
                </div>
                <div className="flex items-center text-gray-600">
                  <Users className="h-5 w-5 mr-2" />
                  {opportunity.spotsAvailable} spots available
                </div>
              </div>

              <div className="mt-4">
                <p className="text-sm font-medium text-gray-700">Required Skills:</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {opportunity.skills.map((skill, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default VolunteerOpportunities;