import React from 'react';

interface AccessibleImageProps {
  /**
   * The source URL of the image
   */
  src: string;
  
  /**
   * Alternative text for the image.
   * - Should be descriptive for informative images
   * - Should be empty string for decorative images
   */
  alt: string;
  
  /**
   * Whether the image is decorative (not meaningful to the content)
   * If true, alt will be ignored and set to empty string, and role="presentation" will be added
   */
  decorative?: boolean;
  
  /**
   * ID of an element that contains an extended description of the image
   */
  describedBy?: string;
  
  /**
   * Whether to lazy load the image
   */
  lazy?: boolean;
  
  /**
   * Optional caption for the image
   */
  caption?: string;
  
  /**
   * Optional CSS class name
   */
  className?: string;
  
  /**
   * Optional width of the image
   */
  width?: number | string;
  
  /**
   * Optional height of the image
   */
  height?: number | string;
  
  /**
   * Optional srcset for responsive images
   * Format: "url1 width1w, url2 width2w, ..."
   */
  srcSet?: string;
  
  /**
   * Optional sizes attribute for responsive images
   * Format: "(max-width: 600px) 480px, 800px"
   */
  sizes?: string;
  
  /**
   * Optional onClick handler
   */
  onClick?: (event: React.MouseEvent<HTMLImageElement>) => void;
}

/**
 * AccessibleImage component that handles various accessibility requirements
 * 
 * Features:
 * - Proper alt text handling for both informative and decorative images
 * - Support for extended descriptions
 * - Lazy loading
 * - Figure/figcaption for images with captions
 * - Responsive image support with srcSet and sizes
 */
const AccessibleImage: React.FC<AccessibleImageProps> = ({
  src,
  alt,
  decorative = false,
  describedBy,
  lazy = true,
  caption,
  className = '',
  width,
  height,
  srcSet,
  sizes,
  onClick,
}) => {
  // Determine the appropriate alt text and role
  const imgAlt = decorative ? '' : alt;
  const imgRole = decorative ? 'presentation' : undefined;
  
  // Create the image element with appropriate attributes
  const imgElement = (
    <img
      src={src}
      alt={imgAlt}
      role={imgRole}
      className={className}
      width={width}
      height={height}
      loading={lazy ? 'lazy' : undefined}
      srcSet={srcSet}
      sizes={sizes}
      aria-describedby={describedBy}
      onClick={onClick}
    />
  );
  
  // If there's a caption, wrap in figure/figcaption
  if (caption) {
    return (
      <figure className={`accessible-figure ${className}`}>
        {imgElement}
        <figcaption>{caption}</figcaption>
      </figure>
    );
  }
  
  // Otherwise just return the image
  return imgElement;
};

export default AccessibleImage; 