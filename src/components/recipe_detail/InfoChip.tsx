import React from 'react';
import { LucideIcon } from 'lucide-react';

interface InfoChipProps {
  label: string;
  icon: LucideIcon;
}

export const InfoChip: React.FC<InfoChipProps> = ({ label, icon: Icon }) => {
  if (!label) return null;

  return (
    <div className="inline-flex items-center rounded-full bg-[#FF5722]/10 px-3 py-1.5 border border-[#FF5722]/15">
      <Icon className="w-3.5 h-3.5 text-[#FF5722] shrink-0" />
      <span className="ml-1 text-xs font-semibold text-[#FF5722] whitespace-nowrap">
        {label}
      </span>
    </div>
  );
};
