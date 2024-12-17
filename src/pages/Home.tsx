import React from 'react';
import HeroSection from '../components/home/HeroSection';
import OrganizationIntro from '../components/home/OrganizationIntro';
import ImpactStats from '../components/home/ImpactStats';
import FeaturedPrograms from '../components/home/FeaturedPrograms';
import LatestNews from '../components/home/LatestNews';
import UpcomingEvents from '../components/home/UpcomingEvents';
import TestimonialSlider from '../components/home/TestimonialSlider';
import NewsletterSignup from '../components/home/NewsletterSignup';
import CallToAction from '../components/home/CallToAction';
import { motion } from 'framer-motion';

const Home = () => {
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <HeroSection />

      {/* Organization Introduction */}
      <OrganizationIntro />

      {/* Impact Statistics */}
      <ImpactStats />

      {/* Featured Programs */}
      <FeaturedPrograms />

      {/* Latest News & Events Section */}
      <section className="relative py-20">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-gray-50">
          <div className="absolute inset-0 bg-gradient-to-b from-white to-transparent" />
          <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] [mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,#000_70%,transparent_100%)]" />
        </div>

        {/* Content */}
        <div className="relative">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <h2 className="text-4xl font-bold text-gray-900 mb-4">Stay Connected</h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Join us in making a difference. Stay updated with our latest initiatives and upcoming events.
              </p>
            </motion.div>

            <div className="space-y-20">
              {/* Upcoming Events */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                viewport={{ once: true }}
              >
                <UpcomingEvents />
              </motion.div>

              {/* Latest News */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
                viewport={{ once: true }}
              >
                <LatestNews />
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <TestimonialSlider />

      {/* Newsletter Signup */}
      <NewsletterSignup />

      {/* Call to Action */}
      <CallToAction />
    </div>
  );
};

export default Home;