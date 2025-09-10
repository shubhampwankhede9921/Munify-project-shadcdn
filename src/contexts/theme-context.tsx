import React, { createContext, useContext, useEffect, useState } from 'react'

type Theme = 'dark' | 'light' | 'system'
type Palette = 'default' | 'orange' | 'yellow' | 'violet' | 'green' | 'red' | 'blue'

type ThemeProviderProps = {
  children: React.ReactNode
  defaultTheme?: Theme
  storageKey?: string
  defaultPalette?: Palette
  paletteStorageKey?: string
}

type ThemeProviderState = {
  theme: Theme
  setTheme: (theme: Theme) => void
  palette: Palette
  setPalette: (palette: Palette) => void
}

const initialState: ThemeProviderState = {
  theme: 'system',
  setTheme: () => null,
  palette: 'default',
  setPalette: () => null,
}

const ThemeProviderContext = createContext<ThemeProviderState>(initialState)

export function ThemeProvider({
  children,
  defaultTheme = 'system',
  storageKey = 'munify-ui-theme',
  defaultPalette = 'default',
  paletteStorageKey = 'munify-ui-palette',
  ...props
}: ThemeProviderProps) {
  const [theme, setTheme] = useState<Theme>(
    () => (localStorage.getItem(storageKey) as Theme) || defaultTheme
  )
  const [palette, setPaletteState] = useState<Palette>(
    () => (localStorage.getItem(paletteStorageKey) as Palette) || defaultPalette
  )

  useEffect(() => {
    const root = window.document.documentElement
    root.classList.remove('light', 'dark')

    if (theme === 'system') {
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches
        ? 'dark'
        : 'light'
      root.classList.add(systemTheme)
      return
    }

    root.classList.add(theme)
  }, [theme])

  useEffect(() => {
    const root = window.document.documentElement
    root.classList.remove(
      'palette-default',
      'palette-orange',
      'palette-yellow',
      'palette-violet',
      'palette-green',
      'palette-red',
      'palette-blue'
    )
    root.classList.add(`palette-${palette}`)
  }, [palette])

  const value = {
    theme,
    setTheme: (next: Theme) => {
      localStorage.setItem(storageKey, next)
      setTheme(next)
    },
    palette,
    setPalette: (next: Palette) => {
      localStorage.setItem(paletteStorageKey, next)
      setPaletteState(next)
    },
  }

  return (
    <ThemeProviderContext.Provider {...props} value={value}>
      {children}
    </ThemeProviderContext.Provider>
  )
}

export const useTheme = () => {
  const context = useContext(ThemeProviderContext)
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}
