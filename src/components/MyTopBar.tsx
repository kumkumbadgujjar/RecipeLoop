import React from 'react';
import { ArrowLeft } from 'lucide-react';

interface MyTopBarProps {
  title: string;
  onBackClick: () => void;
}

export const MyTopBar: React.FC<MyTopBarProps> = ({ title, onBackClick }) => {
  return (
    <header className="sticky top-0 z-30 flex items-center h-14 px-4 bg-white border-b border-neutral-200/80 shadow-xs">
      <button
        type="button"
        onClick={onBackClick}
        aria-label="Back"
        className="p-2 -ml-2 rounded-full text-neutral-700 hover:bg-neutral-100 active:bg-neutral-200 transition cursor-pointer"
      >
        <ArrowLeft className="w-6 h-6" />
      </button>
      <h1 className="ml-3 text-lg font-bold text-neutral-800 tracking-tight">
        {title}
      </h1>
    </header>
  );
};
