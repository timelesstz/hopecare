import React from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../../hooks/useTheme';

interface SocialAuthProps {
  onGoogleClick: () => void;
  onMicrosoftClick: () => void;
  isLoading?: boolean;
}

export const SocialAuth: React.FC<SocialAuthProps> = ({
  onGoogleClick,
  onMicrosoftClick,
  isLoading = false,
}) => {
  const { isDarkMode } = useTheme();

  const buttonVariants = {
    initial: { scale: 0.95, opacity: 0 },
    animate: { 
      scale: 1, 
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 25
      }
    },
    hover: { 
      scale: 1.02,
      transition: {
        type: "spring",
        stiffness: 400,
        damping: 10
      }
    },
    tap: { scale: 0.98 }
  };

  const dividerVariants = {
    initial: { scaleX: 0 },
    animate: { 
      scaleX: 1,
      transition: {
        type: "spring",
        stiffness: 200,
        damping: 20,
        delay: 0.2
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-center space-x-4">
        <motion.button
          variants={buttonVariants}
          initial="initial"
          animate="animate"
          whileHover="hover"
          whileTap="tap"
          disabled={isLoading}
          onClick={onGoogleClick}
          className={`
            flex items-center justify-center px-4 py-2 w-full
            border rounded-lg space-x-2
            ${isDarkMode 
              ? 'bg-white hover:bg-gray-100' 
              : 'bg-white hover:bg-gray-50'
            }
            transition-colors duration-200
            disabled:opacity-50 disabled:cursor-not-allowed
          `}
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path
              fill="#EA4335"
              d="M5.26620003,9.76452941 C6.19878754,6.93863203 8.85444915,4.90909091 12,4.90909091 C13.6909091,4.90909091 15.2181818,5.50909091 16.4181818,6.49090909 L19.9090909,3 C17.7818182,1.14545455 15.0545455,0 12,0 C7.27006974,0 3.1977497,2.69829785 1.23999023,6.65002441 L5.26620003,9.76452941 Z"
            />
            <path
              fill="#34A853"
              d="M16.0407269,18.0125889 C14.9509167,18.7163016 13.5660892,19.0909091 12,19.0909091 C8.86648613,19.0909091 6.21911939,17.076871 5.27698177,14.2678769 L1.23746264,17.3349879 C3.19279051,21.2936293 7.26500293,24 12,24 C14.9328362,24 17.7353462,22.9573905 19.834192,20.9995801 L16.0407269,18.0125889 Z"
            />
            <path
              fill="#4A90E2"
              d="M19.834192,20.9995801 C22.0291676,18.9520994 23.4545455,15.903663 23.4545455,12 C23.4545455,11.2909091 23.3454545,10.5818182 23.1272727,9.90909091 L12,9.90909091 L12,14.7272727 L18.4363636,14.7272727 C18.1187732,16.6814864 17.2662994,18.2172952 16.0407269,19.0125889 L19.834192,20.9995801 Z"
            />
            <path
              fill="#FBBC05"
              d="M5.27698177,14.2678769 C5.03832634,13.556323 4.90909091,12.7937589 4.90909091,12 C4.90909091,11.2182781 5.03443647,10.4668121 5.26620003,9.76452941 L1.23999023,6.65002441 C0.43658717,8.26043162 0,10.0753848 0,12 C0,13.9195484 0.444780743,15.7301709 1.23746264,17.3349879 L5.27698177,14.2678769 Z"
            />
          </svg>
          <span className="text-gray-900">Continue with Google</span>
        </motion.button>

        <motion.button
          variants={buttonVariants}
          initial="initial"
          animate="animate"
          whileHover="hover"
          whileTap="tap"
          disabled={isLoading}
          onClick={onMicrosoftClick}
          className={`
            flex items-center justify-center px-4 py-2 w-full
            border rounded-lg space-x-2
            ${isDarkMode 
              ? 'bg-white hover:bg-gray-100' 
              : 'bg-white hover:bg-gray-50'
            }
            transition-colors duration-200
            disabled:opacity-50 disabled:cursor-not-allowed
          `}
        >
          <svg className="w-5 h-5" viewBox="0 0 23 23">
            <path fill="#f35325" d="M1 1h10v10H1z"/>
            <path fill="#81bc06" d="M12 1h10v10H12z"/>
            <path fill="#05a6f0" d="M1 12h10v10H1z"/>
            <path fill="#ffba08" d="M12 12h10v10H12z"/>
          </svg>
          <span className="text-gray-900">Continue with Microsoft</span>
        </motion.button>
      </div>

      <div className="flex items-center justify-center">
        <motion.div
          variants={dividerVariants}
          initial="initial"
          animate="animate"
          className="flex items-center w-full"
        >
          <div className={`flex-grow h-px ${
            isDarkMode ? 'bg-gray-700' : 'bg-gray-300'
          }`} />
          <span className={`px-4 text-sm ${
            isDarkMode ? 'text-gray-400' : 'text-gray-500'
          }`}>
            or continue with email
          </span>
          <div className={`flex-grow h-px ${
            isDarkMode ? 'bg-gray-700' : 'bg-gray-300'
          }`} />
        </motion.div>
      </div>
    </div>
  );
};

export default SocialAuth;
