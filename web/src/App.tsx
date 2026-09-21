import { lazy, Suspense } from 'react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { ProtectedRoute } from '@/routes/ProtectedRoute'
import { Spinner } from '@/components/ui/States'

// El sitio público y el dashboard se cargan por separado: quien entra a la
// homepage no descarga el bundle del panel administrativo.
const HomePage = lazy(() => import('@/pages/public/HomePage'))
const LoginPage = lazy(() => import('@/pages/admin/LoginPage'))
const AdminLayout = lazy(() => import('@/components/layout/AdminLayout'))
const DashboardPage = lazy(() => import('@/pages/admin/DashboardPage'))
const CalendarPage = lazy(() => import('@/pages/admin/CalendarPage'))
const ReservationsPage = lazy(() => import('@/pages/admin/ReservationsPage'))
const ReservationDetailPage = lazy(() => import('@/pages/admin/ReservationDetailPage'))
const CustomersPage = lazy(() => import('@/pages/admin/CustomersPage'))
const CustomerDetailPage = lazy(() => import('@/pages/admin/CustomerDetailPage'))
const PaymentsPage = lazy(() => import('@/pages/admin/PaymentsPage'))
const ServicesPage = lazy(() => import('@/pages/admin/ServicesPage'))
const GalleryPage = lazy(() => import('@/pages/admin/GalleryPage'))
const TestimonialsPage = lazy(() => import('@/pages/admin/TestimonialsPage'))
const PricingPage = lazy(() => import('@/pages/admin/PricingPage'))
const SettingsPage = lazy(() => import('@/pages/admin/SettingsPage'))
const UsersPage = lazy(() => import('@/pages/admin/UsersPage'))

function PageFallback() {
  return (
    <div className="flex min-h-dvh items-center justify-center bg-cream-50">
      <Spinner className="size-7" />
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<PageFallback />}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/admin/login" element={<LoginPage />} />

          <Route element={<ProtectedRoute />}>
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<DashboardPage />} />
              <Route path="calendario" element={<CalendarPage />} />
              <Route path="reservas" element={<ReservationsPage />} />
              <Route path="reservas/:id" element={<ReservationDetailPage />} />
              <Route path="clientes" element={<CustomersPage />} />
              <Route path="clientes/:id" element={<CustomerDetailPage />} />
              <Route path="pagos" element={<PaymentsPage />} />

              {/* Secciones exclusivas del rol ADMIN */}
              <Route element={<ProtectedRoute requireAdmin />}>
                <Route path="servicios" element={<ServicesPage />} />
                <Route path="galeria" element={<GalleryPage />} />
                <Route path="testimonios" element={<TestimonialsPage />} />
                <Route path="precios" element={<PricingPage />} />
                <Route path="configuracion" element={<SettingsPage />} />
                <Route path="usuarios" element={<UsersPage />} />
              </Route>
            </Route>
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  )
}
