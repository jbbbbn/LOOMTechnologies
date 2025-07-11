import React, { useEffect, useState } from 'react';
import { useLocation } from 'wouter';

interface PageTransitionProps {
  children: React.ReactNode;
}

export function PageTransition({ children }: PageTransitionProps) {
  const [location] = useLocation();
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    setIsTransitioning(true);
    const timer = setTimeout(() => {
      setIsTransitioning(false);
    }, 300);
    return () => clearTimeout(timer);
  }, [location]);

  return (
    <div className={`
      transition-all duration-300 ease-in-out transform
      ${isTransitioning ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}
    `}>
      {children}
    </div>
  );
}