import React, { useState } from 'react';
import { Car } from 'lucide-react';

interface VehicleImageProps {
  src?: string;
  alt: string;
  className?: string;
}

export const VehicleImage: React.FC<VehicleImageProps> = ({ src, alt, className = '' }) => {
  const [error, setError] = useState(false);
  
  if (!src || error) {
    return (
      <div className={`${className} bg-gray-100 flex items-center justify-center text-gray-400`}>
        <Car size={className.includes('w-16') ? 32 : 120} />
      </div>
    );
  }

  return (
    <img 
      src={src} 
      alt={alt} 
      className={`${className} w-full h-full object-cover block`} 
      referrerPolicy="no-referrer" 
      onError={() => setError(true)}
    />
  );
};
