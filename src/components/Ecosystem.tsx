import React from 'react';

const Ecosystem: React.FC = () => {
  const brands = ['Apple Watch', 'Oura', 'Garmin', 'Fitbit', 'Whoop'];
  return (
    <div className="py-12 px-8 text-center">
      <div className="text-xs text-gray-400 mb-8">COMPATIBLE ECOSYSTEM</div>
      <div className="flex justify-center gap-12 text-2xl font-bold text-gray-500">
        {brands.map(brand => <span key={brand}>{brand}</span>)}
      </div>
    </div>
  );
};

export default Ecosystem;
