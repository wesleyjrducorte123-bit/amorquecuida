import { Heart } from 'lucide-react';

interface CtaButtonProps {
  onClick?: () => void;
  className?: string;
  label?: string;
}

export function CtaButton({ onClick, className = '', label = 'Doar agora' }: CtaButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center justify-center gap-2 rounded-full bg-rose-500 px-6 py-3 text-sm font-semibold text-white shadow-lg transition-transform hover:scale-105 hover:bg-rose-600 ${className}`}
    >
      <Heart className="h-4 w-4 fill-white" />
      {label}
    </button>
  );
}
