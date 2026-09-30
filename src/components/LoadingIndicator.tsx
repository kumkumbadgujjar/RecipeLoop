import React from 'react';

interface LoadingIndicatorProps {
  strokeWidth?: number;
}

export const LoadingIndicator: React.FC<LoadingIndicatorProps> = () => {
  return (
    <div className="flex items-center justify-center min-h-[300px] w-full p-8">
      <div className="relative w-10 h-10">
        <div className="w-10 h-10 rounded-full border-4 border-[#FF5722]/20 border-t-[#FF5722] animate-spin" />
      </div>
    </div>
  );
};
