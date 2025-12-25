import React from 'react';

interface EditButtonProps {
  onClick: () => void;
}

export const EditButton: React.FC<EditButtonProps> = ({ onClick }) => {
  return (
    <div className="w-full flex justify-end mb-2">
      <button 
        onClick={onClick}
        className="flex items-center gap-2 px-4 py-1.5 rounded-lg border border-primary/50 bg-black/30 text-primary hover:bg-black/50 transition-colors text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/50 backdrop-blur-sm"
      >
        <span>ویرایش اطلاعات</span>
        <i className="fas fa-pen text-xs"></i>
      </button>
    </div>
  );
};