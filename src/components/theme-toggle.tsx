import { Moon, Sun, Monitor, Palette } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useTheme } from '@/contexts/theme-context'

export function ThemeToggle() {
  const { setTheme, palette, setPalette } = useTheme()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon" className="relative">
          <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => setTheme('light')}>
          <Sun className="mr-2 h-4 w-4" />
          <span>Light</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme('dark')}>
          <Moon className="mr-2 h-4 w-4" />
          <span>Dark</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme('system')}>
          <Monitor className="mr-2 h-4 w-4" />
          <span>System</span>
        </DropdownMenuItem>
        <div className="h-px bg-border my-1" />
        <DropdownMenuItem onClick={() => setPalette('default')}>
          <Palette className="mr-2 h-4 w-4" />
          <span>Default</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setPalette('orange')}>
          <Palette className="mr-2 h-4 w-4 text-orange-500" />
          <span>Orange</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setPalette('yellow')}>
          <Palette className="mr-2 h-4 w-4 text-yellow-500" />
          <span>Yellow</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setPalette('violet')}>
          <Palette className="mr-2 h-4 w-4 text-violet-500" />
          <span>Violet</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setPalette('green')}>
          <Palette className="mr-2 h-4 w-4 text-green-500" />
          <span>Green</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setPalette('red')}>
          <Palette className="mr-2 h-4 w-4 text-red-500" />
          <span>Red</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setPalette('blue')}>
          <Palette className="mr-2 h-4 w-4 text-blue-500" />
          <span>Blue</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
