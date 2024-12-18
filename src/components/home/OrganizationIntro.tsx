import React from 'react';
import { motion } from 'framer-motion';
import { Heart, Users, Globe, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import Image from '../common/Image';

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
                  <p className="text-sm text-gray-600">Serving all communities</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="p-2 bg-rose-100 rounded-lg">
                  <Globe className="w-6 h-6 text-rose-600" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">Global Impact</h4>
                  <p className="text-sm text-gray-600">Reaching across borders</p>
                </div>
              </div>
            </div>

            <Link
              to="/about"
              className="inline-flex items-center gap-2 text-rose-600 hover:text-rose-700 font-medium"
            >
              Learn More About Us <ArrowRight className="w-4 h-4" />
            </Link>
          </motion.div>

          {/* Image Grid */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="grid grid-cols-2 gap-4"
          >
            <div className="space-y-4">
              <div className="aspect-[4/3] rounded-2xl overflow-hidden">
                <Image
                  src="/images/programs/community-support.jpg"
                  alt="Community Support Program"
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                />
              </div>
              <div className="aspect-square rounded-2xl overflow-hidden">
                <Image
                  src="/images/programs/education-program.jpg"
                  alt="Education Program"
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                />
              </div>
            </div>
            <div className="space-y-4 pt-8">
              <div className="aspect-square rounded-2xl overflow-hidden">
                <Image
                  src="/images/programs/healthcare-initiative.jpg"
                  alt="Healthcare Initiative"
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                />
              </div>
              <div className="aspect-[4/3] rounded-2xl overflow-hidden">
                <Image
                  src="/images/programs/empowerment-project.jpg"
                  alt="Empowerment Project"
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
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
