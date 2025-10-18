import React from 'react';

export interface SkeletonProps {
  width?: string | number;
  height?: string | number;
  circle?: boolean;
  className?: string;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  width,
  height = '1rem',
  circle = false,
  className = '',
}) => {
  const style: React.CSSProperties = {
    width: width || '100%',
    height,
  };

  return (
    <div
      className={`animate-pulse bg-gray-200 ${circle ? 'rounded-full' : 'rounded'} ${className}`}
      style={style}
    />
  );
};

export const SkeletonText: React.FC<{ lines?: number }> = ({ lines = 3 }) => {
  return (
    <div className="space-y-2">
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton key={i} height="0.75rem" width={i === lines - 1 ? '80%' : '100%'} />
      ))}
    </div>
  );
};
