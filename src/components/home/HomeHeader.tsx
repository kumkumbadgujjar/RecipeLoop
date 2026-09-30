import React from 'react';
import { Utensils } from 'lucide-react';

export const HomeHeader: React.FC = () => {
  return (
    <div className="flex items-center w-full rounded-[20px] bg-[#FF5722]/10 p-4 border border-[#FF5722]/15">
      <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-[#FF5722] text-white shrink-0 shadow-xs">
        <Utensils className="w-6 h-6" />
      </div>
      <div className="ml-4 flex flex-col justify-center">
        <h2 className="text-base font-bold text-neutral-800 leading-tight">
          Hello Chef!
        </h2>
        <p className="text-sm text-neutral-500 mt-0.5">
          Find something delicious to cook
        </p>
      </div>
    </div>
  );
};
