import React, { useState } from 'react';
import { Mail, Loader2, CheckCircle } from 'lucide-react';

const NewsletterSignup = () => {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    setStatus('success');
    setMessage('Thank you for subscribing to our newsletter!');
    setEmail('');
  };

  return (
    <section className="bg-rose-600 py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-white mb-4">Stay Updated</h2>
          <p className="text-lg text-rose-100">
            Join our newsletter to receive updates about our projects and impact.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="max-w-lg mx-auto">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="w-full pl-10 pr-4 py-3 rounded-md focus:ring-2 focus:ring-white"
                required
              />
            </div>
            <button
              type="submit"
              disabled={status === 'loading'}
              className="bg-white text-rose-600 px-6 py-3 rounded-md hover:bg-rose-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {status === 'loading' ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                'Subscribe'
              )}
            </button>
          </div>
          {status === 'success' && (
            <div className="mt-4 flex items-center justify-center text-white">
              <CheckCircle className="h-5 w-5 mr-2" />
              {message}
            </div>
          )}
        </form>
      </div>
    </section>
  );
};

export default NewsletterSignup;