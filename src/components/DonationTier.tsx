import { motion } from 'framer-motion';
import { Heart, Users, DollarSign, Star, Check, Sparkles, ArrowRight } from 'lucide-react';
import { useAnalytics } from '@/hooks/useAnalytics';

interface DonationTierProps {
  tier: {
    id: string;
    name: string;
    amount: number;
    description: string;
    benefits: string[];
    icon: string;
    popular?: boolean;
    impact?: string;
  };
  isSelected: boolean;
  onSelect: () => void;
  donationType: 'one-time' | 'monthly';
  recurringInterval?: string;
}

const DonationTier: React.FC<DonationTierProps> = ({
  tier,
  isSelected,
  onSelect,
  donationType,
  recurringInterval = 'monthly'
}) => {
  const { trackDonation } = useAnalytics();

  const getIcon = () => {
    switch (tier.icon) {
      case 'heart':
        return <Heart className="h-6 w-6 text-rose-500" />;
      case 'users':
        return <Users className="h-6 w-6 text-rose-500" />;
      case 'dollar':
        return <DollarSign className="h-6 w-6 text-rose-500" />;
      case 'star':
        return <Star className="h-6 w-6 text-rose-500" />;
      default:
        return <Heart className="h-6 w-6 text-rose-500" />;
    }
  };

  const handleSelect = () => {
    onSelect();
    trackDonation({
      eventType: 'tier_selected',
      amount: tier.amount,
      currency: 'USD',
      timestamp: new Date().toISOString(),
      metadata: {
        tierId: tier.id,
        tierName: tier.name,
        donationType,
        recurringInterval
      }
    });
  };

  const getIntervalLabel = () => {
    switch (recurringInterval) {
      case 'monthly':
        return 'month';
      case 'annually':
        return 'year';
      default:
        return recurringInterval;
    }
  };

  return (
    <motion.div
      whileHover={{ scale: 1.02, boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)' }}
      whileTap={{ scale: 0.98 }}
      onClick={handleSelect}
      className={`
        relative rounded-xl overflow-hidden cursor-pointer
        transition-all duration-200 group
        ${isSelected
          ? 'ring-2 ring-rose-500 shadow-lg bg-rose-50'
          : 'hover:shadow-md border-2 border-gray-100 bg-white'
        }
      `}
      role="button"
      aria-pressed={isSelected}
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleSelect();
        }
      }}
    >
      {tier.popular && (
        <div className="absolute top-0 right-0 left-0">
          <div className="bg-rose-500 text-white text-xs font-semibold px-3 py-2 text-center">
            MOST POPULAR
            <Sparkles className="h-3 w-3 inline-block ml-1" />
          </div>
        </div>
      )}

      <div className={`p-6 ${tier.popular ? 'pt-10' : ''}`}>
        <div className="flex items-center gap-3 mb-4">
          <div className={`
            p-2 rounded-lg
            ${isSelected ? 'bg-rose-100' : 'bg-gray-100 group-hover:bg-rose-50'}
          `}>
            {getIcon()}
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{tier.name}</h3>
            <div className="flex items-baseline">
              <span className="text-2xl font-bold text-gray-900">
                ${tier.amount}
              </span>
              {donationType === 'monthly' && (
                <span className="ml-1 text-gray-500">
                  /{getIntervalLabel()}
                </span>
              )}
            </div>
          </div>
        </div>

        <p className="text-gray-600 mb-4">{tier.description}</p>

        {tier.impact && (
          <motion.div 
            className="mb-4 p-3 bg-green-50 rounded-lg border border-green-100"
            initial={{ opacity: 0.8 }}
            whileHover={{ opacity: 1, scale: 1.02 }}
          >
            <p className="text-sm text-green-700 font-medium flex items-start">
              <Sparkles className="h-4 w-4 mr-2 mt-0.5 text-green-500 flex-shrink-0" />
              <span>{tier.impact}</span>
            </p>
          </motion.div>
        )}

        <div className="space-y-2 mb-6">
          {tier.benefits.map((benefit, index) => (
            <motion.div 
              key={index} 
              className="flex items-start gap-2"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <div className="mt-1 flex-shrink-0">
                {isSelected ? (
                  <Check className="h-4 w-4 text-rose-500" />
                ) : (
                  <div className="h-1.5 w-1.5 rounded-full bg-gray-400 mt-1" />
                )}
              </div>
              <span className="text-sm text-gray-600">{benefit}</span>
            </motion.div>
          ))}
        </div>

        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.98 }}
          className={`
            w-full mt-2 flex justify-center items-center px-4 py-2 rounded-md
            text-sm font-medium transition-colors
            ${isSelected 
              ? 'bg-rose-500 text-white hover:bg-rose-600' 
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200 group-hover:bg-rose-100 group-hover:text-rose-700'
            }
          `}
          onClick={(e) => {
            // Prevent the click from bubbling up to the parent div
            e.stopPropagation();
            handleSelect();
          }}
        >
          {isSelected ? (
            <>Selected</>
          ) : (
            <>Choose ${tier.amount} {donationType === 'monthly' && `/${getIntervalLabel()}`} <ArrowRight className="ml-1 h-3 w-3" /></>
          )}
        </motion.button>
      </div>
    </motion.div>
  );
};

export default DonationTier;