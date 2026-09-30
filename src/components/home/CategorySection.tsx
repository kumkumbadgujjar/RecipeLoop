import React from 'react';
import { UtensilsCrossed } from 'lucide-react';
import { SectionHeader } from './SectionHeader';

interface CategorySectionProps {
  categories: string[];
  selected: string;
  onSelected: (category: string) => void;
}

export const CategorySection: React.FC<CategorySectionProps> = ({
  categories,
  selected,
  onSelected,
}) => {
  return (
    <div className="flex flex-col">
      <SectionHeader title="Categories" icon={UtensilsCrossed} />
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-2 mt-2 -mx-1 px-1">
        {categories.map((category) => {
          const isSelected = selected === category;
          return (
            <button
              key={category}
              type="button"
              onClick={() => onSelected(category)}
              className={`px-4 py-2 rounded-2xl text-sm transition-all whitespace-nowrap cursor-pointer select-none border ${
                isSelected
                  ? 'bg-[#FF5722] text-white font-semibold border-[#FF5722] shadow-xs'
                  : 'bg-white text-neutral-700 font-normal border-neutral-200/80 hover:bg-neutral-50 active:bg-neutral-100'
              }`}
            >
              {category}
            </button>
          );
        })}
      </div>
    </div>
  );
};
