import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2 } from 'lucide-react';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/stripe-react-js';
import { stripePromise, createPaymentIntent, createSubscription } from '@/services/stripe';

const donationSchema = z.object({
  amount: z.number().min(1, 'Amount must be greater than 0'),
  donorName: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  phone: z.string().optional(),
  message: z.string().optional(),
  anonymous: z.boolean().default(false),
  frequency: z.enum(['one-time', 'monthly', 'quarterly', 'annually']),
  projectAllocation: z.string().optional(),
});

type DonationFormData = z.infer<typeof donationSchema>;

interface DonationFormProps {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
  isLoading?: boolean;
  projects?: Array<{ id: string; name: string }>;
}

const DonationFormContent: React.FC<DonationFormProps> = ({
  onSuccess,
  onError,
  isLoading = false,
  projects = [],
}) => {
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const stripe = useStripe();
  const elements = useElements();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<DonationFormData>({
    resolver: zodResolver(donationSchema),
    defaultValues: {
      frequency: 'one-time',
      anonymous: false,
    },
  });

  const isAnonymous = watch('anonymous');
  const frequency = watch('frequency');

  const handleDonation = async (data: DonationFormData) => {
    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);
    setPaymentError(null);

    try {
      const metadata = {
        donorName: data.anonymous ? 'Anonymous' : data.donorName,
        email: data.email,
        phone: data.phone || '',
        message: data.message || '',
        projectAllocation: data.projectAllocation || 'general',
      };

      if (data.frequency === 'one-time') {
        // Handle one-time payment
        const { clientSecret } = await createPaymentIntent({
          amount: data.amount,
          frequency: data.frequency,
          metadata,
        });

        const { error: paymentError } = await stripe.confirmPayment({
          elements,
          clientSecret,
          confirmParams: {
            return_url: `${window.location.origin}/donation/success`,
          },
        });

        if (paymentError) {
          throw new Error(paymentError.message);
        }
      } else {
        // Handle subscription
        const { priceId } = await createSubscription({
          amount: data.amount,
          frequency: data.frequency,
          metadata,
        });

        const { error: subscriptionError } = await stripe.confirmCardPayment(priceId);

        if (subscriptionError) {
          throw new Error(subscriptionError.message);
        }
      }

      onSuccess?.();
    } catch (error) {
      console.error('Payment error:', error);
      setPaymentError(error instanceof Error ? error.message : 'Payment failed');
      onError?.(error instanceof Error ? error : new Error('Payment failed'));
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(handleDonation)} className="space-y-6">
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Donation Amount*
          </label>
          <div className="mt-1 relative rounded-md shadow-sm">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <span className="text-gray-500 sm:text-sm">$</span>
            </div>
            <input
              type="number"
              {...register('amount', { valueAsNumber: true })}
              className="focus:ring-rose-500 focus:border-rose-500 block w-full pl-7 pr-12 sm:text-sm border-gray-300 rounded-md"
              placeholder="0.00"
              step="0.01"
            />
          </div>
          {errors.amount && (
            <p className="mt-1 text-sm text-red-600">{errors.amount.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Donation Frequency*
          </label>
          <select
            {...register('frequency')}
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-rose-500 focus:border-rose-500 sm:text-sm rounded-md"
          >
            <option value="one-time">One-time</option>
            <option value="monthly">Monthly</option>
            <option value="quarterly">Quarterly</option>
            <option value="annually">Annually</option>
          </select>
        </div>

        <div>
          <div className="flex items-center">
            <input
              type="checkbox"
              {...register('anonymous')}
              className="h-4 w-4 text-rose-600 focus:ring-rose-500 border-gray-300 rounded"
            />
            <label className="ml-2 block text-sm text-gray-700">
              Make this donation anonymous
            </label>
          </div>
        </div>

        {!isAnonymous && (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Full Name*
              </label>
              <input
                type="text"
                {...register('donorName')}
                className="mt-1 focus:ring-rose-500 focus:border-rose-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
              />
              {errors.donorName && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.donorName.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Email*
              </label>
              <input
                type="email"
                {...register('email')}
                className="mt-1 focus:ring-rose-500 focus:border-rose-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Phone Number (Optional)
              </label>
              <input
                type="tel"
                {...register('phone')}
                className="mt-1 focus:ring-rose-500 focus:border-rose-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
              />
            </div>
          </>
        )}

        {projects.length > 0 && (
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Allocate to Project (Optional)
            </label>
            <select
              {...register('projectAllocation')}
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-rose-500 focus:border-rose-500 sm:text-sm rounded-md"
            >
              <option value="">General Fund</option>
              {projects.map((project) => (
                <option key={project.id} value={project.id}>
                  {project.name}
                </option>
              ))}
            </select>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Message (Optional)
          </label>
          <textarea
            {...register('message')}
            rows={4}
            className="mt-1 focus:ring-rose-500 focus:border-rose-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
            placeholder="Leave a message with your donation..."
          />
        </div>
      </div>

      <div className="mt-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Payment Details
        </label>
        <PaymentElement />
      </div>

      {paymentError && (
        <div className="text-red-600 text-sm">{paymentError}</div>
      )}

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isLoading || isProcessing || !stripe || !elements}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-rose-600 hover:bg-rose-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-rose-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isProcessing ? (
            <>
              <Loader2 className="animate-spin -ml-1 mr-2 h-4 w-4" />
              Processing...
            </>
          ) : (
            'Donate Now'
          )}
        </button>
      </div>
    </form>
  );
};

const DonationForm: React.FC<DonationFormProps> = (props) => {
  const [clientSecret, setClientSecret] = useState<string | null>(null);

  React.useEffect(() => {
    // Initialize Stripe session
    createPaymentIntent({
      amount: 0, // This will be updated when the user submits the form
      frequency: 'one-time',
    })
      .then(({ clientSecret }) => setClientSecret(clientSecret))
      .catch(console.error);
  }, []);

  if (!clientSecret) {
    return <div>Loading...</div>;
  }

  return (
    <Elements stripe={stripePromise} options={{ clientSecret }}>
      <DonationFormContent {...props} />
    </Elements>
  );
};

export default DonationForm;
