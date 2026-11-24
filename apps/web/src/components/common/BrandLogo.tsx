import React from 'react';
import { Link } from 'react-router-dom';

interface BrandLogoProps {
  variant?: 'header' | 'footer' | 'sidebar' | 'light' | 'hero' | 'compact';
  className?: string;
  linkToHome?: boolean;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({
  variant = 'header',
  className = '',
  linkToHome = true,
}) => {
  // Sizing and container background tailored to the horizontal brand lockup
  let imgClass = 'h-9 sm:h-10 w-auto max-w-[180px] sm:max-w-[220px] object-contain';
  let containerClass = 'bg-white px-3 py-1 rounded-xl shadow-xs border border-white/10 hover:border-brand-gold/30 transition-all';

  if (variant === 'sidebar') {
    imgClass = 'h-8 sm:h-9 w-auto max-w-[170px] object-contain';
    containerClass = 'bg-white px-2.5 py-1.5 rounded-lg shadow-xs border border-white/10';
  } else if (variant === 'footer') {
    imgClass = 'h-11 sm:h-14 w-auto max-w-[220px] sm:max-w-[260px] object-contain';
    containerClass = 'bg-white px-3.5 py-2 rounded-xl shadow-md border border-white/10';
  } else if (variant === 'hero') {
    imgClass = 'h-12 sm:h-16 w-auto max-w-[240px] sm:max-w-[300px] object-contain';
    containerClass = 'bg-white px-4 py-2.5 rounded-2xl shadow-xl border border-white/30';
  } else if (variant === 'light') {
    imgClass = 'h-10 sm:h-12 w-auto max-w-[220px] object-contain';
    containerClass = 'bg-transparent p-0';
  } else if (variant === 'compact') {
    imgClass = 'h-8 w-auto max-w-[140px] object-contain';
    containerClass = 'bg-white px-2 py-1 rounded-lg shadow-xs border border-white/20';
  }

  const content = (
    <div className={`inline-flex items-center group select-none ${className}`}>
      <div className={`${containerClass} flex items-center justify-center transition-all duration-300 group-hover:scale-[1.02]`}>
        <img
          src="/the-visa-gate-logo.png"
          alt="The Visa Gate"
          className={`${imgClass} select-none`}
          loading="eager"
        />
      </div>
    </div>
  );

  if (linkToHome) {
    return (
      <Link to="/" className="inline-block focus:outline-none">
        {content}
      </Link>
    );
  }

  return content;
};
