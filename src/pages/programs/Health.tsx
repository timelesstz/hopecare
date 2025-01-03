import React from 'react';
import { Heart, Users, Activity, Stethoscope, Baby, Shield, UserPlus } from 'lucide-react';
import PageHero from '../../components/PageHero';
import ProgramStats from '../../components/programs/ProgramStats';
import ProgramGoals from '../../components/programs/ProgramGoals';
import ProgramSuccessStories from '../../components/programs/ProgramSuccessStories';
import ProgramCTA from '../../components/programs/ProgramCTA';

const Health = () => {
  const pageHero = {
    title: "Health Program",
    subtitle: "Empowering vulnerable populations and communities to address HIV/AIDS and maternal health challenges",
    image: "https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=1200&auto=format&fit=crop&q=80"
  };

  const stats = {
    totalBeneficiaries: 5000,
    activeCases: 2500,
    successRate: 75,
    locations: 12
  };

  const goals = [
    {
      id: 1,
      title: "HIV/AIDS Prevention, Care and Nutrition",
      description: "Awareness creation, community sensitization, and support for home-based care resources",
      progress: 55,
      target: "Community-wide Coverage",
      achieved: "55% Progress"
    },
    {
      id: 2,
      title: "Adolescent Reproductive Health",
      description: "Peer Health Education and Life Skills Education for youth",
      progress: 60,
      target: "Youth Education Coverage",
      achieved: "60% Progress"
    },
    {
      id: 3,
      title: "Maternal Health and Child Care",
      description: "Community-based maternal health services and economic empowerment",
      progress: 65,
      target: "Maternal Care Coverage",
      achieved: "65% Progress"
    }
  ];

  const stories = [
    {
      id: 1,
      title: "HIV/AIDS Prevention Success",
      description: "Our community sensitization programs have successfully increased awareness and prevention measures.",
      image: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800&auto=format&fit=crop&q=80",
      quote: "The community-based approach has made a significant impact in HIV/AIDS prevention.",
      author: "Community Health Worker",
      role: "Healthcare Provider"
    },
    {
      id: 2,
      title: "Youth Health Education",
      description: "Peer Health Educators have successfully reached thousands of young people with vital health information.",
      image: "https://images.unsplash.com/photo-1531206715517-5c0ba140b2b8?w=800&auto=format&fit=crop&q=80",
      quote: "Peer education has transformed how youth approach reproductive health.",
      author: "Youth Coordinator",
      role: "Program Leader"
    },
    {
      id: 3,
      title: "Maternal Health Impact",
      description: "Our maternal health initiatives have significantly reduced mortality rates among rural women.",
      image: "https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?w=800&auto=format&fit=crop&q=80",
      quote: "Access to maternal health services has improved dramatically in our community.",
      author: "Traditional Birth Attendant",
      role: "Healthcare Provider"
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <PageHero {...pageHero} />
      
      <div className="container mx-auto px-4 py-12">
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">Our Health Programs</h2>
          <p className="text-gray-600 mb-8">
            For the past 20 years, we have witnessed an alarming increase in HIV/AIDS infections and maternal mortality rates among rural poor women, infants, and Key and Vulnerable Populations. HopeCareTz intervenes to empower vulnerable populations and the community at large to curb HIV/AIDS infections and reduce maternal mortality rates.
          </p>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="mb-4">
                <Shield className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-3">HIV/AIDS Prevention & Care</h3>
              <div className="mb-4">
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-primary h-2 rounded-full" style={{ width: '55%' }}></div>
                </div>
                <p className="text-sm text-gray-600 mt-2">55% Progress</p>
              </div>
              <ul className="text-gray-600 space-y-2">
                <li>• Awareness creation and community sensitization</li>
                <li>• Knowledge and capacity building</li>
                <li>• Home-based care support</li>
                <li>• Nutritional projects support</li>
              </ul>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="mb-4">
                <UserPlus className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Adolescent Reproductive Health</h3>
              <div className="mb-4">
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-primary h-2 rounded-full" style={{ width: '60%' }}></div>
                </div>
                <p className="text-sm text-gray-600 mt-2">60% Progress</p>
              </div>
              <ul className="text-gray-600 space-y-2">
                <li>• Peer Health Educator training</li>
                <li>• Reproductive health campaigns</li>
                <li>• Life skills education</li>
                <li>• Youth-focused initiatives</li>
              </ul>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="mb-4">
                <Baby className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Maternal & Child Health</h3>
              <div className="mb-4">
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-primary h-2 rounded-full" style={{ width: '65%' }}></div>
                </div>
                <p className="text-sm text-gray-600 mt-2">65% Progress</p>
              </div>
              <ul className="text-gray-600 space-y-2">
                <li>• Community-based health services</li>
                <li>• Maternal health awareness</li>
                <li>• Economic empowerment</li>
                <li>• Nutritional support</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">Our Impact</h2>
          <div className="bg-white rounded-lg shadow-md p-8">
            <p className="text-gray-600 mb-6">
              HopeCareTz has registered tremendous experience and achievements within the targeted communities through successful implementation of HIV/AIDS Awareness, Prevention, Care and Nutrition Projects. We have established strong collaborations with:
            </p>
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h3 className="font-semibold mb-4">Key Partnerships</h3>
                <ul className="list-disc list-inside text-gray-600 space-y-2">
                  <li>District authorities</li>
                  <li>Traditional authorities</li>
                  <li>Ward HIV/AIDS committees</li>
                  <li>Local authorities</li>
                  <li>Women and youth groups</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold mb-4">Community Support</h3>
                <ul className="list-disc list-inside text-gray-600 space-y-2">
                  <li>Village HIV/AIDS Committees</li>
                  <li>Trained ToTs and PHEs</li>
                  <li>Traditional leaders</li>
                  <li>Community Based Volunteers</li>
                  <li>Traditional Birth Attendants</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <div className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">Crossing Cutting Issues</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-xl font-semibold mb-3">Human Rights</h3>
              <p className="text-gray-600">Promoting and protecting the fundamental rights of all individuals in our healthcare initiatives.</p>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-xl font-semibold mb-3">Gender</h3>
              <p className="text-gray-600">Ensuring gender equality and empowerment in all our health programs and services.</p>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-xl font-semibold mb-3">Environment</h3>
              <p className="text-gray-600">Implementing environmentally sustainable practices in our healthcare delivery.</p>
            </div>
          </div>
        </div>

        <ProgramStats stats={stats} />
        <ProgramGoals goals={goals} category="health" />
        <ProgramSuccessStories stories={stories} category="health" />
        <ProgramCTA programName="Health" />
      </div>
    </div>
  );
};

export default Health;