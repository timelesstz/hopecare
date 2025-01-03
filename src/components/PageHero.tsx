import React from 'react';
import Image from './common/Image';

interface PageHeroProps {
  title: string;
  subtitle?: string;
  image?: string;
}

const PageHero: React.FC<PageHeroProps> = ({ title, subtitle, image }) => {
  return (
    <section className="relative h-[400px] mb-12">
      <div className="absolute inset-0">
        <Image
          src={image || '/images/placeholder.svg'}
          alt={title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black opacity-50"></div>
      </div>
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center">
        <div className="text-white max-w-3xl">
          <h1 className="text-5xl font-bold mb-4">{title}</h1>
          {subtitle && (
            <p className="text-xl text-gray-100">{subtitle}</p>
          )}
        </div>
      </div>
    </section>
  );
};

export default PageHero;