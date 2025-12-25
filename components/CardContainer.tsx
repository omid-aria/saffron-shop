import React, { ReactNode } from 'react';

interface CardContainerProps {
  children: ReactNode;
  className?: string;
}

export const CardContainer: React.FC<CardContainerProps> = ({ children, className = "" }) => {
  return (
    <div className={`w-full bg-[rgba(46,16,45,0.6)] backdrop-blur-md border border-primary/30 shadow-lg rounded-2xl p-5 mt-4 ${className}`}>
      {children}
    </div>
  );
};