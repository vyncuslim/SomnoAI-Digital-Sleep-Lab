import React from 'react';

const TopBanner: React.FC = () => {
  const [isVisible, setIsVisible] = React.useState(true);

  if (!isVisible) return null;

  return (
    <div className="bg-purple-600 text-white text-xs py-2 text-center flex justify-center items-center relative">
      <span>● JOIN SOMNOAI DIGITAL SLEEP LAB EARLY ACCESS — LIMITED BETA ACCESS</span>
      <button onClick={() => setIsVisible(false)} className="absolute right-4 text-white hover:text-gray-200">✕</button>
    </div>
  );
};

export default TopBanner;
