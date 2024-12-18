import React from 'react';
import { motion } from 'framer-motion';
import Image from '../common/Image';

interface GalleryImage {
  src: string;
  alt: string;
  title: string;
}

interface ProgramGalleryProps {
  images: GalleryImage[];
}

const ProgramGallery: React.FC<ProgramGalleryProps> = ({ images }) => {
  return (
    <div className="py-12">
      <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Program Gallery</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {images.map((image, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            viewport={{ once: true }}
            className="group"
          >
            <div className="relative aspect-square rounded-xl overflow-hidden">
              <Image
                src={image.src}
                alt={image.alt}
                className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                <h3 className="text-white text-xl font-semibold">{image.title}</h3>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default ProgramGallery;
