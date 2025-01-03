import React from 'react';
import { Briefcase, Users, TrendingUp, Coins, Sprout, ShoppingBag, School } from 'lucide-react';
import PageHero from '../../components/PageHero';
import ProgramStats from '../../components/programs/ProgramStats';
import ProgramGoals from '../../components/programs/ProgramGoals';
import ProgramSuccessStories from '../../components/programs/ProgramSuccessStories';
import ProgramCTA from '../../components/programs/ProgramCTA';

const EconomicEmpowerment = () => {
  const pageHero = {
    title: "Economic Empowerment and Enterprises Development",
    subtitle: "Ensuring improved household livelihood security through sustainable economic initiatives",
    image: "https://images.unsplash.com/photo-1556911220-bff31c812dba?w=1200&auto=format&fit=crop&q=80"
  };

  const stats = {
    totalBeneficiaries: 3000,
    activeCases: 1500,
    successRate: 85,
    locations: 25,
    foodSecurityRate: 90
  };

  const goals = [
    {
      id: 1,
      title: "Business Development",
      description: "Facilitate business skills and capacity building for sustainable enterprise development",
      progress: 85,
      target: "3000 Entrepreneurs",
      achieved: "2550 Trained"
    },
    {
      id: 2,
      title: "Food Security",
      description: "Support local communities to alleviate immediate household food insecurity through increased production",
      progress: 90,
      target: "2000 Households",
      achieved: "1800 Households"
    },
    {
      id: 3,
      title: "Agricultural Enhancement",
      description: "Support better agricultural technologies and rehabilitation of irrigation schemes",
      progress: 75,
      target: "1500 Farmers",
      achieved: "1125 Farmers"
    }
  ];

  const stories = [
    {
      id: 1,
      title: "Micro Financing Success",
      description: "Supporting women and youth groups through micro-financing initiatives has led to the establishment of successful small-scale enterprises.",
      image: "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=800&auto=format&fit=crop&q=80",
      quote: "Access to micro-financing has transformed our community's economic landscape.",
      author: "Program Coordinator",
      role: "Micro Finance"
    },
    {
      id: 2,
      title: "Junior Farmers Field Schools",
      description: "Training young farmers in better farming techniques, entrepreneurship, and business skills while addressing health and social issues.",
      image: "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=800&auto=format&fit=crop&q=80",
      quote: "The junior farmers program is building our next generation of agricultural entrepreneurs.",
      author: "Field Coordinator",
      role: "Agricultural Training"
    },
    {
      id: 3,
      title: "Food Security Initiative",
      description: "Our food security program has achieved a 90% success rate in supporting households to become food secure through sustainable farming practices.",
      image: "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=800&auto=format&fit=crop&q=80",
      quote: "Food security is the foundation of community development.",
      author: "Community Leader",
      role: "Food Security Program"
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <PageHero {...pageHero} />
      
      <div className="container mx-auto px-4 py-12">
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">Our Economic Empowerment Programs</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="mb-4">
                <Briefcase className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Business Development</h3>
              <p className="text-gray-600">Supporting small-scale income generating activities, capacity development and linking producer groups to reliable markets and credit schemes. Our approach includes business skills facilitation and micro-financing targeting women and youth groups.</p>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="mb-4">
                <Sprout className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Agricultural Innovation</h3>
              <p className="text-gray-600">Supporting better agricultural technologies, developing productive safety nets, and rehabilitating irrigation schemes. We facilitate sustainable farmers' associations and share best practices across communities.</p>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="mb-4">
                <School className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Junior Farmers Program</h3>
              <p className="text-gray-600">Training young farmers in better farming techniques, hygiene and sanitation, entrepreneurship, business skills, nutrition, and addressing social issues through practical field schools.</p>
            </div>
          </div>
        </div>

        <div className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">Our Approaches</h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="h-48 relative">
                <img 
                  src="https://images.unsplash.com/photo-1589923158776-cb4485d99fd6?w=800&auto=format&fit=crop&q=80" 
                  alt="Food Security Initiative"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-6">
                <h3 className="text-xl font-semibold mb-4">Food Security and Livelihoods</h3>
                <div className="mb-4">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-primary h-2 rounded-full" style={{ width: '90%' }}></div>
                  </div>
                  <p className="text-sm text-gray-600 mt-2">90% Success Rate</p>
                </div>
                <p className="text-gray-600">Supporting local communities to alleviate immediate household food insecurity through increasing food production capacities and addressing the root causes of food insecurity.</p>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="h-48 relative">
                <img 
                  src="https://images.unsplash.com/photo-1542838132-92c53300491e?w=800&auto=format&fit=crop&q=80" 
                  alt="Market Development"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-6">
                <h3 className="text-xl font-semibold mb-4">Market Development</h3>
                <ul className="list-disc list-inside text-gray-600 space-y-2">
                  <li>Establishing reliable market linkages for producer groups</li>
                  <li>Supporting access to credit schemes</li>
                  <li>Facilitating business skills development</li>
                  <li>Building sustainable farmer associations</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <ProgramStats stats={stats} />
        <ProgramGoals goals={goals} category="economic" />
        <ProgramSuccessStories stories={stories} category="economic" />
        <ProgramCTA programName="Economic Empowerment" />
      </div>
    </div>
  );
};

export default EconomicEmpowerment;