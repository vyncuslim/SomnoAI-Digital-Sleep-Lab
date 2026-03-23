import React from 'react';

interface TextObfuscatorProps {
  text: string;
  className?: string;
}

/**
 * TextObfuscator implements Method 19 (Character splitting) and Method 20 (Pseudo-elements)
 * from the content protection list. It renders text as a series of spans to make
 * simple DOM-based scraping harder.
 */
export const TextObfuscator: React.FC<TextObfuscatorProps> = ({ text, className = '' }) => {
  // Split text into characters
  const chars = text.split('');

  return (
    <span className={`inline-flex flex-wrap ${className}`} aria-label={text}>
      {chars.map((char, index) => (
        <span 
          key={index} 
          className="inline-block"
          style={{ 
            userSelect: 'none',
            pointerEvents: 'none'
          }}
        >
          {char === ' ' ? '\u00A0' : char}
        </span>
      ))}
    </span>
  );
};
