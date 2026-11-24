import React, { useState } from 'react';

export type ProfilePicSize = 'sm' | 'md' | 'lg';

interface ProfilePicProps {
  /** Photo URL (for example a Cloudinary URL). Null/undefined shows initials. */
  src?: string | null;
  /** Full name, used for the alt text and the initials fallback. */
  name?: string | null;
  size?: ProfilePicSize;
  shape?: 'circle' | 'square';
  className?: string;
}

const sizeClasses: Record<ProfilePicSize, string> = {
  sm: 'w-8 h-8 text-sm',
  md: 'w-20 h-20 sm:w-24 sm:h-24 text-3xl',
  lg: 'w-24 h-24 sm:w-28 sm:h-28 text-4xl',
};

function initialsFor(name?: string | null): string {
  const first = (name || '').trim().charAt(0);
  return first ? first.toUpperCase() : 'C';
}

/**
 * Client profile photo with an initials fallback.
 * Shows the photo when a URL is available and loads; otherwise shows the
 * client's initial on the brand navy tile — never a broken image icon.
 * The image is decorative identification, so the alt text names the owner
 * without exposing any identifier.
 */
export const ProfilePic: React.FC<ProfilePicProps> = ({
  src,
  name,
  size = 'md',
  shape = 'circle',
  className = '',
}) => {
  const [imgFailed, setImgFailed] = useState(false);
  const shapeClass = shape === 'square' ? 'rounded-2xl' : 'rounded-full';
  const classes = `${sizeClasses[size]} ${shapeClass} shrink-0 ${className}`.trim();

  if (src && !imgFailed) {
    return (
      <img
        src={src}
        alt={name ? `${name} — profile photo` : 'Profile photo'}
        onError={() => setImgFailed(true)}
        className={`${classes} object-cover border-2 border-brand-gold/40 shadow-sm bg-brand-navy`}
      />
    );
  }

  return (
    <div
      role="img"
      aria-label={name ? `${name} — profile photo` : 'Profile photo'}
      className={`${classes} bg-brand-navy text-brand-gold font-bold font-serif flex items-center justify-center shadow-sm border-2 border-brand-gold/40`}
    >
      {initialsFor(name)}
    </div>
  );
};
