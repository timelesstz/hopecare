import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, Users } from 'lucide-react';
import ProgramRegistration from './ProgramRegistration';

interface ProgramCTAProps {
  programName: string;
}

const ProgramCTA: React.FC<ProgramCTAProps> = ({ programName }) => {
  const [showRegistration, setShowRegistration] = useState(false);

  return (
    <div className="bg-gradient-to-r from-rose-600 to-rose-700 py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Join Our {programName} Program
          </h2>
          <p className="text-xl text-rose-100 mb-8 max-w-2xl mx-auto">
            Make a difference in your community by participating in our programs or supporting our cause through donations.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <button
              onClick={() => setShowRegistration(true)}
              className="inline-flex items-center bg-white text-rose-600 px-6 py-3 rounded-md hover:bg-rose-50 transition"
            >
              <Users className="h-5 w-5 mr-2" />
              Register Now
            </button>
            <Link
              to="/donate"
              className="inline-flex items-center border-2 border-white text-white px-6 py-3 rounded-md hover:bg-white hover:text-rose-600 transition"
            >
              <Heart className="h-5 w-5 mr-2" />
              Support This Program
            </Link>
          </div>
        </div>
      </div>

      {showRegistration && (
        <ProgramRegistration
          programName={programName}
          onClose={() => setShowRegistration(false)}
        />
      )}
    </div>
  );
};

export default ProgramCTA;