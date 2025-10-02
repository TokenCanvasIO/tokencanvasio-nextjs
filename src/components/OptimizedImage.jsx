// src/components/OptimizedImage.jsx
import React from 'react';
import Image from 'next/image';

const OptimizedImage = ({ src, alt, className, width = 50, height = 50, ...props }) => {
  if (!src) {
    return null;
  }

  return (
    <Image
      src={src}
      alt={alt || ''}
      className={className}
      width={width}
      height={height}
      style={{ objectFit: 'contain' }}
      unoptimized={src.endsWith('.svg') || src.endsWith('.gif')}
      {...props}
    />
  );
};

export default OptimizedImage;