import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'sonner'
import { queryClient } from '@/lib/queryClient'
import { landingQuery } from '@/lib/landingQuery'
import { AuthProvider } from '@/hooks/useAuth'
import App from './App'
import './index.css'

// En la portada, los datos se piden YA, en paralelo con la descarga del
// código de la página. Sin esto la petición salía recién cuando la página
// terminaba de cargar y montarse: una ida y vuelta más antes de poder mostrar
// la foto principal (era la mayor parte del LCP).
if (window.location.pathname === '/' || window.location.pathname === '/en') {
  void queryClient.prefetchQuery(landingQuery)
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <App />
        <Toaster
          position="top-right"
          richColors
          closeButton
          toastOptions={{
            style: {
              borderRadius: '0.875rem',
              fontFamily: 'Inter, sans-serif',
            },
          }}
        />
      </AuthProvider>
    </QueryClientProvider>
  </StrictMode>,
)
