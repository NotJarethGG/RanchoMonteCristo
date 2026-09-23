import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'sonner'
import { qk, queryClient } from '@/lib/queryClient'
import { publicService } from '@/services/public.service'
import { AuthProvider } from '@/hooks/useAuth'
import App from './App'
import './index.css'

// En la portada, los datos se piden YA, en paralelo con la descarga del
// código de la página. Sin esto la petición salía recién cuando la página
// terminaba de cargar y montarse: una ida y vuelta más antes de poder mostrar
// la foto principal (era la mayor parte del LCP).
if (window.location.pathname === '/') {
  void queryClient.prefetchQuery({ queryKey: qk.landing, queryFn: publicService.landing })
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
