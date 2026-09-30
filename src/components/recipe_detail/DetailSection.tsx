import React from 'react';
import { LucideIcon } from 'lucide-react';

interface DetailSectionProps {
  title: string;
  icon: LucideIcon;
  children: React.ReactNode;
}

export const DetailSection: React.FC<DetailSectionProps> = ({
  title,
  icon: Icon,
  children,
}) => {
  return (
    <div className="w-full bg-white rounded-3xl border border-neutral-200/80 p-4 shadow-xs">
      <div className="flex items-center mb-3">
        <Icon className="w-5 h-5 text-[#FF5722] shrink-0" />
        <h3 className="ml-2 text-xl font-semibold text-neutral-800">
          {title}
        </h3>
      </div>
      <div>{children}</div>
    </div>
  );
};
