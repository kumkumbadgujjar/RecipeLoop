import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatItemProps {
  label: string;
  value: string;
  icon: LucideIcon;
}

export const StatItem: React.FC<StatItemProps> = ({
  label,
  value,
  icon: Icon,
}) => {
  return (
    <div className="flex flex-col items-center text-center px-1">
      <Icon className="w-6 h-6 text-[#FF5722] mb-1" />
      <span className="text-base font-bold text-neutral-800 leading-tight">
        {value}
      </span>
      <span className="text-xs font-bold text-neutral-400 mt-0.5">
        {label}
      </span>
    </div>
  );
};
