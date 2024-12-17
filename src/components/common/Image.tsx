import React, { useState } from 'react';

interface ImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  fallbackSrc?: string;
}

const Image: React.FC<ImageProps> = ({ 
  src, 
  alt = '', 
  fallbackSrc = '/images/placeholder.jpg',
  className = '',
  ...props 
}) => {
  const [imgSrc, setImgSrc] = useState(src);
  const [hasError, setHasError] = useState(false);

  const handleError = () => {
    if (!hasError) {
      setImgSrc(fallbackSrc);
      setHasError(true);
    }
  };

  return (
    <img
      src={imgSrc}
      alt={alt}
      onError={handleError}
      className={`object-cover ${className}`}
      {...props}
    />
  );
};

export default Image;
