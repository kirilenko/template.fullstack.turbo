import type { ComponentProps } from 'react'

import { cn } from '../lib/cn'

function Select({
  className,
  onValueChange,
  onChange,
  ...props
}: ComponentProps<'select'> & { onValueChange?: (value: string) => void }) {
  return (
    <div className="relative w-fit">
      <select
        data-slot="select"
        onChange={(e) => {
          onChange?.(e)
          onValueChange?.(e.target.value)
        }}
        className={cn(
          'flex h-9 w-full appearance-none items-center rounded-md border border-input bg-transparent px-3 pr-8 py-2 text-sm whitespace-nowrap shadow-xs outline-none transition-[color,box-shadow] focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-input/30',
          className,
        )}
        {...props}
      />
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 opacity-50"
        aria-hidden="true"
      >
        <path d="m6 9 6 6 6-6" />
      </svg>
    </div>
  )
}

function SelectOption({ ...props }: ComponentProps<'option'>) {
  return <option {...props} />
}

function SelectGroup({ ...props }: ComponentProps<'optgroup'>) {
  return <optgroup {...props} />
}

export { Select, SelectOption, SelectGroup }
