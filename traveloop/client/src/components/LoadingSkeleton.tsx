import React from 'react';

interface LoadingSkeletonProps {
  type?: 'card' | 'list' | 'text' | 'stat';
  count?: number;
}

export default function LoadingSkeleton({ type = 'card', count = 3 }: LoadingSkeletonProps) {
  if (type === 'stat') {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="card p-5">
            <div className="skeleton h-4 w-20 mb-3" />
            <div className="skeleton h-8 w-24" />
          </div>
        ))}
      </div>
    );
  }
  if (type === 'list') {
    return (
      <div className="space-y-3">
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="card p-4 flex items-center gap-4">
            <div className="skeleton w-12 h-12 rounded-lg flex-shrink-0" />
            <div className="flex-1 space-y-2">
              <div className="skeleton h-4 w-40" />
              <div className="skeleton h-3 w-24" />
            </div>
          </div>
        ))}
      </div>
    );
  }
  if (type === 'text') {
    return (
      <div className="space-y-2">
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className={`skeleton h-4 ${i % 3 === 2 ? 'w-3/4' : 'w-full'}`} />
        ))}
      </div>
    );
  }
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="card overflow-hidden">
          <div className="skeleton h-48 w-full" />
          <div className="p-4 space-y-3">
            <div className="skeleton h-5 w-3/4" />
            <div className="skeleton h-4 w-1/2" />
            <div className="flex gap-2">
              <div className="skeleton h-6 w-16 rounded-full" />
              <div className="skeleton h-6 w-20 rounded-full" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
