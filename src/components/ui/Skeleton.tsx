import React from 'react';

interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'circular' | 'rectangular';
}

export const Skeleton: React.FC<SkeletonProps> = ({ 
  className = '', 
  variant = 'rectangular' 
}) => {
  const baseClasses = 'animate-pulse bg-slate-800/50';
  
  const variantClasses = {
    text: 'h-4 w-full rounded',
    circular: 'rounded-full',
    rectangular: 'rounded-xl',
  };

  return (
    <div 
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
      aria-hidden="true"
    />
  );
};

export const ProfileSkeleton = () => (
  <div className="max-w-4xl mx-auto px-4 py-12 space-y-8">
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div className="space-y-2">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-4 w-64" />
      </div>
      <Skeleton className="h-12 w-32" />
    </div>

    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2 space-y-8">
        <div className="bg-slate-900/40 border border-white/5 rounded-[2.5rem] p-8">
          <Skeleton className="h-6 w-40 mb-8" />
          <div className="flex flex-col md:flex-row gap-8">
            <Skeleton variant="circular" className="w-32 h-32 flex-shrink-0" />
            <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="space-y-2">
                  <Skeleton className="h-3 w-20" />
                  <Skeleton className="h-6 w-full" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      <div className="space-y-8">
        {[1, 2].map((i) => (
          <div key={i} className="bg-slate-900/40 border border-white/5 rounded-[2.5rem] p-8 space-y-6">
            <Skeleton className="h-6 w-32" />
            <div className="space-y-4">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-8 w-full" />
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

export const DashboardSkeleton = () => (
  <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
    <div className="flex justify-between items-end">
      <div className="space-y-2">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-4 w-48" />
      </div>
      <Skeleton className="h-12 w-32" />
    </div>

    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2 space-y-8">
        <div className="bg-slate-900/40 border border-white/5 rounded-[2.5rem] p-8">
          <Skeleton className="h-8 w-48 mb-8" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-3 w-24" />
                <Skeleton className="h-12 w-full" />
              </div>
            ))}
          </div>
          <Skeleton className="h-14 w-full mt-8" />
        </div>
      </div>
      <div className="space-y-8">
        <div className="bg-slate-900/40 border border-white/5 rounded-[2.5rem] p-8">
          <Skeleton className="h-8 w-40 mb-6" />
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-4 p-4 bg-white/5 rounded-2xl">
                <Skeleton variant="circular" className="w-10 h-10" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-24" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  </div>
);

export const PersonalChatSkeleton = () => (
  <div className="max-w-4xl mx-auto h-[calc(100vh-12rem)] flex flex-col space-y-4 p-4">
    <div className="flex items-center justify-between mb-4">
      <div className="space-y-2">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-32" />
      </div>
      <Skeleton className="h-10 w-10 rounded-full" />
    </div>
    
    <div className="flex-1 space-y-6 overflow-hidden">
      {[1, 2, 3].map((i) => (
        <div key={i} className={`flex ${i % 2 === 0 ? 'justify-end' : 'justify-start'}`}>
          <div className={`flex gap-3 max-w-[80%] ${i % 2 === 0 ? 'flex-row-reverse' : 'flex-row'}`}>
            <Skeleton variant="circular" className="w-8 h-8 flex-shrink-0" />
            <div className="space-y-2">
              <Skeleton className={`h-12 w-48 rounded-2xl ${i % 2 === 0 ? 'bg-indigo-500/20' : 'bg-white/5'}`} />
              <Skeleton className="h-3 w-20" />
            </div>
          </div>
        </div>
      ))}
    </div>

    <div className="pt-4">
      <div className="bg-slate-900/40 border border-white/5 rounded-2xl p-4 flex gap-4">
        <Skeleton className="h-10 flex-1" />
        <Skeleton className="h-10 w-10 rounded-xl" />
        <Skeleton className="h-10 w-10 rounded-xl" />
      </div>
    </div>
  </div>
);
