import React from 'react';
import { Link } from 'react-router-dom';

const Programs = () => {
  const programs = [
    {
      title: 'Education',
      description: 'Supporting education initiatives for underprivileged children',
      image: '/images/programs/education.jpg',
      link: '/programs/education'
    },
    {
      title: 'Healthcare',
      description: 'Providing essential healthcare services to communities in need',
      image: '/images/programs/health.jpg',
      link: '/programs/health'
    },
    {
      title: 'Economic Empowerment',
      description: 'Empowering communities through sustainable economic initiatives',
      image: '/images/programs/economic.jpg',
      link: '/programs/economic-empowerment'
    }
  ];

  return (
    <div className="bg-gray-50 min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
            Our Programs
          </h2>
          <p className="mt-4 text-lg text-gray-500">
            Discover how we're making a difference in communities through our various programs
          </p>
        </div>

        <div className="mt-12 grid gap-8 lg:grid-cols-3 sm:grid-cols-2">
          {programs.map((program) => (
            <Link
              key={program.title}
              to={program.link}
              className="group relative bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300"
            >
              <div className="aspect-w-16 aspect-h-9">
                <img
                  src={program.image}
                  alt={program.title}
                  className="object-cover w-full h-48"
                />
              </div>
              <div className="p-6">
                <h3 className="text-xl font-semibold text-gray-900 group-hover:text-primary">
                  {program.title}
                </h3>
                <p className="mt-2 text-gray-500">
                  {program.description}
                </p>
                <div className="mt-4 flex items-center text-primary">
                  <span>Learn more</span>
                  <svg
                    className="ml-2 w-5 h-5 transition-transform group-hover:translate-x-1"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Programs;
