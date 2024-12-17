import React from 'react';
import { motion } from 'framer-motion';

interface TeamMemberProps {
  name: string;
  role: string;
  bio: string;
  image: string;
}

const TeamMember: React.FC<TeamMemberProps> = ({ name, role, bio, image }) => {
  return (
    <motion.div
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow p-6"
    >
      <div className="text-center">
        <div className="relative w-32 h-32 mx-auto mb-4">
          <img
            src={image}
            alt={name}
            className="rounded-full object-cover w-full h-full"
          />
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">{name}</h3>
        <p className="text-rose-600 font-medium mb-4">{role}</p>
        <p className="text-gray-600">{bio}</p>
      </div>
    </motion.div>
  );
};

export default TeamMember;
