import React from 'react';

interface AppLogoProps {
  size?: number;
  rounded?: boolean;
  style?: React.CSSProperties;
  className?: string;
  showText?: boolean;
  textSize?: number;
  textColor?: string;
}

export const AppLogo: React.FC<AppLogoProps> = ({
  size = 32,
  rounded = true,
  style,
  className,
  showText = false,
  textSize = 18,
  textColor = 'var(--color-primary)'
}) => {
  return (
    <div
      className={className}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: `${Math.round(size * 0.25)}px`,
        ...style
      }}
    >
      <img
        src="/logo.png"
        alt="G1 Bites"
        style={{
          width: `${size}px`,
          height: `${size}px`,
          borderRadius: rounded ? `${Math.max(6, Math.round(size * 0.24))}px` : '0px',
          objectFit: 'cover',
          display: 'block',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)'
        }}
      />
      {showText && (
        <span
          style={{
            fontSize: `${textSize}px`,
            fontWeight: 900,
            color: textColor,
            letterSpacing: '-0.02em',
            lineHeight: 1
          }}
        >
          G1 Bites
        </span>
      )}
    </div>
  );
};
export default AppLogo;
