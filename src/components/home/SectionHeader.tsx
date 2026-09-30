import React from 'react';
import { LucideIcon } from 'lucide-react';

interface SectionHeaderProps {
  title: string;
  icon: LucideIcon;
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({
  title,
  icon: Icon,
}) => {
  return (
    <div className="flex items-center">
      <Icon className="w-5 h-5 text-[#FF5722] shrink-0" />
      <span className="ml-2 text-base font-bold text-neutral-800">
        {title}
      </span>
    </div>
  );
};
