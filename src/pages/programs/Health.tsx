import React from 'react';
import { Heart, Users, Activity, Stethoscope } from 'lucide-react';
import PageHero from '../../components/PageHero';
import ProgramStats from '../../components/programs/ProgramStats';
import ProgramImpactMetrics from '../../components/programs/ProgramImpactMetrics';
import ProgramTestimonials from '../../components/programs/ProgramTestimonials';
import ProgramTimeline from '../../components/programs/ProgramTimeline';
import ProgramCTA from '../../components/programs/ProgramCTA';
import ProgramGoals from '../../components/programs/ProgramGoals';
import ProgramSuccessStories from '../../components/programs/ProgramSuccessStories';

const Health = () => {
  const stats = {
    totalBeneficiaries: 5000,
    activeCases: 2500,
    successRate: 98,
    locations: 12
  };

  const impactMetrics = [
    {
      icon: Users,
      value: 5000,
      label: 'Patients Served',
      description: 'Across all our health centers'
    },
    {
      icon: Heart,
      value: 12,
      label: 'Health Centers',
      description: 'Providing essential care'
    },
    {
      icon: Activity,
      value: 98,
      label: 'Success Rate',
      description: 'In treatment outcomes'
    },
    {
      icon: Stethoscope,
      value: 75,
      label: 'Medical Staff',
      description: 'Dedicated healthcare providers'
    }
  ];

  const goals = [
    {
      id: 1,
      title: 'Healthcare Access',
      description: 'Provide accessible healthcare services to underserved communities',
      progress: 80,
      target: '10,000 Patients',
      achieved: '8,000 Patients'
    },
    {
      id: 2,
      title: 'Preventive Care',
      description: 'Implement comprehensive preventive healthcare programs',
      progress: 65,
      target: '15 Programs',
      achieved: '10 Programs'
    }
  ];

  const testimonials = [
    {
      id: 1,
      name: 'David Wilson',
      role: 'Patient',
      content: 'The healthcare program provided me with life-saving treatment I couldn\'t afford elsewhere.',
      image: '/images/testimonials/david.jpg'
    },
    {
      id: 2,
      name: 'Dr. Emily Brown',
      role: 'Healthcare Provider',
      content: 'Working with this program has allowed me to serve those who need care the most.',
      image: '/images/testimonials/emily.jpg'
    }
  ];

  const timeline = [
    {
      year: 2020,
      title: 'Program Launch',
      description: 'Established first 3 health centers'
    },
    {
      year: 2021,
      title: 'Mobile Clinics',
      description: 'Launched mobile healthcare units'
    },
    {
      year: 2022,
      title: 'Specialist Care',
      description: 'Introduced specialized medical services'
    }
  ];

  const successStories = [
    {
      id: 1,
      title: 'Life-Saving Care',
      content: 'How our emergency care program saved John\'s life',
      image: '/images/success/john.jpg'
    },
    {
      id: 2,
      title: 'Community Health',
      content: 'Transforming rural healthcare access',
      image: '/images/success/community.jpg'
    }
  ];

  return (
    <div className="min-h-screen">
      <PageHero 
        title="Health Program"
        subtitle="Providing quality healthcare to underserved communities"
        image="/images/programs/health-hero.jpg"
      />
      
      <div className="container mx-auto px-4 py-12">
        <ProgramStats stats={stats} />
        
        <div className="mt-16">
          <ProgramImpactMetrics metrics={impactMetrics} />
        </div>

        <div className="mt-16">
          <ProgramGoals goals={goals} category="health" />
        </div>

        <div className="mt-16">
          <ProgramTimeline events={timeline} />
        </div>

        <div className="mt-16">
          <ProgramTestimonials testimonials={testimonials} />
        </div>

        <div className="mt-16">
          <ProgramSuccessStories stories={successStories} />
        </div>

        <div className="mt-16">
          <ProgramCTA 
            title="Support Our Health Initiative"
            description="Help us provide essential healthcare to those in need"
            buttonText="Get Involved"
            buttonLink="/volunteer"
          />
        </div>
      </div>
    </div>
  );
};

export default Health;