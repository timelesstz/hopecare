import React from 'react';
import TeamMemberCard from './TeamMemberCard';
import { boardMembers } from '../../../data/organization/board';

const TeamSection: React.FC = () => {
  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Leadership Team</h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Meet our dedicated board of directors who guide our organization towards its mission
            of empowering vulnerable communities in Tanzania.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {boardMembers.map((member) => (
            <TeamMemberCard
              key={member.name}
              name={member.name}
              position={member.position}
              biography={member.biography}
              contact={member.contact}
              qualifications={member.qualifications}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default TeamSection;