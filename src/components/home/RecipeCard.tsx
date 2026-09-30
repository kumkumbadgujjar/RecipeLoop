import React, { useState } from 'react';
import { RecipeDTO } from '../../types/recipe';

interface RecipeCardProps {
  recipe: RecipeDTO;
  onClick: () => void;
}

export const RecipeCard: React.FC<RecipeCardProps> = ({ recipe, onClick }) => {
  const [imageError, setImageError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  return (
    <div
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick();
        }
      }}
      className="flex flex-col bg-white rounded-2xl border border-neutral-200/80 overflow-hidden cursor-pointer shadow-xs hover:shadow-md hover:border-[#FF5722]/30 active:scale-[0.98] transition-all text-left group"
    >
      <div className="relative w-full h-[140px] bg-neutral-100 flex items-center justify-center overflow-hidden">
        {!imageLoaded && !imageError && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-5 h-5 rounded-full border-2 border-[#FF5722]/30 border-t-[#FF5722] animate-spin" />
          </div>
        )}
        {imageError ? (
          <div className="text-3xl select-none" aria-hidden="true">
            🥗
          </div>
        ) : (
          <img
            src={recipe.image}
            alt={recipe.name}
            className={`w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 ${
              imageLoaded ? 'opacity-100' : 'opacity-0'
            }`}
            onLoad={() => setImageLoaded(true)}
            onError={() => {
              setImageError(true);
              setImageLoaded(true);
            }}
          />
        )}
      </div>

      <div className="p-3 flex flex-col justify-between flex-1">
        <h3
          className="text-base font-bold text-neutral-800 truncate leading-snug"
          title={recipe.name}
        >
          {recipe.name}
        </h3>

        <div className="mt-2 flex items-center justify-between gap-2">
          <span className="text-xs text-neutral-500 truncate flex-1 font-normal">
            {recipe.cuisine}
          </span>
          <span className="inline-block px-2 py-0.5 rounded-lg bg-[#FF5722]/10 text-[#FF5722] text-xs font-semibold shrink-0">
            {recipe.difficulty}
          </span>
        </div>
      </div>
    </div>
  );
};
