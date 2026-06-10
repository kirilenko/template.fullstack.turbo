import { type ComponentProps,createContext, useContext, useState } from 'react'

import { cn } from '../lib/cn'

type TabsCtx = { value: string; onValueChange: (value: string) => void }

const TabsContext = createContext<TabsCtx>({ value: '', onValueChange: () => {} })

function Tabs({
  value,
  defaultValue = '',
  onValueChange,
  className,
  children,
  ...props
}: ComponentProps<'div'> & {
  value?: string
  defaultValue?: string
  onValueChange?: (value: string) => void
}) {
  const [internal, setInternal] = useState(defaultValue)
  const controlled = value !== undefined
  const current = controlled ? value : internal

  return (
    <TabsContext.Provider
      value={{
        value: current,
        onValueChange: (v) => {
          if (!controlled) setInternal(v)
          onValueChange?.(v)
        },
      }}
    >
      <div data-slot="tabs" className={cn('flex flex-col gap-2', className)} {...props}>
        {children}
      </div>
    </TabsContext.Provider>
  )
}

function TabsList({ className, ...props }: ComponentProps<'div'>) {
  return (
    <div
      data-slot="tabs-list"
      role="tablist"
      className={cn(
        'inline-flex h-9 w-fit items-center justify-center rounded-lg bg-muted p-1 text-muted-foreground',
        className,
      )}
      {...props}
    />
  )
}

function TabsTrigger({
  value,
  className,
  children,
  ...props
}: ComponentProps<'button'> & { value: string }) {
  const { value: current, onValueChange } = useContext(TabsContext)
  const isActive = current === value

  return (
    <button
      data-slot="tabs-trigger"
      role="tab"
      type="button"
      aria-selected={isActive}
      data-state={isActive ? 'active' : 'inactive'}
      onClick={() => onValueChange(value)}
      className={cn(
        'inline-flex items-center justify-center gap-1.5 rounded-md px-2.5 py-1 text-sm font-medium whitespace-nowrap transition-[color,box-shadow] focus-visible:outline-1 focus-visible:outline-ring disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm',
        className,
      )}
      {...props}
    >
      {children}
    </button>
  )
}

function TabsContent({
  value,
  className,
  children,
  ...props
}: ComponentProps<'div'> & { value: string }) {
  const { value: current } = useContext(TabsContext)
  if (current !== value) return null

  return (
    <div
      data-slot="tabs-content"
      role="tabpanel"
      className={cn('flex-1 outline-none', className)}
      {...props}
    >
      {children}
    </div>
  )
}

export { Tabs, TabsList, TabsTrigger, TabsContent }
