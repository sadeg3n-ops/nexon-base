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
    primary: 'bg-[#0a0a0b]/80 text-white backdrop-blur-xl border border-white/10 hover:border-ai-purple/50 shadow-[0_0_20px_-10px_rgba(255,255,255,0.1)] hover:shadow-[0_0_30px_-5px_rgba(124,58,237,0.4)]',
    secondary: 'border border-white/10 text-white hover:bg-white/5 hover:text-white'
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
