'use client';

import { forwardRef } from 'react';
import { cn } from '@/lib/utils';

type Variant = 'primary' | 'ghost' | 'outline';
type Size = 'sm' | 'md' | 'lg';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
}

const variants: Record<Variant, string> = {
  primary:
    'bg-brass text-canvas hover:bg-brass-soft shadow-lg shadow-brass/20 font-medium',
  ghost: 'text-ink-soft hover:text-ink hover:bg-ink/5',
  outline:
    'border border-brass/40 text-brass hover:border-brass hover:bg-brass/10',
};

const sizes: Record<Size, string> = {
  sm: 'px-4 py-2 text-sm rounded-full',
  md: 'px-6 py-3 text-sm rounded-full',
  lg: 'px-8 py-4 text-base rounded-full',
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', ...props }, ref) => (
    <button
      ref={ref}
      className={cn(
        'inline-flex items-center justify-center gap-2 transition-all duration-300 ease-sensory disabled:cursor-not-allowed disabled:opacity-50',
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    />
  )
);
Button.displayName = 'Button';
