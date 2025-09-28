import { enableMapSet } from "immer";
enableMapSet();
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import {
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { RouteErrorBoundary } from '@/components/RouteErrorBoundary';
import '@/index.css'
// Import components and pages
import { Layout } from '@/components/Layout';
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { HomePage } from '@/pages/HomePage';
import { CleanersPage } from '@/pages/CleanersPage';
import { CleanerProfilePage } from '@/pages/CleanerProfilePage';
import { AuthPage } from '@/pages/AuthPage';
import { ClientDashboardPage } from "@/pages/ClientDashboardPage";
import { CleanerDashboardPage } from "@/pages/CleanerDashboardPage";
import { AdminDashboardPage } from "@/pages/AdminDashboardPage";
import { BookingPage } from "@/pages/BookingPage";
import { DemoPage } from '@/pages/DemoPage';
import { TermsOfServicePage } from "@/pages/TermsOfServicePage";
import { PrivacyPolicyPage } from "@/pages/PrivacyPolicyPage";
import { SupportPage } from "@/pages/SupportPage";
const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    errorElement: <RouteErrorBoundary />,
    children: [
      { index: true, element: <HomePage /> },
      { path: "cleaners", element: <CleanersPage /> },
      { path: "cleaner/:id", element: <CleanerProfilePage /> },
      { path: "auth", element: <AuthPage /> },
      {
        path: "book/:id",
        element: <ProtectedRoute allowedRoles={['client']}><BookingPage /></ProtectedRoute>,
      },
      {
        path: "dashboard/client",
        element: <ProtectedRoute allowedRoles={['client']}><ClientDashboardPage /></ProtectedRoute>,
      },
      {
        path: "dashboard/cleaner",
        element: <ProtectedRoute allowedRoles={['cleaner']}><CleanerDashboardPage /></ProtectedRoute>,
      },
      {
        path: "dashboard/admin",
        element: <ProtectedRoute allowedRoles={['admin']}><AdminDashboardPage /></ProtectedRoute>,
      },
      { path: "terms", element: <TermsOfServicePage /> },
      { path: "privacy", element: <PrivacyPolicyPage /> },
      { path: "support", element: <SupportPage /> },
      { path: "demo", element: <DemoPage /> },
    ],
  },
]);
// Register Service Worker for PWA
if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').then(registration => {
      console.log('SW registered: ', registration);
    }).catch(registrationError => {
      console.log('SW registration failed: ', registrationError);
    });
  });
}
// Do not touch this code
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <RouterProvider router={router} />
    </ErrorBoundary>
  </StrictMode>,
)