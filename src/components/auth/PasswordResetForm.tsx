import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Mail, ArrowLeft } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const resetSchema = z.object({
  email: z.string().email('Invalid email address')
});

type ResetFormData = z.infer<typeof resetSchema>;

interface PasswordResetFormProps {
  onBack: () => void;
}

const PasswordResetForm: React.FC<PasswordResetFormProps> = ({ onBack }) => {
  const { resetPassword } = useAuth();
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm<ResetFormData>({
    resolver: zodResolver(resetSchema)
  });

  const onSubmit = async (data: ResetFormData) => {
    try {
      await resetPassword(data.email);
      setIsSubmitted(true);
    } catch (error) {
      console.error('Password reset failed:', error);
    }
  };

  if (isSubmitted) {
    return (
      <div className="text-center">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Check Your Email</h3>
        <p className="text-gray-600 mb-6">
          We've sent password reset instructions to your email address.
        </p>
        <button
          onClick={onBack}
          className="text-rose-600 hover:text-rose-700 font-medium flex items-center justify-center mx-auto"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Sign In
        </button>
      </div>
    );
  }

  return (
    <div>
      <h3 className="text-lg font-medium text-gray-900 mb-4">Reset Password</h3>
      <p className="text-gray-600 mb-6">
        Enter your email address and we'll send you instructions to reset your password.
      </p>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700">Email</label>
          <div className="mt-1 relative">
            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              {...register('email')}
              type="email"
              className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-rose-500 focus:border-rose-500"
            />
          </div>
          {errors.email && (
            <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
          )}
        </div>

        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={onBack}
            className="text-rose-600 hover:text-rose-700 font-medium flex items-center"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Sign In
          </button>
          <button
            type="submit"
            className="bg-rose-600 text-white px-4 py-2 rounded-md hover:bg-rose-700 transition"
          >
            Send Reset Link
          </button>
        </div>
      </form>
    </div>
  );
};

export default PasswordResetForm;