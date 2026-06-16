'use client';

import { Button } from '@/components/ui/Button';

export function PrintButton({
  children = 'Imprimir',
  className,
}: {
  children?: React.ReactNode;
  className?: string;
}) {
  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      className={className}
      onClick={() => window.print()}
    >
      {children}
    </Button>
  );
}
