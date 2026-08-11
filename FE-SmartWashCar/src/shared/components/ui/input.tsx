import * as React from 'react'
import { cn } from '@/shared/lib/utils'

function Input({ className, type, ...props }: React.ComponentProps<'input'>) {
  return (
    <input
      data-slot="input"
      type={type}
      className={cn(
        'h-12 w-full rounded-lg border border-outline-variant bg-surface px-3 text-base leading-6 text-on-surface outline-none transition-[border-color,box-shadow]',
        'placeholder:text-on-surface-variant focus:border-primary focus:ring-2 focus:ring-primary/15',
        'disabled:cursor-not-allowed disabled:opacity-50',
        className,
      )}
      {...props}
    />
  )
}

export { Input }
