import React from 'react';

interface ActionButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'accent';
  isLoading?: boolean;
  icon?: string;
}

export const ActionButton: React.FC<ActionButtonProps> = ({
  children,
  variant = 'primary',
  isLoading,
  icon,
  className = '',
  disabled,
  ...props
}) => {
  const baseStyles = "flex items-center justify-center gap-2 py-3 px-6 rounded-xl font-bold transition-all duration-200 transform active:scale-[0.98]";

  const variants = {
    primary: "bg-gradient-to-r from-primary-600 to-magenta-600 hover:from-primary-500 hover:to-magenta-500 text-white shadow-lg shadow-primary-900/20",
    secondary: "bg-white/5 hover:bg-white/10 text-white border border-white/10 backdrop-blur-sm",
    accent: "bg-gradient-to-r from-accent-500 to-orange-600 hover:from-accent-400 hover:to-orange-500 text-white shadow-lg shadow-orange-900/20",
  };

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${className} ${disabled || isLoading ? 'opacity-60 cursor-not-allowed grayscale-[0.5]' : ''}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <span className="material-symbols-rounded animate-spin text-xl">progress_activity</span>
      ) : icon ? (
        <span className="material-symbols-rounded text-xl">{icon}</span>
      ) : null}
      {children}
    </button>
  );
};