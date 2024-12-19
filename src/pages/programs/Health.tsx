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
  const pageHero = {
    title: "Healthcare Program",
    subtitle: "Providing accessible healthcare services to underserved communities",
    image: "https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=1200&auto=format&fit=crop&q=80"
  };

  const programImages = {
    gallery: [
      {
        src: "https://images.unsplash.com/photo-1666214280557-f1b5022eb634?w=800&auto=format&fit=crop&q=80",
        alt: "Medical consultation",
        title: "Patient Care"
      },
      {
        src: "https://images.unsplash.com/photo-1631815589968-fdb09a223b1e?w=800&auto=format&fit=crop&q=80",
        alt: "Health screening",
        title: "Preventive Care"
      },
      {
        src: "https://images.unsplash.com/photo-1505751172876-fa1923c5c528?w=800&auto=format&fit=crop&q=80",
        alt: "Medical supplies",
        title: "Healthcare Resources"
      },
      {
        src: "https://images.unsplash.com/photo-1584516150909-c43483ee7932?w=800&auto=format&fit=crop&q=80",
        alt: "Community health",
        title: "Community Outreach"
      }
    ]
  };

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
      content: 'The healthcare program at HopeCare was a lifeline for my family. When I couldn\'t afford the treatment I desperately needed, they provided not just medical care but also emotional support throughout my recovery journey. Their dedication to patient care is truly remarkable.',
      image: 'https://images.unsplash.com/photo-1500048993953-d23a436266cf?w=400&auto=format&fit=crop&q=80'
    },
    {
      id: 2,
      name: 'Dr. Emily Brown',
      role: 'Healthcare Provider',
      content: 'Being part of HopeCare\'s medical team has been incredibly fulfilling. We\'re not just treating illnesses; we\'re building lasting relationships with communities and making healthcare accessible to those who need it most. The impact we\'re making is visible every day.',
      image: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400&auto=format&fit=crop&q=80'
    },
    {
      id: 3,
      name: 'Maria Rodriguez',
      role: 'Community Health Worker',
      content: 'Through HopeCare\'s mobile clinic program, we\'ve been able to reach remote villages and provide essential healthcare services. Seeing the transformation in community health awareness and outcomes has been incredibly rewarding.',
      image: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=400&auto=format&fit=crop&q=80'
    }
  ];

  const timeline = [
    {
      year: 2020,
      title: 'Program Launch',
      description: 'Established first 3 health centers with basic medical facilities and emergency care services'
    },
    {
      year: 2021,
      title: 'Mobile Clinics',
      description: 'Launched 5 mobile healthcare units to reach remote communities, serving over 1000 patients monthly'
    },
    {
      year: 2022,
      title: 'Specialist Care',
      description: 'Introduced specialized medical services including pediatric care, maternal health, and chronic disease management'
    },
    {
      year: 2023,
      title: 'Digital Health',
      description: 'Implemented telemedicine services and electronic health records for better patient care'
    }
  ];

  const successStories = [
    {
      id: 1,
      title: 'Emergency Care Success',
      content: 'John\'s life-threatening accident required immediate medical attention. Thanks to our 24/7 emergency care facility and skilled medical team, he received timely treatment and made a full recovery. This case highlighted the crucial importance of having accessible emergency medical services in underserved areas.',
      image: 'https://images.unsplash.com/photo-1516549655169-df83a0774514?w=800&auto=format&fit=crop&q=80'
    },
    {
      id: 2,
      title: 'Rural Healthcare Revolution',
      content: 'Our mobile clinic initiative has transformed healthcare access in rural communities. By bringing medical services directly to remote villages, we\'ve provided essential care to over 5,000 residents who previously had to travel hours for basic medical attention. The program now serves 15 villages regularly.',
      image: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800&auto=format&fit=crop&q=80'
    },
    {
      id: 3,
      title: 'Maternal Health Impact',
      content: 'Our maternal health program has achieved remarkable success in improving pregnancy outcomes. Through regular check-ups, nutritional support, and skilled birth attendance, we\'ve helped over 500 mothers have safe pregnancies and healthy babies. The program has reduced complications by 75%.',
      image: 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?w=800&auto=format&fit=crop&q=80'
    },
    {
      id: 4,
      title: 'Preventive Care Success',
      content: 'The launch of our preventive health screening program has led to early detection and treatment of various conditions. Regular health camps and awareness sessions have educated communities about the importance of preventive care, resulting in a 60% increase in early disease detection.',
      image: 'https://images.unsplash.com/photo-1631815587646-b85a1bb027e1?w=800&auto=format&fit=crop&q=80'
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