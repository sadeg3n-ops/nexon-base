interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary';
  className?: string;
  type?: 'button' | 'submit' | 'reset';
  disabled?: boolean;
}

export function Button({ children, onClick, variant = 'primary', className = '', type = 'button', disabled = false }: ButtonProps) {
  const baseStyles = 'px-5 py-2.5 md:px-8 md:py-4 text-sm md:text-base font-semibold tracking-wide font-display rounded-xl md:rounded-lg transition-all duration-300 transform active:scale-[0.98] disabled:pointer-events-none';
  const variants = {
    primary: 'bg-gradient-to-b from-[#121215]/90 to-[#070709]/95 text-white backdrop-blur-xl border border-white/10 hover:border-ai-purple/50 shadow-[0_4px_12px_rgba(0,0,0,0.5)] hover:shadow-[0_0_30px_-5px_rgba(124,58,237,0.45)] hover:scale-[1.025]',
    secondary: 'bg-white/[0.02] border border-white/10 text-white/90 hover:bg-white/[0.06] hover:border-white/20 hover:scale-[1.015]'
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
