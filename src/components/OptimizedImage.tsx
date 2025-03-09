import React, { useState, useEffect } from 'react';
import AccessibleImage from './AccessibleImage';
import './OptimizedImage.css';

interface ImageFormat {
  width: number;
  format: 'webp' | 'jpg' | 'png' | 'avif';
}

interface OptimizedImageProps {
  /**
   * Base source URL of the image (without extension)
   */
  src: string;
  
  /**
   * Alternative text for the image
   */
  alt: string;
  
  /**
   * Whether the image is decorative
   */
  decorative?: boolean;
  
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
   * Available image widths for responsive images
   * Default: [480, 768, 1024, 1280]
   */
  availableWidths?: number[];
  
  /**
   * Available image formats in order of preference
   * Default: ['webp', 'jpg']
   */
  availableFormats?: ('webp' | 'jpg' | 'png' | 'avif')[];
  
  /**
   * Sizes attribute for responsive images
   * Default: '(max-width: 768px) 100vw, 768px'
   */
  sizes?: string;
  
  /**
   * Whether to blur the image while loading
   */
  blurEffect?: boolean;
  
  /**
   * Whether to lazy load the image
   */
  lazy?: boolean;
  
  /**
   * Optional onClick handler
   */
  onClick?: (event: React.MouseEvent<HTMLImageElement>) => void;
}

/**
 * OptimizedImage component that implements performance best practices
 * 
 * Features:
 * - Responsive images with multiple resolutions
 * - Modern image formats with fallbacks
 * - Lazy loading
 * - Blur-up loading effect
 * - Accessibility features via AccessibleImage
 */
const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src,
  alt,
  decorative = false,
  caption,
  className = '',
  width,
  height,
  availableWidths = [480, 768, 1024, 1280],
  availableFormats = ['webp', 'jpg'],
  sizes = '(max-width: 768px) 100vw, 768px',
  blurEffect = true,
  lazy = true,
  onClick,
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [supportsWebP, setSupportsWebP] = useState(false);
  const [supportsAVIF, setSupportsAVIF] = useState(false);
  
  // Check for WebP and AVIF support
  useEffect(() => {
    // Check WebP support
    const checkWebP = async () => {
      const webpSupported = await testWebP();
      setSupportsWebP(webpSupported);
    };
    
    // Check AVIF support
    const checkAVIF = async () => {
      const avifSupported = await testAVIF();
      setSupportsAVIF(avifSupported);
    };
    
    checkWebP();
    checkAVIF();
  }, []);
  
  // Test for WebP support
  const testWebP = () => {
    return new Promise<boolean>(resolve => {
      const webP = new Image();
      webP.onload = () => resolve(true);
      webP.onerror = () => resolve(false);
      webP.src = 'data:image/webp;base64,UklGRhoAAABXRUJQVlA4TA0AAAAvAAAAEAcQERGIiP4HAA==';
    });
  };
  
  // Test for AVIF support
  const testAVIF = () => {
    return new Promise<boolean>(resolve => {
      const avif = new Image();
      avif.onload = () => resolve(true);
      avif.onerror = () => resolve(false);
      avif.src = 'data:image/avif;base64,AAAAIGZ0eXBhdmlmAAAAAGF2aWZtaWYxbWlhZk1BMUIAAADybWV0YQAAAAAAAAAoaGRscgAAAAAAAAAAcGljdAAAAAAAAAAAAAAAAGxpYmF2aWYAAAAADnBpdG0AAAAAAAEAAAAeaWxvYwAAAABEAAABAAEAAAABAAABGgAAAB0AAAAoaWluZgAAAAAAAQAAABppbmZlAgAAAAABAABhdjAxQ29sb3IAAAAAamlwcnAAAABLaXBjbwAAABRpc3BlAAAAAAAAAAIAAAACAAAAEHBpeGkAAAAAAwgICAAAAAxhdjFDgQ0MAAAAABNjb2xybmNseAACAAIAAYAAAAAXaXBtYQAAAAAAAAABAAEEAQKDBAAAACVtZGF0EgAKCBgANogQEAwgMg8f8D///8WfhwB8+ErK42A=';
    });
  };
  
  // Generate srcSet based on available widths and formats
  const generateSrcSet = () => {
    // Determine supported formats
    const formats: ('webp' | 'jpg' | 'png' | 'avif')[] = [];
    
    // Add formats in order of preference based on browser support
    for (const format of availableFormats) {
      if (format === 'webp' && !supportsWebP) continue;
      if (format === 'avif' && !supportsAVIF) continue;
      formats.push(format);
    }
    
    // Ensure we have at least one format
    if (formats.length === 0) {
      formats.push('jpg');
    }
    
    // Generate srcSet for each format
    const srcSetEntries: string[] = [];
    
    for (const width of availableWidths) {
      const format = formats[0]; // Use the best supported format
      srcSetEntries.push(`${src}-${width}.${format} ${width}w`);
    }
    
    return srcSetEntries.join(', ');
  };
  
  // Handle image load
  const handleImageLoad = () => {
    setIsLoaded(true);
  };
  
  // Determine container class
  const containerClass = `optimized-image-container ${blurEffect ? 'blur-effect' : ''} ${isLoaded ? 'loaded' : 'loading'} ${className}`;
  
  return (
    <div className={containerClass}>
      <AccessibleImage
        src={`${src}.${supportsWebP ? 'webp' : 'jpg'}`}
        alt={alt}
        decorative={decorative}
        caption={caption}
        width={width}
        height={height}
        srcSet={generateSrcSet()}
        sizes={sizes}
        lazy={lazy}
        onClick={onClick}
        className="optimized-image"
        onLoad={handleImageLoad}
      />
      {blurEffect && !isLoaded && (
        <div className="image-placeholder" aria-hidden="true"></div>
      )}
    </div>
  );
};

export default OptimizedImage; 