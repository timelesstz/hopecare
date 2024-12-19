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
      role: 'Small Business Owner',
      content: 'HopeCare\'s economic empowerment program transformed my life. With their business training and microloan support, I turned my small food stall into a successful catering business. Now I employ five people from my community and can provide for my family\'s needs.',
      image: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=400&auto=format&fit=crop&q=80'
    },
    {
      id: 2,
      name: 'Michael Chen',
      role: 'Tech Entrepreneur',
      content: 'The digital skills training and mentorship I received were invaluable. What started as a small computer repair shop has grown into a successful IT services company. The program\'s network of mentors continues to guide my business growth.',
      image: 'https://images.unsplash.com/photo-1537511446984-935f663eb1f4?w=400&auto=format&fit=crop&q=80'
    },
    {
      id: 3,
      name: 'Amina Hassan',
      role: 'Artisan Cooperative Leader',
      content: 'Through HopeCare\'s cooperative development program, we united local artisans to create a thriving marketplace. The business management training and market access support have helped us reach international customers.',
      image: 'https://images.unsplash.com/photo-1594744803329-e58b31de8bf5?w=400&auto=format&fit=crop&q=80'
    }
  ];

  const timeline = [
    {
      year: 2020,
      title: 'Program Launch',
      description: 'Initiated comprehensive business training programs and established first entrepreneurship center serving 200 participants'
    },
    {
      year: 2021,
      title: 'Microloan Program',
      description: 'Launched microloan initiative providing 500 small business loans and financial literacy training to aspiring entrepreneurs'
    },
    {
      year: 2022,
      title: 'Digital Skills Integration',
      description: 'Introduced e-commerce, digital marketing, and online business management courses, training over 1000 participants'
    },
    {
      year: 2023,
      title: 'Market Expansion',
      description: 'Established partnerships with 50 companies for job placement and created an online marketplace for program graduates'
    }
  ];

  const successStories = [
    {
      id: 1,
      title: 'From Market Stall to Restaurant Chain',
      content: 'Sarah\'s journey began with a small food stall and a dream. Through our business development program, she received training in food service management, financial planning, and marketing. With a microloan of $5,000, she opened her first restaurant. Today, she owns three locations and employs 25 people from the community.',
      image: 'https://images.unsplash.com/photo-1516733968668-dbdce39c4651?w=800&auto=format&fit=crop&q=80'
    },
    {
      id: 2,
      title: 'Digital Innovation Success',
      content: 'James transformed his tech repair skills into a thriving IT solutions company. Our digital skills program provided him with advanced technical training and business management skills. His company now provides IT support to over 50 local businesses and has created job opportunities for 15 young professionals.',
      image: 'https://images.unsplash.com/photo-1553877522-43269d4ea984?w=800&auto=format&fit=crop&q=80'
    },
    {
      id: 3,
      title: 'Women\'s Cooperative Achievement',
      content: 'A group of 20 women artisans formed a cooperative through our community enterprise program. With training in product development, quality control, and international trade, they now export handcrafted goods to three continents. Their success has inspired two similar cooperatives in neighboring communities.',
      image: 'https://images.unsplash.com/photo-1509099836639-18ba1795216d?w=800&auto=format&fit=crop&q=80'
    },
    {
      id: 4,
      title: 'Youth Agriculture Innovation',
      content: 'A team of young graduates used our agricultural entrepreneurship program to start a modern farming initiative. Using sustainable practices and technology, they\'ve created a successful organic produce business that supplies local restaurants and markets. Their model has been replicated by 10 other youth groups.',
      image: 'https://images.unsplash.com/photo-1529693662653-9d480530a697?w=800&auto=format&fit=crop&q=80'
    },
    {
      id: 5,
      title: 'E-commerce Breakthrough',
      content: 'Through our digital marketplace program, Maria developed an online platform connecting local craftspeople to global markets. Her platform now supports over 100 local artisans, increasing their income by an average of 300%. The success has attracted partnership offers from major e-commerce companies.',
      image: 'https://images.unsplash.com/photo-1472851294608-062f824d29cc?w=800&auto=format&fit=crop&q=80'
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