import { QueryClientProvider } from '@tanstack/react-query'
import { RouterProvider } from 'react-router'
import { queryClient } from './lib/queryClient'
import { router } from './lib/router'
import { Toaster } from './components/ui/toast'
import CookieConsent from './components/shared/CookieConsent'

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
      <CookieConsent />
      <Toaster />
    </QueryClientProvider>
  )
}
