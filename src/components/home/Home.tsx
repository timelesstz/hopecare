import React from 'react';
import HeroSection from './HeroSection';
import ImpactStats from './ImpactStats';
import FeaturedPrograms from './FeaturedPrograms';
import LatestNews from './LatestNews';
import UpcomingEvents from './UpcomingEvents';
import TestimonialSlider from './TestimonialSlider';
import NewsletterSignup from './NewsletterSignup';
import CallToAction from './CallToAction';

const Home = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <HeroSection />
      <ImpactStats />
      <FeaturedPrograms />
      <LatestNews />
      <UpcomingEvents />
      <TestimonialSlider />
      <NewsletterSignup />
      <CallToAction />
    </div>
  );
};

export default Home;