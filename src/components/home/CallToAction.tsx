import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, Users } from 'lucide-react';

const CallToAction = () => {
  return (
    <section className="bg-gradient-to-r from-rose-600 to-rose-700 py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-3xl font-bold text-white mb-6">
              Ready to Make a Difference?
            </h2>
            <p className="text-xl text-rose-100 mb-8">
              Join our community of changemakers and help us create lasting impact
              in Tanzania. Every contribution matters, whether through donation
              or volunteering.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link
                to="/donate"
                className="inline-flex items-center bg-white text-rose-600 px-6 py-3 rounded-md hover:bg-rose-50 transition-colors"
              >
                <Heart className="h-5 w-5 mr-2" />
                Support Our Cause
              </Link>
              <Link
                to="/volunteer"
                className="inline-flex items-center border-2 border-white text-white px-6 py-3 rounded-md hover:bg-white hover:text-rose-600 transition-colors"
              >
                <Users className="h-5 w-5 mr-2" />
                Become a Volunteer
              </Link>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-6">
            <div className="bg-white/10 backdrop-blur-lg rounded-lg p-6 text-center">
              <div className="text-4xl font-bold text-white mb-2">10K+</div>
              <p className="text-rose-100">Lives Impacted</p>
            </div>
            <div className="bg-white/10 backdrop-blur-lg rounded-lg p-6 text-center">
              <div className="text-4xl font-bold text-white mb-2">15+</div>
              <p className="text-rose-100">Active Programs</p>
            </div>
            <div className="bg-white/10 backdrop-blur-lg rounded-lg p-6 text-center">
              <div className="text-4xl font-bold text-white mb-2">200+</div>
              <p className="text-rose-100">Volunteers</p>
            </div>
            <div className="bg-white/10 backdrop-blur-lg rounded-lg p-6 text-center">
              <div className="text-4xl font-bold text-white mb-2">9</div>
              <p className="text-rose-100">Districts Covered</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CallToAction;