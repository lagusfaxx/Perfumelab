import { forwardRef } from 'react';
import { cn } from '@/lib/utils';

const baseInput =
  'w-full rounded-xl bg-canvas-soft border border-ink/10 px-4 py-3 text-ink placeholder:text-ink-muted focus:border-brass/60 focus:outline-none transition-colors';

export function Label({
  children,
  htmlFor,
  hint,
}: {
  children: React.ReactNode;
  htmlFor?: string;
  hint?: string;
}) {
  return (
    <label htmlFor={htmlFor} className="mb-1.5 block text-xs font-medium text-ink-soft">
      {children}
      {hint && <span className="ml-2 font-normal text-ink-muted">{hint}</span>}
    </label>
  );
}

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, error, ...props }, ref) => (
    <div>
      <input
        ref={ref}
        className={cn(baseInput, error && 'border-red-500/60', className)}
        {...props}
      />
      {error && <p className="mt-1 text-xs text-red-400">{error}</p>}
    </div>
  )
);
Input.displayName = 'Input';

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  error?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, error, children, ...props }, ref) => (
    <div>
      <select
        ref={ref}
        className={cn(baseInput, 'appearance-none', error && 'border-red-500/60', className)}
        {...props}
      >
        {children}
      </select>
      {error && <p className="mt-1 text-xs text-red-400">{error}</p>}
    </div>
  )
);
Select.displayName = 'Select';

export function Textarea({
  className,
  ...props
}: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea className={cn(baseInput, 'min-h-[88px] resize-y', className)} {...props} />;
}
