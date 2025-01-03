import React from 'react';
import { Briefcase, GraduationCap, Heart } from 'lucide-react';
import ProgramCard from './ProgramCard';

const programs = [
  {
    title: "Economic Empowerment",
    description: "Supporting small-scale income generating activities and improving household livelihood security.",
    interventions: [
      "Business skills facilitation",
      "Micro Financing for women and youth",
      "Market linkages",
      "Food security initiatives"
    ],
    icon: <Briefcase className="h-6 w-6 text-rose-600" />,
    slug: "economic-empowerment"
  },
  {
    title: "Education Program",
    description: "Promoting education amongst vulnerable communities through various initiatives.",
    interventions: [
      "Education access for vulnerable children",
      "Adult literacy programs",
      "School infrastructure support",
      "Parent engagement programs"
    ],
    icon: <GraduationCap className="h-6 w-6 text-rose-600" />,
    slug: "education"
  },
  {
    title: "Health Program",
    description: "Empowering communities to address health challenges and improve well-being.",
    interventions: [
      "HIV/AIDS prevention and care",
      "Adolescent reproductive health",
      "Maternal health services",
      "Community health education"
    ],
    icon: <Heart className="h-6 w-6 text-rose-600" />,
    slug: "health"
  }
];

const ProgramShowcase: React.FC = () => {
  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Programs</h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            We work to empower vulnerable communities through comprehensive programs
            focused on economic empowerment, education, and health.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {programs.map((program) => (
            <ProgramCard key={program.slug} {...program} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default ProgramShowcase;