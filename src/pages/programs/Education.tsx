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
      content: 'The education program at HopeCare has opened doors I never thought possible. Thanks to the scholarship and mentoring support, I am now pursuing my dream of becoming a teacher. The dedicated staff and quality education have truly transformed my life.',
      image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&auto=format&fit=crop&q=80'
    },
    {
      id: 2,
      name: 'James Smith',
      role: 'Teacher',
      content: 'Being part of HopeCare\'s education program has revolutionized my teaching approach. The professional development opportunities and resources provided have helped me create a more engaging and effective learning environment for my students.',
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80'
    },
    {
      id: 3,
      name: 'Emily Chen',
      role: 'Parent',
      content: 'I\'ve seen remarkable improvement in my child\'s academic performance and confidence since joining HopeCare\'s after-school program. The personalized attention and supportive environment make all the difference.',
      image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&auto=format&fit=crop&q=80'
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
      title: 'From Rural Village to University Scholar',
      content: 'Maria\'s journey from a small rural village to winning a full university scholarship is a testament to perseverance. Through HopeCare\'s education program, she received quality education, mentoring, and the support needed to achieve her dreams.',
      image: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=800&auto=format&fit=crop&q=80'
    },
    {
      id: 2,
      title: 'Building Future Leaders',
      content: 'Our leadership development program has transformed local youth into community champions. Through workshops, mentoring, and hands-on projects, students learn valuable leadership skills while making a positive impact in their communities.',
      image: 'https://images.unsplash.com/photo-1529390079861-591de354faf5?w=800&auto=format&fit=crop&q=80'
    },
    {
      id: 3,
      title: 'Technology Education Initiative',
      content: 'Our digital literacy program has equipped over 500 students with essential computer skills. By partnering with tech companies, we provide access to modern equipment and industry-relevant training.',
      image: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?w=800&auto=format&fit=crop&q=80'
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