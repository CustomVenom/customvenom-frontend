import { FC } from 'react';

interface VenomLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'light' | 'dark';
  className?: string;
}

export const VenomLogo: FC<VenomLogoProps> = ({
  size = 'md',
  variant = 'light',
  className = '',
}) => {
  const sizes = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16',
  };

  const colors = {
    light: {
      primary: '#10b981',
      secondary: '#059669',
      accent: '#047857',
    },
    dark: {
      primary: '#34d399',
      secondary: '#10b981',
      accent: '#059669',
    },
  };

  const c = colors[variant];

  return (
    <svg
      className={`${sizes[size]} ${className}`}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Snake head with fang */}
      <path
        d="M32 8C22 8 14 16 14 26C14 32 16 36 20 40L24 44V52C24 54 26 56 28 56H36C38 56 40 54 40 52V44L44 40C48 36 50 32 50 26C50 16 42 8 32 8Z"
        fill={c.primary}
      />

      {/* Eyes */}
      <circle cx="24" cy="22" r="3" fill="#0a0f0b" />
      <circle cx="40" cy="22" r="3" fill="#0a0f0b" />

      {/* Fang highlights */}
      <path d="M28 32L26 42H30L28 32Z" fill="white" opacity="0.9" />
      <path d="M36 32L34 42H38L36 32Z" fill="white" opacity="0.9" />

      {/* Scale pattern */}
      <circle cx="32" cy="16" r="2" fill={c.secondary} opacity="0.3" />
      <circle cx="26" cy="14" r="1.5" fill={c.accent} opacity="0.2" />
      <circle cx="38" cy="14" r="1.5" fill={c.accent} opacity="0.2" />
    </svg>
  );
};
