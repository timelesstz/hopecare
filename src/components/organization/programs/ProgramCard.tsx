import React from 'react';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

interface ProgramCardProps {
  title: string;
  description: string;
  interventions: string[];
  icon: React.ReactNode;
  slug: string;
}

const ProgramCard: React.FC<ProgramCardProps> = ({
  title,
  description,
  interventions,
  icon,
  slug
}) => {
  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
      <div className="p-6">
        <div className="flex items-center mb-4">
          <div className="h-12 w-12 bg-rose-100 rounded-full flex items-center justify-center">
            {icon}
          </div>
          <h3 className="ml-4 text-xl font-bold text-gray-900">{title}</h3>
        </div>
        
        <p className="text-gray-600 mb-4">{description}</p>
        
        <div className="space-y-2 mb-6">
          {interventions.map((intervention, index) => (
            <div key={index} className="flex items-center text-gray-600">
              <span className="mr-2">•</span>
              {intervention}
            </div>
          ))}
        </div>

        <Link
          to={`/programs/${slug}`}
          className="inline-flex items-center text-rose-600 hover:text-rose-700 font-medium"
        >
          Learn More
          <ArrowRight className="ml-2 h-4 w-4" />
        </Link>
      </div>
    </div>
  );
};

export default ProgramCard;