import { Moon, Sun } from 'lucide-react'
import { useTheme } from '../../pages/dashboard/Layout'

export function ThemeToggle() {
  const { dark, setDark } = useTheme()

  return (
    <div className="flex items-center justify-between py-2">
      <div className="flex items-center gap-3">
        {dark ? <Moon className="h-4 w-4 text-text-muted" /> : <Sun className="h-4 w-4 text-text-muted" />}
        <div>
          <p className="text-sm font-medium text-text">Dark Mode</p>
          <p className="text-xs text-text-muted">Toggle between light and dark themes</p>
        </div>
      </div>
      <label className="relative inline-flex h-5 w-9 cursor-pointer items-center">
        <input
          type="checkbox"
          checked={dark}
          onChange={() => setDark(!dark)}
          className="peer sr-only"
        />
        <span className="absolute inset-0 rounded-full bg-muted peer-checked:bg-accent transition-colors" />
        <span className="absolute left-0.5 top-0.5 h-4 w-4 rounded-full bg-white peer-checked:translate-x-4 transition-transform" />
      </label>
    </div>
  )
}