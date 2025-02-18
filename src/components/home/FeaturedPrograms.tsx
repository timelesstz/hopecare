import React from 'react';
import { ArrowRight, GraduationCap, Heart, Sprout } from 'lucide-react';
import { Link } from 'react-router-dom';

const programs = [
  {
    title: "Education Support",
    icon: GraduationCap,
    description: "Providing educational resources and support to underprivileged children, ensuring access to quality education.",
    image: "featured/education.jpeg",
    link: "/programs/education"
  },
  {
    title: "Health Initiatives",
    icon: Heart,
    description: "Implementing comprehensive health programs focused on prevention, care, and community wellness.",
    image: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&q=80",
    link: "/programs/health"
  },
  {
    title: "Environmental Action",
    icon: Sprout,
    description: "Empowering women and youth through sustainable development initiatives. We provide capacity building, mentorship, and access to capital for over 150 groups in agriculture, renewable energy, and community enterprises, creating lasting environmental and economic impact.",
    image: "featured/environment.jpeg",
    link: "/programs/economic-empowerment"
  }
];

const FeaturedPrograms = () => {
  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Programs</h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Discover how we're creating lasting impact through our comprehensive programs
            focused on education, health, and environmental sustainability.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {programs.map(({ title, icon: Icon, description, image, link }) => (
            <div
              key={title}
              className="bg-white rounded-lg overflow-hidden shadow-lg transform hover:-translate-y-1 transition-all duration-300"
            >
              <div className="relative h-48">
                <img
                  src={image}
                  alt={title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-4 left-4">
                  <div className="bg-white p-2 rounded-full shadow-md">
                    <Icon className="h-6 w-6 text-rose-600" />
                  </div>
                </div>
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-2">{title}</h3>
                <p className="text-gray-600 mb-4">{description}</p>
                <Link
                  to={link}
                  className="inline-flex items-center text-rose-600 hover:text-rose-700 font-medium"
                >
                  Learn More <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturedPrograms;