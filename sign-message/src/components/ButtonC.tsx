import React, { ReactNode } from 'react';

interface ButtonCProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  className: string;
}

const ButtonC: React.FC<ButtonCProps> = ({ children, className = '', ...attributes }) => {
  return (
    <button className={"py-2 px-4 rounded-md no-underline bg-btn-background hover:bg-btn-background-hover " + className} {...attributes}>
      {children}
    </button>
  );
};

export default ButtonC;