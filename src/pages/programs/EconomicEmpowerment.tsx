import React from 'react';
import { Briefcase, Users, TrendingUp, Coins } from 'lucide-react';
import PageHero from '../../components/PageHero';
import ProgramStats from '../../components/programs/ProgramStats';
import ProgramImpactMetrics from '../../components/programs/ProgramImpactMetrics';
import ProgramTestimonials from '../../components/programs/ProgramTestimonials';
import ProgramTimeline from '../../components/programs/ProgramTimeline';
import ProgramCTA from '../../components/programs/ProgramCTA';
import ProgramGoals from '../../components/programs/ProgramGoals';
import ProgramSuccessStories from '../../components/programs/ProgramSuccessStories';

const EconomicEmpowerment = () => {
  const pageHero = {
    title: "Economic Empowerment",
    subtitle: "Building sustainable livelihoods through entrepreneurship and skills development",
    image: "https://images.unsplash.com/photo-1556911220-bff31c812dba?w=1200&auto=format&fit=crop&q=80"
  };

  const programImages = {
    gallery: [
      {
        src: "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=800&auto=format&fit=crop&q=80",
        alt: "Business training",
        title: "Skills Training"
      },
      {
        src: "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=800&auto=format&fit=crop&q=80",
        alt: "Team collaboration",
        title: "Business Development"
      },
      {
        src: "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=800&auto=format&fit=crop&q=80",
        alt: "Local business",
        title: "Entrepreneurship"
      },
      {
        src: "https://images.unsplash.com/photo-1553729459-efe14ef6055d?w=800&auto=format&fit=crop&q=80",
        alt: "Market success",
        title: "Economic Growth"
      }
    ]
  };

  const stats = {
    totalBeneficiaries: 3000,
    activeCases: 1500,
    successRate: 85,
    locations: 25
  };

  const impactMetrics = [
    {
      icon: Users,
      value: 3000,
      label: 'Entrepreneurs Supported',
      description: 'Small business owners and startups'
    },
    {
      icon: Briefcase,
      value: 25,
      label: 'Training Centers',
      description: 'Skills development facilities'
    },
    {
      icon: TrendingUp,
      value: 85,
      label: 'Success Rate',
      description: 'Business sustainability'
    },
    {
      icon: Coins,
      value: 500,
      label: 'Microloans',
      description: 'Financial support provided'
    }
  ];

  const goals = [
    {
      id: 1,
      title: 'Business Development',
      description: 'Support small business growth and entrepreneurship',
      progress: 70,
      target: '5000 Businesses',
      achieved: '3500 Businesses'
    },
    {
      id: 2,
      title: 'Skills Training',
      description: 'Provide vocational and business skills training',
      progress: 85,
      target: '4000 Trainees',
      achieved: '3400 Trainees'
    }
  ];

  const testimonials = [
    {
      id: 1,
      name: 'Grace Thompson',
      role: 'Entrepreneur',
      content: 'The program gave me the skills and support I needed to start my own successful business.',
      image: '/images/testimonials/grace.jpg'
    },
    {
      id: 2,
      name: 'Michael Chen',
      role: 'Business Owner',
      content: 'Thanks to the microloan program, I was able to expand my shop and hire more employees.',
      image: '/images/testimonials/michael.jpg'
    }
  ];

  const timeline = [
    {
      year: 2020,
      title: 'Program Launch',
      description: 'Started with basic business training'
    },
    {
      year: 2021,
      title: 'Microloan Program',
      description: 'Introduced financial support system'
    },
    {
      year: 2022,
      title: 'Digital Skills',
      description: 'Added e-commerce and digital marketing training'
    }
  ];

  const successStories = [
    {
      id: 1,
      title: 'Market Success',
      content: 'How Sarah turned her small stall into a thriving business',
      image: '/images/success/sarah-business.jpg'
    },
    {
      id: 2,
      title: 'Tech Innovation',
      content: 'James\' journey from trainee to tech entrepreneur',
      image: '/images/success/james-tech.jpg'
    }
  ];

  return (
    <div className="min-h-screen">
      <PageHero 
        title={pageHero.title}
        subtitle={pageHero.subtitle}
        image={pageHero.image}
      />
      
      <div className="container mx-auto px-4 py-12">
        <ProgramStats stats={stats} />
        
        <div className="mt-16">
          <ProgramImpactMetrics metrics={impactMetrics} />
        </div>

        <div className="mt-16">
          <ProgramGoals goals={goals} category="economic" />
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
            title="Join Our Economic Initiative"
            description="Help us create sustainable economic opportunities"
            buttonText="Get Involved"
            buttonLink="/volunteer"
          />
        </div>
      </div>
    </div>
  );
};

export default EconomicEmpowerment;