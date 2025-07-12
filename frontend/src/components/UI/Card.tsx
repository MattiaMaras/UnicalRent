import React from 'react';
import { cn } from '../../../../../../../../Downloads/project/src/utils/cn';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  interactive?: boolean;
  gradient?: boolean;
  onClick?: () => void;
}

export const Card: React.FC<CardProps> = ({ 
  children, 
  className, 
  interactive = false, 
  gradient = false,
  onClick 
}) => {
  return (
    <div 
      className={cn(
        'card animate-fade-in',
        interactive && 'card-interactive',
        gradient && 'bg-gradient-to-br from-white to-primary-50',
        className
      )}
      onClick={onClick}
    >
      {children}
    </div>
  );
};

export const CardHeader: React.FC<{ children: React.ReactNode; className?: string }> = ({ 
  children, 
  className 
}) => (
  <div className={cn('p-6 border-b border-gray-100', className)}>
    {children}
  </div>
);

export const CardContent: React.FC<{ children: React.ReactNode; className?: string }> = ({ 
  children, 
  className 
}) => (
  <div className={cn('p-6', className)}>
    {children}
  </div>
);

export const CardFooter: React.FC<{ children: React.ReactNode; className?: string }> = ({ 
  children, 
  className 
}) => (
  <div className={cn('p-6 border-t border-gray-100 bg-gray-50/50', className)}>
    {children}
  </div>
);