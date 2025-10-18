import React from 'react';

export interface TagProps {
  children: React.ReactNode;
  onClick?: () => void;
  active?: boolean;
  className?: string;
}

export const Tag: React.FC<TagProps> = ({
  children,
  onClick,
  active = false,
  className = '',
}) => {
  const isClickable = !!onClick;

  return (
    <span
      onClick={onClick}
      className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
        active
          ? 'bg-blue-100 text-blue-800'
          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
      } ${isClickable ? 'cursor-pointer' : ''} ${className}`}
    >
      {children}
    </span>
  );
};
