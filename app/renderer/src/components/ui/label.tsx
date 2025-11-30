import * as React from 'react';
import { cn } from '@/lib/utils';

const Label = React.forwardRef<
  HTMLLabelElement,
  React.LabelHTMLAttributes<HTMLLabelElement> & {
    optional?: boolean;
  }
>(({ className, optional, ...props }, ref) => (
  <label
    ref={ref}
    className={cn('text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex items-center gap-2', className)}
    {...props}
  >
    {props.children}
    {optional && <span className="text-xs font-normal text-muted-foreground">(Optional)</span>}
  </label>
));
Label.displayName = 'Label';

export { Label };
