import React from 'react';
import { CheckCircle } from 'lucide-react';

interface ObjectiveListProps {
  title: string;
  items: string[];
}

const ObjectiveList: React.FC<ObjectiveListProps> = ({ title, items }) => {
  return (
    <div className="mb-8">
      <h3 className="text-xl font-bold text-gray-900 mb-4">{title}</h3>
      <ul className="space-y-2">
        {items.map((item, index) => (
          <li key={index} className="flex items-start">
            <CheckCircle className="h-5 w-5 text-rose-600 mt-1 mr-2 flex-shrink-0" />
            <span className="text-gray-700">{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ObjectiveList;