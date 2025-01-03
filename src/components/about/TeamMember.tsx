import React, { useState } from 'react';
import { motion } from 'framer-motion';
import TeamMemberModal from './TeamMemberModal';
import { User } from 'lucide-react';

interface TeamMemberProps {
  name: string;
  role: string;
  bio: string;
  detailedBio: string;
  image: string;
}

const TeamMember: React.FC<TeamMemberProps> = ({ name, role, bio, detailedBio, image }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [imageError, setImageError] = useState(false);

  const handleImageError = () => {
    setImageError(true);
  };

  return (
    <>
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        whileHover={{ y: -5 }}
        transition={{ duration: 0.3 }}
        className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all p-8 cursor-pointer"
        onClick={() => setIsModalOpen(true)}
      >
        <div className="text-center">
          <div className="relative w-40 h-40 mx-auto mb-6">
            {imageError ? (
              <div className="w-full h-full rounded-full bg-rose-100 flex items-center justify-center">
                <User className="w-20 h-20 text-rose-300" />
              </div>
            ) : (
              <img
                src={image}
                alt={name}
                onError={handleImageError}
                className="rounded-full object-cover w-full h-full border-4 border-rose-100"
              />
            )}
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-2">{name}</h3>
          <p className="text-rose-600 font-medium text-lg mb-4">{role}</p>
          <p className="text-gray-600 text-sm leading-relaxed">{bio}</p>
        </div>
      </motion.div>

      <TeamMemberModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        name={name}
        role={role}
        detailedBio={detailedBio}
        image={image}
        imageError={imageError}
      />
    </>
  );
};

export default TeamMember;
