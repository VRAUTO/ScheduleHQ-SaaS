import React from 'react';

export const Button = ({ children, onClick, variant = 'default', className = '', ...props }) => {
  const baseClasses = 'px-6 py-3 rounded-lg font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 transform hover:scale-105';

  const variants = {
    default: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500 shadow-md hover:shadow-lg',
    secondary: 'bg-gray-600 text-white hover:bg-gray-700 focus:ring-gray-500 shadow-md hover:shadow-lg',
    outline: 'border-2 border-blue-600 text-blue-600 hover:bg-blue-50 focus:ring-blue-500 shadow-sm hover:shadow-md'
  };

  // If className contains background colors, don't use variant colors
  const useVariant = !className.includes('bg-');
  const variantClasses = useVariant ? variants[variant] : '';

  const classes = `${baseClasses} ${variantClasses} ${className}`;

  return (
    <button
      className={classes}
      onClick={onClick}
      {...props}
    >
      {children}
    </button>
  );
};
