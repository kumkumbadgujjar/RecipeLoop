import React from 'react';
import { Sparkles } from 'lucide-react';

interface FloatingAiButtonProps {
  onClick: () => void;
}

export const FloatingAiButton: React.FC<FloatingAiButtonProps> = ({ onClick }) => {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="Open RecipeLoop AI Assistant"
      title="RecipeLoop AI"
      className="fixed bottom-6 right-6 z-40 flex items-center justify-center w-14 h-14 rounded-full bg-gradient-to-tr from-[#E64A19] to-[#FF5722] text-white shadow-lg shadow-[#FF5722]/35 hover:shadow-xl hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer group focus:outline-hidden focus:ring-4 focus:ring-[#FF5722]/30"
    >
      <div className="relative flex items-center justify-center">
        <Sparkles className="w-6 h-6 transition-transform group-hover:rotate-12 duration-300" />
        <span className="absolute -top-1 -right-1 flex h-3 w-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3 w-3 bg-white"></span>
        </span>
      </div>
    </button>
  );
};
