import React from 'react';
import { GraduationCap, Book, Users, Award } from 'lucide-react';
import PageHero from '../../components/PageHero';
import ProgramStats from '../../components/programs/ProgramStats';
import ProgramImpactMetrics from '../../components/programs/ProgramImpactMetrics';
import ProgramTestimonials from '../../components/programs/ProgramTestimonials';
import ProgramTimeline from '../../components/programs/ProgramTimeline';
import ProgramCTA from '../../components/programs/ProgramCTA';
import ProgramGoals from '../../components/programs/ProgramGoals';
import ProgramSuccessStories from '../../components/programs/ProgramSuccessStories';

const Education = () => {
  const pageHero = {
    title: "Education Program",
    subtitle: "Empowering through quality education and lifelong learning opportunities",
    image: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=1200&auto=format&fit=crop&q=80"
  };

  const programImages = {
    gallery: [
      {
        src: "https://images.unsplash.com/photo-1509062522246-3755977927d7?w=800&auto=format&fit=crop&q=80",
        alt: "Students studying together",
        title: "Collaborative Learning"
      },
      {
        src: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800&auto=format&fit=crop&q=80",
        alt: "Students in library",
        title: "Research & Study"
      },
      {
        src: "https://images.unsplash.com/photo-1427504494785-3a9ca7044f45?w=800&auto=format&fit=crop&q=80",
        alt: "School children",
        title: "Primary Education"
      },
      {
        src: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&auto=format&fit=crop&q=80",
        alt: "Group study",
        title: "Student Collaboration"
      }
    ]
  };

  const stats = {
    totalBeneficiaries: 2500,
    activeCases: 1800,
    successRate: 95,
    locations: 15
  };

  const impactMetrics = [
    {
      icon: Users,
      value: 2500,
      label: 'Students Supported',
      description: 'Active learners in our programs'
    },
    {
      icon: Book,
      value: 15,
      label: 'Learning Centers',
      description: 'Across multiple regions'
    },
    {
      icon: Award,
      value: 95,
      label: 'Graduation Rate',
      description: 'Program completion percentage'
    },
    {
      icon: GraduationCap,
      value: 850,
      label: 'Scholarships',
      description: 'Awarded to deserving students'
    }
  ];

  const goals = [
    {
      id: 1,
      title: 'Quality Education Access',
      description: 'Provide access to quality education for underprivileged children',
      progress: 75,
      target: '5000 Students',
      achieved: '3750 Students'
    },
    {
      id: 2,
      title: 'Teacher Training',
      description: 'Train and empower local teachers with modern teaching methodologies',
      progress: 60,
      target: '200 Teachers',
      achieved: '120 Teachers'
    }
  ];

  const testimonials = [
    {
      id: 1,
      name: 'Sarah Johnson',
      role: 'Student',
      content: 'The education program has completely transformed my life. I now have hope for a brighter future.',
      image: '/images/testimonials/sarah.jpg'
    },
    {
      id: 2,
      name: 'James Smith',
      role: 'Teacher',
      content: 'Being part of this program has helped me become a better educator and mentor.',
      image: '/images/testimonials/james.jpg'
    }
  ];

  const timeline = [
    {
      year: 2020,
      title: 'Program Launch',
      description: 'Started with 5 learning centers'
    },
    {
      year: 2021,
      title: 'Expansion Phase',
      description: 'Opened 10 more centers and introduced teacher training'
    },
    {
      year: 2022,
      title: 'Digital Integration',
      description: 'Implemented technology-based learning solutions'
    }
  ];

  const successStories = [
    {
      id: 1,
      title: 'From Student to Scholar',
      content: 'Maria\'s journey from a rural village to university scholarship',
      image: '/images/success/maria.jpg'
    },
    {
      id: 2,
      title: 'Building Future Leaders',
      content: 'How our leadership program transformed local youth',
      image: '/images/success/leaders.jpg'
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
          <ProgramGoals goals={goals} category="education" />
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
            title="Join Our Education Initiative"
            description="Help us create lasting change through education"
            buttonText="Get Involved"
            buttonLink="/volunteer"
          />
        </div>
      </div>
    </div>
  );
};

export default Education;