import React from 'react';
import { CheckCircle, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const DonationSuccess = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8 text-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="h-8 w-8 text-green-600" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          Thank You for Your Donation!
        </h1>
        <p className="text-gray-600 mb-8">
          Your generous contribution will help us make a difference in our community.
          We've sent a confirmation email with the donation details.
        </p>
        <Link
          to="/"
          className="inline-flex items-center justify-center bg-rose-600 text-white px-6 py-3 rounded-md hover:bg-rose-700 transition-colors"
        >
          Return Home
          <ArrowRight className="ml-2 h-5 w-5" />
        </Link>
      </div>
    </div>
  );
};

export default DonationSuccess;