import { useState, type ButtonHTMLAttributes, type MouseEvent, type ReactNode } from 'react';

interface RippleInstance {
  id: number;
  x: number;
  y: number;
}

interface RippleButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost';
  children: ReactNode;
}

export function RippleButton({
  variant = 'primary',
  className = '',
  children,
  onClick,
  disabled,
  type = 'button',
  ...rest
}: RippleButtonProps) {
  const [ripples, setRipples] = useState<RippleInstance[]>([]);

  function handleClick(e: MouseEvent<HTMLButtonElement>) {
    if (!disabled) {
      const rect = e.currentTarget.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const id = Date.now() + Math.random();
      setRipples((prev) => [...prev, { id, x, y }]);
      window.setTimeout(() => {
        setRipples((prev) => prev.filter((r) => r.id !== id));
      }, 650);
    }
    onClick?.(e);
  }

  const baseStyles =
    'relative overflow-hidden inline-flex items-center justify-center gap-2 rounded-full font-semibold whitespace-nowrap shrink-0 transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0B4F5C] focus-visible:ring-offset-2 focus-visible:ring-offset-[#FFFDF8] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer';

  const variantStyles = {
    primary: 'bg-[#6FD6B5] hover:bg-[#5CC4A4] text-[#0B4F5C] px-7 py-3.5 text-[15px]',
    secondary:
      'bg-transparent border-[1.5px] border-[#0B4F5C] text-[#0B4F5C] hover:bg-[#F6E9D2] px-6 py-3 text-[15px]',
    ghost: 'bg-transparent text-[#5B7480] hover:text-[#0B4F5C] hover:bg-[#F6E9D2]/60 px-4 py-2 text-sm',
  }[variant];

  return (
    <button
      type={type}
      disabled={disabled}
      onClick={handleClick}
      className={`${baseStyles} ${variantStyles} ${className}`}
      {...rest}
    >
      {ripples.map((r) => (
        <span
          key={r.id}
          aria-hidden="true"
          className="pointer-events-none absolute rounded-full bg-[#0B4F5C]/15 kenzo-ripple-ring"
          style={{ left: r.x, top: r.y, width: 120, height: 120 }}
        />
      ))}
      <span className="relative z-10 inline-flex items-center gap-2">{children}</span>
    </button>
  );
}
