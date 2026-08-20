import { createBrowserRouter } from 'react-router'

import HomePage from '../pages/HomePage'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <HomePage />,
  },
  { path: '/pricing', lazy: () => import('../pages/PricingPage').then((m) => ({ Component: m.default })) },
  { path: '/features', lazy: () => import('../pages/FeaturesPage').then((m) => ({ Component: m.default })) },
  { path: '/blog', lazy: () => import('../pages/BlogIndexPage').then((m) => ({ Component: m.default })) },
  { path: '/blog/:slug', lazy: () => import('../pages/BlogPostPage').then((m) => ({ Component: m.default })) },
  { path: '/about', lazy: () => import('../pages/AboutPage').then((m) => ({ Component: m.default })) },
  { path: '/contact', lazy: () => import('../pages/ContactPage').then((m) => ({ Component: m.default })) },
  { path: '/privacy', lazy: () => import('../pages/PrivacyPage').then((m) => ({ Component: m.default })) },
  { path: '/terms', lazy: () => import('../pages/TermsPage').then((m) => ({ Component: m.default })) },
  { path: '/login', lazy: () => import('../pages/LoginPage').then((m) => ({ Component: m.default })) },
  { path: '/signup', lazy: () => import('../pages/SignupPage').then((m) => ({ Component: m.default })) },
  { path: '/forgot-password', lazy: () => import('../pages/ForgotPasswordPage').then((m) => ({ Component: m.default })) },
  { path: '/reset-password', lazy: () => import('../pages/ResetPasswordPage').then((m) => ({ Component: m.default })) },
  {
    path: '/dashboard',
    lazy: () => import('../pages/dashboard/Layout').then((m) => ({ Component: m.default })),
    children: [
      { index: true, lazy: () => import('../pages/dashboard/DashboardPage').then((m) => ({ Component: m.default })) },
      { path: 'invoices', lazy: () => import('../pages/dashboard/InvoicesPage').then((m) => ({ Component: m.default })) },
      { path: 'invoices/new', lazy: () => import('../pages/dashboard/InvoiceFormPage').then((m) => ({ Component: m.default })) },
      { path: 'invoices/:id/edit', lazy: () => import('../pages/dashboard/InvoiceFormPage').then((m) => ({ Component: m.default })) },
      { path: 'expenses', lazy: () => import('../pages/dashboard/ExpensesPage').then((m) => ({ Component: m.default })) },
      { path: 'expenses/new', lazy: () => import('../pages/dashboard/ExpenseFormPage').then((m) => ({ Component: m.default })) },
      { path: 'clients', lazy: () => import('../pages/dashboard/ClientsPage').then((m) => ({ Component: m.default })) },
      { path: 'bank', lazy: () => import('../pages/dashboard/BankPage').then((m) => ({ Component: m.default })) },
      { path: 'reports', lazy: () => import('../pages/dashboard/ReportsPage').then((m) => ({ Component: m.default })) },
      { path: 'tax', lazy: () => import('../pages/dashboard/TaxCentrePage').then((m) => ({ Component: m.default })) },
      { path: 'payroll', lazy: () => import('../pages/dashboard/PayrollPage').then((m) => ({ Component: m.default })) },
      { path: 'team', lazy: () => import('../pages/dashboard/TeamPage').then((m) => ({ Component: m.default })) },
      { path: 'settings', lazy: () => import('../pages/dashboard/SettingsPage').then((m) => ({ Component: m.default })) },
    ],
  },
])