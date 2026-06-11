'use client'

import { type FC } from 'react'
import { Moon, Sun } from 'lucide-react'

import {
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@packages/ui'

import { useTheme } from './theme.provider'

const THEMES = [
  { label: 'Светлая', value: 'light' },
  { label: 'Тёмная', value: 'dark' },
  { label: 'Системная', value: 'system' },
] as const

const ThemeSwitcher: FC = () => {
  const { setTheme, theme } = useTheme()

  const isDark =
    theme === 'dark' ||
    (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon" className="size-10">
          {isDark ? (
            <Moon className="h-[1.2rem] w-[1.2rem]" />
          ) : (
            <Sun className="h-[1.2rem] w-[1.2rem]" />
          )}
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="flex flex-col gap-1 p-2 min-w-[130px]"
        style={{ backgroundColor: 'var(--popover)' }}
      >
        {THEMES.map(({ label, value }) => (
          <DropdownMenuItem
            key={value}
            className={[
              'rounded-md px-3 py-2 text-sm font-medium transition-colors',
              theme === value
                ? 'bg-sidebar-accent text-sidebar-accent-foreground focus:bg-sidebar-accent focus:text-sidebar-accent-foreground'
                : 'focus:bg-sidebar-accent/50 focus:text-sidebar-accent-foreground',
            ].join(' ')}
            style={{ cursor: 'pointer' }}
            onClick={() => setTheme(value)}
          >
            {label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export { ThemeSwitcher }
