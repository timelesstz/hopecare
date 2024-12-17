import React from 'react';
import { Clock } from 'lucide-react';
import { Availability } from '../../../types/volunteer';

interface AvailabilityInfoProps {
  availability: Availability;
}

const AvailabilityInfo: React.FC<AvailabilityInfoProps> = ({ availability }) => {
  return (
    <div>
      <h3 className="text-sm font-medium text-gray-900 mb-2">Availability</h3>
      <div className="space-y-2">
        {availability.weekdays && (
          <div className="flex items-center text-gray-600">
            <Clock className="h-4 w-4 mr-2" />
            <span>Weekdays</span>
          </div>
        )}
        {availability.weekends && (
          <div className="flex items-center text-gray-600">
            <Clock className="h-4 w-4 mr-2" />
            <span>Weekends</span>
          </div>
        )}
        {availability.evenings && (
          <div className="flex items-center text-gray-600">
            <Clock className="h-4 w-4 mr-2" />
            <span>Evenings</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default AvailabilityInfo;