interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary';
  className?: string;
  type?: 'button' | 'submit' | 'reset';
  disabled?: boolean;
}

export function Button({ children, onClick, variant = 'primary', className = '', type = 'button', disabled = false }: ButtonProps) {
  const baseStyles = 'px-5 py-2.5 md:px-8 md:py-4 text-sm md:text-lg font-medium rounded-xl md:rounded-md transition-all duration-300 transform hover:scale-[1.03]';
  const variants = {
    primary: 'bg-white text-black hover:bg-gray-100',
    secondary: 'border-2 border-white text-white hover:bg-white hover:text-black'
  };

  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={`${baseStyles} ${variants[variant]} ${className} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      {children}
    </button>
  );
}
