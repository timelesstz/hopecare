import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, User } from 'lucide-react';

interface TeamMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  name: string;
  role: string;
  detailedBio: string;
  image: string;
  imageError: boolean;
}

const TeamMemberModal: React.FC<TeamMemberModalProps> = ({
  isOpen,
  onClose,
  name,
  role,
  detailedBio,
  image,
  imageError,
}) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50 backdrop-blur-sm">
        <div className="flex items-center justify-center min-h-screen p-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ type: "spring", duration: 0.5 }}
            className="relative w-full max-w-3xl bg-white rounded-2xl shadow-2xl"
          >
            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
              aria-label="Close modal"
            >
              <X className="w-6 h-6" />
            </button>

            <div className="p-8">
              {/* Header */}
              <div className="flex flex-col md:flex-row items-center md:items-start space-y-6 md:space-y-0 md:space-x-8">
                {/* Image */}
                <div className="w-40 h-40 md:w-48 md:h-48 flex-shrink-0">
                  {imageError ? (
                    <div className="w-full h-full rounded-full bg-rose-100 flex items-center justify-center">
                      <User className="w-24 h-24 text-rose-300" />
                    </div>
                  ) : (
                    <img
                      src={image}
                      alt={name}
                      className="w-full h-full object-cover rounded-full border-4 border-rose-100 shadow-lg"
                    />
                  )}
                </div>

                {/* Title and Role */}
                <div className="flex-1 text-center md:text-left">
                  <h2 className="text-3xl font-bold text-gray-900 mb-2">{name}</h2>
                  <p className="text-xl font-medium text-rose-600 mb-6">{role}</p>
                  
                  {/* Bio paragraphs */}
                  <div className="prose prose-lg prose-rose max-w-none">
                    {detailedBio.split('\n\n').map((paragraph, index) => (
                      <p key={index} className="text-gray-600 mb-4 leading-relaxed">
                        {paragraph}
                      </p>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </AnimatePresence>
  );
};

export default TeamMemberModal;
