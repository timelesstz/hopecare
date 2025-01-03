import { motion } from 'framer-motion';
import { Heart, Users, DollarSign, Star } from 'lucide-react';
import { useAnalytics } from '@/hooks/useAnalytics';

interface DonationTierProps {
  tier: {
    id: string;
    name: string;
    amount: number;
    description: string;
    benefits: string[];
    icon: 'heart' | 'users' | 'dollar' | 'star';
    popular?: boolean;
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
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={handleSelect}
      className={`
        relative rounded-xl overflow-hidden cursor-pointer
        transition-all duration-200 group
        ${isSelected
          ? 'ring-2 ring-rose-500 shadow-lg'
          : 'hover:shadow-md border-2 border-gray-100'
        }
      `}
    >
      {tier.popular && (
        <div className="absolute top-0 right-0">
          <div className="bg-rose-500 text-white text-xs font-semibold px-3 py-1 rounded-bl-lg">
            Popular
          </div>
        </div>
      )}

      <div className="p-6">
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

        <div className="space-y-2">
          {tier.benefits.map((benefit, index) => (
            <div key={index} className="flex items-center gap-2">
              <div className={`
                h-1.5 w-1.5 rounded-full
                ${isSelected ? 'bg-rose-500' : 'bg-gray-400'}
              `} />
              <span className="text-sm text-gray-600">{benefit}</span>
            </div>
          ))}
        </div>

        <motion.div
          initial={false}
          animate={{ opacity: isSelected ? 1 : 0 }}
          className="absolute bottom-4 right-4"
        >
          <div className="bg-rose-500 text-white p-1 rounded-full">
            <Heart className="w-4 h-4" />
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default DonationTier;