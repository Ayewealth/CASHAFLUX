import { createBrowserRouter, Outlet } from 'react-router'

import AuthGuard from '../components/AuthGuard'
import HomePage from '../pages/HomePage'
import NotFoundPage from '../pages/NotFoundPage'
import ErrorBoundary from '../components/ErrorBoundary'
import ScrollToTop from '../components/shared/ScrollToTop'

function ErrorFallback() {
  return (
    <ErrorBoundary fallback={null}>
      <NotFoundPage />
    </ErrorBoundary>
  )
}

function MarketingLayout() {
  return (
    <>
      <ScrollToTop />
      <Outlet />
    </>
  )
}

export const router = createBrowserRouter([
  {
    element: <MarketingLayout />,
    children: [
      { index: true, element: <HomePage />, errorElement: <ErrorFallback /> },
      { path: 'pricing', lazy: () => import('../pages/PricingPage').then((m) => ({ Component: m.default })), errorElement: <ErrorFallback /> },
      { path: 'features', lazy: () => import('../pages/FeaturesPage').then((m) => ({ Component: m.default })), errorElement: <ErrorFallback /> },
      { path: 'features/invoicing', lazy: () => import('../pages/features/InvoicingFeaturePage').then((m) => ({ Component: m.default })), errorElement: <ErrorFallback /> },
      { path: 'features/expenses', lazy: () => import('../pages/features/ExpensesFeaturePage').then((m) => ({ Component: m.default })), errorElement: <ErrorFallback /> },
      { path: 'features/bank-reconciliation', lazy: () => import('../pages/features/BankFeaturePage').then((m) => ({ Component: m.default })), errorElement: <ErrorFallback /> },
      { path: 'features/reports', lazy: () => import('../pages/features/ReportsFeaturePage').then((m) => ({ Component: m.default })), errorElement: <ErrorFallback /> },
      { path: 'features/tax-centre', lazy: () => import('../pages/features/TaxCentreFeaturePage').then((m) => ({ Component: m.default })), errorElement: <ErrorFallback /> },
      { path: 'security', lazy: () => import('../pages/SecurityPage').then((m) => ({ Component: m.default })), errorElement: <ErrorFallback /> },
      { path: 'about', lazy: () => import('../pages/AboutPage').then((m) => ({ Component: m.default })), errorElement: <ErrorFallback /> },
      { path: 'integrations', lazy: () => import('../pages/IntegrationsPage').then((m) => ({ Component: m.default })), errorElement: <ErrorFallback /> },
      { path: 'compare/:competitor', lazy: () => import('../pages/ComparePage').then((m) => ({ Component: m.default })), errorElement: <ErrorFallback /> },
      { path: 'blog', lazy: () => import('../pages/BlogIndexPage').then((m) => ({ Component: m.default })), errorElement: <ErrorFallback /> },
      { path: 'blog/:slug', lazy: () => import('../pages/BlogPostPage').then((m) => ({ Component: m.default })), errorElement: <ErrorFallback /> },
      { path: 'how-it-works', lazy: () => import('../pages/HowItWorksPage').then((m) => ({ Component: m.default })), errorElement: <ErrorFallback /> },
      { path: 'contact', lazy: () => import('../pages/ContactPage').then((m) => ({ Component: m.default })), errorElement: <ErrorFallback /> },
      { path: 'privacy', lazy: () => import('../pages/PrivacyPage').then((m) => ({ Component: m.default })), errorElement: <ErrorFallback /> },
      { path: 'terms', lazy: () => import('../pages/TermsPage').then((m) => ({ Component: m.default })), errorElement: <ErrorFallback /> },
      { path: 'login', lazy: () => import('../pages/LoginPage').then((m) => ({ Component: m.default })), errorElement: <ErrorFallback /> },
      { path: 'signup', lazy: () => import('../pages/SignupPage').then((m) => ({ Component: m.default })), errorElement: <ErrorFallback /> },
      { path: 'verify-email', lazy: () => import('../pages/VerifyEmailPage').then((m) => ({ Component: m.default })), errorElement: <ErrorFallback /> },
      { path: 'forgot-password', lazy: () => import('../pages/ForgotPasswordPage').then((m) => ({ Component: m.default })), errorElement: <ErrorFallback /> },
      { path: 'reset-password', lazy: () => import('../pages/ResetPasswordPage').then((m) => ({ Component: m.default })), errorElement: <ErrorFallback /> },
      { path: 'onboarding', lazy: () => import('../pages/onboarding/OnboardingPage').then((m) => ({ Component: m.default })), errorElement: <ErrorFallback /> },
    ],
  },
  {
    path: '/dashboard',
    element: <AuthGuard />,
    errorElement: <ErrorFallback />,
    children: [
      {
        path: '',
        lazy: () => import('../pages/dashboard/Layout').then((m) => ({ Component: m.default })),
        errorElement: <ErrorFallback />,
        children: [
          { index: true, lazy: () => import('../pages/dashboard/DashboardPage').then((m) => ({ Component: m.default })), errorElement: <ErrorFallback /> },
          { path: 'invoices', lazy: () => import('../pages/dashboard/InvoicesPage').then((m) => ({ Component: m.default })), errorElement: <ErrorFallback /> },
          { path: 'invoices/new', lazy: () => import('../pages/dashboard/InvoiceFormPage').then((m) => ({ Component: m.default })), errorElement: <ErrorFallback /> },
          { path: 'invoices/:id/edit', lazy: () => import('../pages/dashboard/InvoiceFormPage').then((m) => ({ Component: m.default })), errorElement: <ErrorFallback /> },
          { path: 'expenses', lazy: () => import('../pages/dashboard/ExpensesPage').then((m) => ({ Component: m.default })), errorElement: <ErrorFallback /> },
          { path: 'mileage', lazy: () => import('../pages/dashboard/MileagePage').then((m) => ({ Component: m.default })), errorElement: <ErrorFallback /> },
          { path: 'clients', lazy: () => import('../pages/dashboard/ClientsPage').then((m) => ({ Component: m.default })), errorElement: <ErrorFallback /> },
          { path: 'bank', lazy: () => import('../pages/dashboard/BankPage').then((m) => ({ Component: m.default })), errorElement: <ErrorFallback /> },
          { path: 'reports', lazy: () => import('../pages/dashboard/ReportsPage').then((m) => ({ Component: m.default })), errorElement: <ErrorFallback /> },
          { path: 'tax', lazy: () => import('../pages/dashboard/TaxCentrePage').then((m) => ({ Component: m.default })), errorElement: <ErrorFallback /> },
          { path: 'payroll', lazy: () => import('../pages/dashboard/PayrollPage').then((m) => ({ Component: m.default })), errorElement: <ErrorFallback /> },
          { path: 'team', lazy: () => import('../pages/dashboard/TeamPage').then((m) => ({ Component: m.default })), errorElement: <ErrorFallback /> },
          { path: 'settings', lazy: () => import('../pages/dashboard/SettingsPage').then((m) => ({ Component: m.default })), errorElement: <ErrorFallback /> },
          { path: 'activity', lazy: () => import('../pages/dashboard/ActivityPage').then((m) => ({ Component: m.default })), errorElement: <ErrorFallback /> },
        ],
      },
    ],
  },
  // 404 catch-all
  { path: '*', element: <NotFoundPage /> },
])