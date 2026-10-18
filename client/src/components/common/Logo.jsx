import React from 'react';
import logoImg from '../../assets/logo.png';

const Logo = ({ size = 38, showText = true, textColor = 'text-white' }) => {
  const pixelSize = typeof size === 'number'
    ? size
    : size === 'sm'
    ? 30
    : size === 'md'
    ? 38
    : size === 'lg'
    ? 48
    : 38;

  return (
    <div className="flex items-center gap-3 select-none">
      <img
        src={logoImg}
        alt="Mini CRM Logo"
        className="rounded-[11px] object-cover shrink-0 shadow-[0_4px_14px_rgba(99,102,241,0.35)] transition-transform hover:scale-105"
        style={{ width: `${pixelSize}px`, height: `${pixelSize}px` }}
      />
      {showText && (
        <span className={`font-bold text-[1.22rem] tracking-[-0.3px] ${textColor}`}>
          Mini CRM
        </span>
      )}
    </div>
  );
};

export default Logo;
