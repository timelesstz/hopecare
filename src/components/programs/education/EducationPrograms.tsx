import React from 'react';
import { motion } from 'framer-motion';
import { Book, GraduationCap, Users, Laptop } from 'lucide-react';

const programs = [
  {
    icon: Book,
    title: "Early Childhood Education",
    description: "Providing foundational learning experiences for children aged 3-6 years through play-based curriculum and developmental activities.",
    features: [
      "Age-appropriate learning materials",
      "Qualified early childhood educators",
      "Safe and stimulating environment",
      "Parent involvement programs"
    ]
  },
  {
    icon: GraduationCap,
    title: "Primary Education Support",
    description: "Supporting primary school students with resources, tutoring, and academic enrichment programs to ensure educational success.",
    features: [
      "After-school tutoring",
      "Learning materials provision",
      "Homework assistance",
      "Academic mentorship"
    ]
  },
  {
    icon: Users,
    title: "Adult Education",
    description: "Empowering adults through literacy programs, vocational training, and continuing education opportunities.",
    features: [
      "Basic literacy classes",
      "Vocational skills training",
      "Financial literacy",
      "Digital skills workshops"
    ]
  },
  {
    icon: Laptop,
    title: "Digital Learning",
    description: "Bridging the digital divide through technology-enabled learning programs and computer literacy initiatives.",
    features: [
      "Computer skills training",
      "Online learning resources",
      "Digital library access",
      "Technology workshops"
    ]
  }
];

const EducationPrograms = () => {
  return (
    <div className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Education Programs</h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Comprehensive educational initiatives designed to support learners at every stage
            of their journey, from early childhood to adult education.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {programs.map((program, index) => (
            <motion.div
              key={program.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="bg-white rounded-lg shadow-lg overflow-hidden"
            >
              <div className="p-6">
                <div className="flex items-center mb-4">
                  <div className="bg-blue-100 rounded-lg p-3">
                    <program.icon className="h-6 w-6 text-blue-600" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 ml-4">{program.title}</h3>
                </div>
                <p className="text-gray-600 mb-6">{program.description}</p>
                <ul className="space-y-2">
                  {program.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-center text-gray-600">
                      <span className="w-2 h-2 bg-blue-600 rounded-full mr-3"></span>
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default EducationPrograms;