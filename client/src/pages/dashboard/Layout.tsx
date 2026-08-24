import { useState, useEffect, createContext, useContext } from 'react'
import { Outlet } from 'react-router'
import Sidebar from '../../components/dashboard/Sidebar'
import Topbar from '../../components/dashboard/Topbar'

interface ThemeContextType {
  dark: boolean
  setDark: (value: boolean) => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export const useTheme = () => {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}

export default function Layout() {
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [dark, setDark] = useState(() => {
    if (typeof document === 'undefined') return false
    return document.documentElement.getAttribute('data-mode') === 'dark'
  })

  useEffect(() => {
    document.documentElement.setAttribute('data-mode', dark ? 'dark' : 'light')
  }, [dark])

  const handleSidebarToggle = () => {
    if (window.innerWidth < 1024) {
      setMobileOpen(!mobileOpen)
    } else {
      setCollapsed(!collapsed)
    }
  }

  return (
    <ThemeContext.Provider value={{ dark, setDark }}>
      <div className="flex h-screen overflow-hidden bg-bg"> {/* Fixed height, hide global overflow */}
        <Sidebar
          collapsed={collapsed}
          onToggle={handleSidebarToggle} // Pass the toggle function
          mobileOpen={mobileOpen}
          onMobileClose={() => setMobileOpen(false)}
        />

        <div className="flex flex-1 flex-col min-w-0">
          <Topbar mobileOpen={mobileOpen} onMobileToggle={() => setMobileOpen(!mobileOpen)} />
          <main className="flex-1 p-4 lg:p-6 overflow-y-auto"> {/* Ensure main content scrolls */}
            <Outlet />
          </main>
        </div>
      </div>
    </ThemeContext.Provider>
  )
}