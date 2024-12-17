import React from 'react';
import { Users, Target, MapPin } from 'lucide-react';

interface ProgramStatsProps {
  beneficiaries?: {
    total: number;
    male: number;
    female: number;
    children: number;
  };
}

const ProgramStats: React.FC<ProgramStatsProps> = ({ beneficiaries = {
  total: 0,
  male: 0,
  female: 0,
  children: 0
} }) => {
  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-6">Program Impact</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="text-center">
          <Users className="h-8 w-8 text-rose-600 mx-auto mb-2" />
          <p className="text-2xl font-bold text-gray-900">{beneficiaries.total.toLocaleString()}</p>
          <p className="text-sm text-gray-600">Total Beneficiaries</p>
        </div>
        
        <div className="text-center">
          <Target className="h-8 w-8 text-rose-600 mx-auto mb-2" />
          <p className="text-2xl font-bold text-gray-900">{beneficiaries.male.toLocaleString()}</p>
          <p className="text-sm text-gray-600">Male Beneficiaries</p>
        </div>
        
        <div className="text-center">
          <Users className="h-8 w-8 text-rose-600 mx-auto mb-2" />
          <p className="text-2xl font-bold text-gray-900">{beneficiaries.female.toLocaleString()}</p>
          <p className="text-sm text-gray-600">Female Beneficiaries</p>
        </div>
        
        <div className="text-center">
          <MapPin className="h-8 w-8 text-rose-600 mx-auto mb-2" />
          <p className="text-2xl font-bold text-gray-900">{beneficiaries.children.toLocaleString()}</p>
          <p className="text-sm text-gray-600">Children Beneficiaries</p>
        </div>
      </div>
    </div>
  );
};

export default ProgramStats;