import React from 'react';
import { BusinessHour } from '../types';

interface BusinessHoursProps {
  hours: BusinessHour[];
  isEditing: boolean;
  onUpdate: (index: number, field: keyof BusinessHour, value: string) => void;
}

export const BusinessHours: React.FC<BusinessHoursProps> = ({ hours, isEditing, onUpdate }) => {
  return (
    <div className="w-full flex flex-col items-center">
      <h3 className="text-primary font-bold text-lg mb-3">ساعات کاری</h3>
      <div className="w-full space-y-3 pb-6">
        {hours.map((item, index) => (
          <div 
            key={index}
            className={`w-full border border-primary/40 rounded-lg px-4 py-3 flex ${isEditing ? 'flex-col gap-2' : 'justify-between items-center'} bg-black/20 backdrop-blur-sm transition-colors`}
          >
            {isEditing ? (
              <>
                 <div className="flex items-center justify-between w-full gap-2">
                    <span className="text-primary text-xs w-16 text-right">عنوان:</span>
                    <input
                      type="text"
                      value={item.label}
                      onChange={(e) => onUpdate(index, 'label', e.target.value)}
                      className="flex-1 bg-white/10 border border-primary/50 rounded px-2 py-1 text-white text-sm focus:outline-none focus:ring-1 focus:ring-primary text-right"
                    />
                 </div>
                 <div className="flex items-center justify-between w-full gap-2">
                    <span className="text-primary text-xs w-16 text-right">ساعت:</span>
                    <input
                      type="text"
                      value={item.time}
                      onChange={(e) => onUpdate(index, 'time', e.target.value)}
                      className="flex-1 bg-white/10 border border-primary/50 rounded px-2 py-1 text-white text-sm focus:outline-none focus:ring-1 focus:ring-primary text-left ltr font-mono"
                    />
                 </div>
              </>
            ) : (
              <>
                <span className="font-mono text-white text-lg ltr">{item.time}</span>
                <span className="text-white font-medium">{item.label}</span>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};