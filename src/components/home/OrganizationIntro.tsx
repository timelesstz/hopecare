import React from 'react';
import { motion } from 'framer-motion';
import { Heart, Users, Globe, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const OrganizationIntro = () => {
  return (
    <section className="relative py-20 overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-b from-white to-gray-50" />
        <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] [mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,#000_70%,transparent_100%)]" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Text Content */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl font-bold text-gray-900 mb-6">
              Empowering Communities, <br />
              <span className="text-rose-600">Transforming Lives</span>
            </h2>
            <p className="text-lg text-gray-600 mb-8">
              HopeCare is a membership-based, non-profit organization established in 2008, serving vulnerable 
              communities across Tanzania. With over 250 groups and 7,500 members, we implement vital programs 
              in Health, Economic Empowerment, Education, and Food Security.
            </p>

            <div className="grid grid-cols-2 gap-6 mb-8">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-rose-100 rounded-lg">
                  <Heart className="w-6 h-6 text-rose-600" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">Community-Driven</h4>
                  <p className="text-sm text-gray-600">Empowering local initiatives</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="p-2 bg-rose-100 rounded-lg">
                  <Users className="w-6 h-6 text-rose-600" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">Inclusive Support</h4>
                  <p className="text-sm text-gray-600">Serving 9 districts in Tanzania</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="p-2 bg-rose-100 rounded-lg">
                  <Globe className="w-6 h-6 text-rose-600" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">Sustainable Impact</h4>
                  <p className="text-sm text-gray-600">Building lasting solutions</p>
                </div>
              </div>
            </div>

            <Link 
              to="/about"
              className="inline-flex items-center gap-2 text-rose-600 hover:text-rose-700 font-semibold group"
            >
              Learn More About Us
              <ArrowRight className="w-5 h-5 transform group-hover:translate-x-1 transition-transform" />
            </Link>
          </motion.div>

          {/* Image Grid */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            viewport={{ once: true }}
            className="relative grid grid-cols-2 gap-4"
          >
            <div className="space-y-4">
              <div className="aspect-[4/5] rounded-2xl overflow-hidden">
                <img 
                  src="/images/intro/community-1.jpg" 
                  alt="Community support"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="aspect-[4/3] rounded-2xl overflow-hidden">
                <img 
                  src="/images/intro/community-2.jpg" 
                  alt="Healthcare initiatives"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
            <div className="space-y-4 mt-8">
              <div className="aspect-[4/3] rounded-2xl overflow-hidden">
                <img 
                  src="/images/intro/community-3.jpg" 
                  alt="Education programs"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="aspect-[4/5] rounded-2xl overflow-hidden">
                <img 
                  src="/images/intro/community-4.jpg" 
                  alt="Community building"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default OrganizationIntro;
