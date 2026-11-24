import React, { useState } from 'react';

interface ProfilePicProps {
  /** Secure hosted URL (e.g. a Cloudinary secure_url). Omit for the fallback. */
  src?: string | null;
  /** Full name, used for the initials fallback and the image alt text. */
  name: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const SIZE_CLASSES = {
  sm: 'w-9 h-9 text-xs',
  md: 'w-12 h-12 text-base',
  lg: 'w-16 h-16 text-xl',
} as const;

function initialsOf(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return 'C';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

/**
 * Shared avatar / profile-picture display. Shows the hosted picture when
 * one exists and loads; otherwise falls back to the person's initials in
 * the brand navy/gold style. Never renders a broken image.
 */
export const ProfilePic: React.FC<ProfilePicProps> = ({
  src,
  name,
  size = 'sm',
  className = '',
}) => {
  const [failed, setFailed] = useState(false);
  const showImage = Boolean(src) && !failed;

  if (showImage) {
    return (
      <img
        src={src as string}
        alt={`${name} profile photo`}
        onError={() => setFailed(true)}
        className={`${SIZE_CLASSES[size]} rounded-full object-cover border border-brand-gold/40 shadow-xs shrink-0 ${className}`}
      />
    );
  }

  return (
    <span
      aria-hidden="true"
      title={name}
      className={`${SIZE_CLASSES[size]} rounded-full bg-brand-navy/10 text-brand-navy font-bold flex items-center justify-center shrink-0 ${className}`}
    >
      {initialsOf(name)}
    </span>
  );
};
