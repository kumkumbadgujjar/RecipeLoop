import React from 'react';
import { Search, X } from 'lucide-react';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  onClear: () => void;
  placeholder?: string;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  value,
  onChange,
  onClear,
  placeholder = 'Search recipes, ingredients, cuisines...',
}) => {
  return (
    <div className="relative w-full">
      <div className="relative flex items-center w-full h-12 bg-white rounded-full border border-neutral-200/90 px-4 shadow-xs focus-within:shadow-md focus-within:border-[#FF5722]/50 transition-all">
        <Search className="w-5 h-5 text-[#FF5722] shrink-0 mr-3" />
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full h-full bg-transparent text-neutral-800 placeholder-neutral-400 text-sm font-medium outline-hidden"
        />
        {value.length > 0 && (
          <button
            type="button"
            onClick={onClear}
            aria-label="Clear search"
            className="p-1 rounded-full text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
};
