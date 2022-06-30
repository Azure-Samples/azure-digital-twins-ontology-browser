import React, { useContext } from 'react';

export interface IHomeProps {
  className?: string;
}

export const Home: React.FC<IHomeProps> = ({ className }) => {
  return (
    <div className={`h-full ${className}`}>
     
    </div>
  );
}
