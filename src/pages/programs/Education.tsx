import React from 'react';
import { GraduationCap, Book, Users, Award, BookOpen, UserCheck } from 'lucide-react';
import PageHero from '../../components/PageHero';
import ProgramStats from '../../components/programs/ProgramStats';
import ProgramGoals from '../../components/programs/ProgramGoals';
import ProgramSuccessStories from '../../components/programs/ProgramSuccessStories';
import ProgramCTA from '../../components/programs/ProgramCTA';

const Education = () => {
  const pageHero = {
    title: "Education Program",
    subtitle: "Empowering through quality education and lifelong learning opportunities",
    image: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=1200&auto=format&fit=crop&q=80"
  };

  const stats = {
    totalBeneficiaries: 2500,
    activeCases: 1800,
    successRate: 95,
    locations: 15,
    adultLiteracyRate: 55
  };

  const goals = [
    {
      id: 1,
      title: "Education Access",
      description: "Ensure access to education for vulnerable and poor boys and girls in programme areas",
      progress: 75,
      target: "5000 Students",
      achieved: "3750 Students"
    },
    {
      id: 2,
      title: "Adult Literacy",
      description: "Empower women and youth through literacy programs and skills development",
      progress: 55,
      target: "2000 Adults",
      achieved: "1100 Adults"
    },
    {
      id: 3,
      title: "Community Engagement",
      description: "Build capacity of vulnerable communities through teaching and training on relevant development issues",
      progress: 80,
      target: "50 Communities",
      achieved: "40 Communities"
    }
  ];

  const stories = [
    {
      id: 1,
      title: "Education Access for the Vulnerable",
      description: "The overall goal of the education programme is to promote education amongst vulnerable communities through availing education opportunities among girls and boys.",
      image: "https://images.unsplash.com/photo-1509062522246-3755977927d7?w=800&auto=format&fit=crop&q=80",
      quote: "Education is the most powerful weapon which you can use to change the world.",
      author: "Community Leader",
      role: "Education Program"
    },
    {
      id: 2,
      title: "Functional Adult Literacy",
      description: "Our adult literacy project uses literacy as an effective means of empowering women and youth from poverty, with a current success rate of 55%.",
      image: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800&auto=format&fit=crop&q=80",
      quote: "Literacy is a bridge from misery to hope.",
      author: "Program Director",
      role: "Adult Education"
    },
    {
      id: 3,
      title: "Community Development",
      description: "Through constant needs assessment and collaboration with other institutions, we develop relevant content and apply appropriate training approaches.",
      image: "https://images.unsplash.com/photo-1427504494785-3a9ca7044f45?w=800&auto=format&fit=crop&q=80",
      quote: "Together we can make a difference in our community.",
      author: "Community Member",
      role: "Development Program"
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <PageHero {...pageHero} />
      
      <div className="container mx-auto px-4 py-12">
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">Our Education Programs</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="mb-4">
                <GraduationCap className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Education Access for Vulnerable Children</h3>
              <p className="text-gray-600">The overall goal is to promote education amongst vulnerable communities through availing education opportunities among girls and boys, support relevant school's infrastructures and adult illiteracy programmes.</p>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="mb-4">
                <BookOpen className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Functional Adult Literacy Education</h3>
              <p className="text-gray-600">Our adult literacy project uses literacy as an effective means of empowering women and youth from poverty. The program enables learners to read and write while equipping them with skills in health, agriculture, micro-enterprise, and property ownership.</p>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="mb-4">
                <UserCheck className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Community Development</h3>
              <p className="text-gray-600">Through constant needs assessment and collaboration with other institutions, we develop relevant content and apply appropriate training approaches to optimize education intervention results in vulnerable communities.</p>
            </div>
          </div>
        </div>

        <ProgramStats stats={stats} />
        <ProgramGoals goals={goals} category="education" />
        <ProgramSuccessStories stories={stories} category="education" />
        <ProgramCTA programName="Education" />
      </div>
    </div>
  );
};

export default Education;