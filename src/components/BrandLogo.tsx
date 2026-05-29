import React from 'react';
import { getBrandLogo } from '../brandLogos';
import torqbossLogo from '../assets/images/torqboss_logo_strada.png';

interface BrandLogoProps {
  vehicleName: string;
  brandLogoUrl?: string;
  className?: string;
}

export const BrandLogo = ({ vehicleName, brandLogoUrl, className }: BrandLogoProps) => {
  const logo = brandLogoUrl || getBrandLogo(vehicleName);

  if (!logo) {
    return (
      <div className={`flex items-center justify-center bg-gray-55/40 text-brand-primary rounded-lg border border-white/5 ${className}`}>
        <img src={torqbossLogo} alt="torqboss Logo" className="w-full h-full object-contain p-2" />
      </div>
    );
  }

  return (
    <img 
      src={logo} 
      alt="Logo da Marca" 
      className={`object-contain p-1 ${className}`}
      onError={(e) => {
        (e.target as HTMLImageElement).style.display = 'none';
      }}
    />
  );
};
