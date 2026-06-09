import {
  createContext,
  useContext,
  useRef,
  useState,
  useEffect,
  isValidElement,
  type ReactNode,
  type ComponentProps,
  type RefObject,
} from 'react'
import { createPortal } from 'react-dom'

import { cn } from '../lib/cn'

type DropdownMenuCtx = {
  open: boolean
  setOpen: (open: boolean | ((prev: boolean) => boolean)) => void
  triggerRef: RefObject<HTMLElement | null>
}

const DropdownMenuContext = createContext<DropdownMenuCtx>({
  open: false,
  setOpen: () => {},
  triggerRef: { current: null },
})

function DropdownMenu({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false)
  const triggerRef = useRef<HTMLElement | null>(null)
  return (
    <DropdownMenuContext.Provider value={{ open, setOpen, triggerRef }}>
      {children}
    </DropdownMenuContext.Provider>
  )
}

function DropdownMenuTrigger({
  children,
  asChild,
  ...props
}: {
  children: ReactNode
  asChild?: boolean
} & ComponentProps<'button'>) {
  const { open, setOpen, triggerRef } = useContext(DropdownMenuContext)
  const handleClick = () => setOpen((v) => !v)

  if (asChild && isValidElement(children)) {
    return (
      <span
        ref={triggerRef as RefObject<HTMLSpanElement>}
        onClick={handleClick}
        style={{ display: 'inline-flex' }}
        aria-expanded={open}
        aria-haspopup="menu"
      >
        {children}
      </span>
    )
  }

  return (
    <button
      ref={triggerRef as RefObject<HTMLButtonElement>}
      onClick={handleClick}
      aria-expanded={open}
      aria-haspopup="menu"
      {...props}
    >
      {children}
    </button>
  )
}

function DropdownMenuContent({
  children,
  align = 'center',
  sideOffset = 4,
  className,
  style,
  ...props
}: {
  children: ReactNode
  align?: 'start' | 'center' | 'end'
  sideOffset?: number
} & ComponentProps<'div'>) {
  const { open, setOpen, triggerRef } = useContext(DropdownMenuContext)
  const contentRef = useRef<HTMLDivElement>(null)
  const [pos, setPos] = useState({ top: 0, left: 0, right: 0 })

  useEffect(() => {
    if (!open || !triggerRef.current) return
    const rect = triggerRef.current.getBoundingClientRect()
    setPos({
      top: rect.bottom + sideOffset,
      left: rect.left,
      right: window.innerWidth - rect.right,
    })
  }, [open, sideOffset, triggerRef])

  useEffect(() => {
    if (!open) return
    const onPointerDown = (e: PointerEvent) => {
      if (
        !contentRef.current?.contains(e.target as Node) &&
        !triggerRef.current?.contains(e.target as Node)
      ) {
        setOpen(false)
      }
    }
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('pointerdown', onPointerDown)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('pointerdown', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [open, setOpen, triggerRef])

  if (!open) return null

  const posStyle: React.CSSProperties = {
    position: 'fixed',
    top: pos.top,
    zIndex: 50,
    ...(align === 'end'
      ? { right: pos.right }
      : align === 'start'
        ? { left: pos.left }
        : { left: pos.left }),
  }

  return createPortal(
    <div
      ref={contentRef}
      role="menu"
      data-slot="dropdown-menu-content"
      style={{ ...posStyle, ...style }}
      className={cn(
        'min-w-[8rem] overflow-hidden rounded-md border bg-popover text-popover-foreground shadow-md',
        className,
      )}
      {...props}
    >
      {children}
    </div>,
    document.body,
  )
}

function DropdownMenuPortal({ children }: { children: ReactNode }) {
  return <>{children}</>
}

function DropdownMenuGroup({ className, ...props }: ComponentProps<'div'>) {
  return <div role="group" data-slot="dropdown-menu-group" className={cn('', className)} {...props} />
}

function DropdownMenuItem({
  className,
  style,
  onClick,
  children,
  inset,
  ...props
}: ComponentProps<'div'> & { inset?: boolean }) {
  const { setOpen } = useContext(DropdownMenuContext)

  const handleSelect = (e: React.MouseEvent<HTMLDivElement>) => {
    onClick?.(e)
    setOpen(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      onClick?.(e as unknown as React.MouseEvent<HTMLDivElement>)
      setOpen(false)
    }
  }

  return (
    <div
      role="menuitem"
      tabIndex={0}
      data-slot="dropdown-menu-item"
      className={cn(
        'relative flex cursor-pointer select-none items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none transition-colors hover:bg-accent hover:text-accent-foreground',
        inset && 'pl-8',
        className,
      )}
      style={style}
      onClick={handleSelect}
      onKeyDown={handleKeyDown}
      {...props}
    >
      {children}
    </div>
  )
}

function DropdownMenuLabel({
  className,
  inset,
  ...props
}: ComponentProps<'div'> & { inset?: boolean }) {
  return (
    <div
      data-slot="dropdown-menu-label"
      className={cn('px-2 py-1.5 text-sm font-medium', inset && 'pl-8', className)}
      {...props}
    />
  )
}

function DropdownMenuSeparator({ className, ...props }: ComponentProps<'hr'>) {
  return (
    <hr
      data-slot="dropdown-menu-separator"
      className={cn('-mx-1 my-1 border-border', className)}
      {...props}
    />
  )
}

function DropdownMenuShortcut({ className, ...props }: ComponentProps<'span'>) {
  return (
    <span
      data-slot="dropdown-menu-shortcut"
      className={cn('ml-auto text-xs tracking-widest text-muted-foreground', className)}
      {...props}
    />
  )
}

function DropdownMenuSub({ children }: { children: ReactNode }) {
  return <>{children}</>
}

function DropdownMenuSubTrigger({ className, children, ...props }: ComponentProps<'div'>) {
  return (
    <div
      className={cn('flex cursor-pointer items-center rounded-sm px-2 py-1.5 text-sm', className)}
      {...props}
    >
      {children}
    </div>
  )
}

function DropdownMenuSubContent({ className, ...props }: ComponentProps<'div'>) {
  return (
    <div
      className={cn('min-w-[8rem] rounded-md border bg-popover p-1 shadow-lg', className)}
      {...props}
    />
  )
}

function DropdownMenuCheckboxItem({
  className,
  children,
  ...props
}: ComponentProps<'div'> & { checked?: boolean }) {
  return (
    <div
      role="menuitemcheckbox"
      className={cn('relative flex cursor-pointer items-center rounded-sm py-1.5 pl-8 pr-2 text-sm', className)}
      {...props}
    >
      {children}
    </div>
  )
}

function DropdownMenuRadioGroup({ children }: { children: ReactNode }) {
  return <>{children}</>
}

function DropdownMenuRadioItem({ className, children, ...props }: ComponentProps<'div'>) {
  return (
    <div
      role="menuitemradio"
      className={cn('relative flex cursor-pointer items-center rounded-sm py-1.5 pl-8 pr-2 text-sm', className)}
      {...props}
    >
      {children}
    </div>
  )
}

export {
  DropdownMenu,
  DropdownMenuPortal,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuItem,
  DropdownMenuCheckboxItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
}
