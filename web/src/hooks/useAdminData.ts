import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { qk } from '@/lib/queryClient'
import { normalizeError } from '@/lib/api'
import {
  calendarService, contentService, customerService, dashboardService, paymentService,
  pricingService, reservationService, settingsService, userService,
  type ReservationFilters,
} from '@/services/admin.service'

/** Envuelve una mutación: toast de éxito/error + invalidación de caché. */
function useAdminMutation<TInput, TResult extends { message: string }>(
  fn: (input: TInput) => Promise<TResult>,
  invalidate: readonly (readonly unknown[])[],
) {
  const client = useQueryClient()

  return useMutation({
    mutationFn: fn,
    onSuccess: (result) => {
      toast.success(result.message)
      invalidate.forEach((key) => client.invalidateQueries({ queryKey: key }))
    },
    onError: (error) => toast.error(normalizeError(error).message),
  })
}

// ---------------------------------------------------------------- Resumen

export const useDashboard = () =>
  useQuery({ queryKey: qk.dashboard, queryFn: dashboardService.summary })

// ---------------------------------------------------------------- Calendario

export const useCalendarMonth = (month: string) =>
  useQuery({
    queryKey: qk.calendar(month),
    queryFn: () => calendarService.month(month),
    placeholderData: (previous) => previous,
  })

export const useBlockDate = () =>
  useAdminMutation(calendarService.block, [['admin', 'calendar'], qk.dashboard])

export const useUnblockDate = () =>
  useAdminMutation(calendarService.unblock, [['admin', 'calendar']])

// ---------------------------------------------------------------- Reservas

export const useReservations = (filters: ReservationFilters) =>
  useQuery({
    queryKey: qk.reservations(filters),
    queryFn: () => reservationService.list(filters),
    placeholderData: (previous) => previous,
  })

export const useReservation = (id: number) =>
  useQuery({
    queryKey: qk.reservation(id),
    queryFn: () => reservationService.get(id),
    enabled: Number.isFinite(id) && id > 0,
  })

const RESERVATION_KEYS: readonly (readonly unknown[])[] = [['admin', 'reservations'], ['admin', 'reservation'], ['admin', 'calendar'], ['admin', 'payments'], qk.dashboard]

export const useCreateReservation = () =>
  useAdminMutation(reservationService.create, RESERVATION_KEYS)

export const useUpdateReservation = (id: number) =>
  useAdminMutation((input: Record<string, unknown>) => reservationService.update(id, input), RESERVATION_KEYS)

export const useConfirmReservation = () =>
  useAdminMutation(reservationService.confirm, RESERVATION_KEYS)

export const useCancelReservation = () =>
  useAdminMutation(
    ({ id, reason }: { id: number; reason?: string }) => reservationService.cancel(id, reason),
    RESERVATION_KEYS,
  )

export const useCompleteReservation = () =>
  useAdminMutation(reservationService.complete, RESERVATION_KEYS)

// ---------------------------------------------------------------- Clientes

export const useCustomers = (params: { search?: string; page?: number }) =>
  useQuery({
    queryKey: qk.customers(params),
    queryFn: () => customerService.list(params),
    placeholderData: (previous) => previous,
  })

export const useCustomer = (id: number) =>
  useQuery({
    queryKey: qk.customer(id),
    queryFn: () => customerService.get(id),
    enabled: Number.isFinite(id) && id > 0,
  })

export const useCreateCustomer = () =>
  useAdminMutation(customerService.create, [['admin', 'customers']])

export const useUpdateCustomer = (id: number) =>
  useAdminMutation(
    (input: Parameters<typeof customerService.update>[1]) => customerService.update(id, input),
    [['admin', 'customers'], ['admin', 'customer']],
  )

// ---------------------------------------------------------------- Pagos

export const usePayments = (params: { search?: string; status?: string; page?: number }) =>
  useQuery({
    queryKey: qk.payments(params),
    queryFn: () => paymentService.list(params),
    placeholderData: (previous) => previous,
  })

export const useCreatePayment = () => useAdminMutation(paymentService.create, RESERVATION_KEYS)

// ---------------------------------------------------------------- Contenido

export const useServices = () =>
  useQuery({ queryKey: qk.services, queryFn: contentService.services })

export const useCreateService = () =>
  useAdminMutation(contentService.createService, [qk.services, qk.landing])

export const useUpdateService = () =>
  useAdminMutation(
    ({ id, input }: { id: number; input: Record<string, unknown> }) =>
      contentService.updateService(id, input),
    [qk.services, qk.landing],
  )

export const useDeleteService = () =>
  useAdminMutation(contentService.deleteService, [qk.services, qk.landing])

export const useGallery = () =>
  useQuery({ queryKey: qk.gallery, queryFn: contentService.gallery })

export const useCreateImage = () =>
  useAdminMutation(contentService.createImage, [qk.gallery, qk.landing])

export const useUpdateImage = () =>
  useAdminMutation(
    ({ id, input }: { id: number; input: Record<string, unknown> }) =>
      contentService.updateImage(id, input),
    [qk.gallery, qk.landing],
  )

export const useDeleteImage = () =>
  useAdminMutation(contentService.deleteImage, [qk.gallery, qk.landing])

export const useReorderGallery = () =>
  useAdminMutation(contentService.reorderGallery, [qk.gallery, qk.landing])

export const useTestimonials = () =>
  useQuery({ queryKey: qk.testimonials, queryFn: contentService.testimonials })

export const useCreateTestimonial = () =>
  useAdminMutation(contentService.createTestimonial, [qk.testimonials, qk.landing])

export const useUpdateTestimonial = () =>
  useAdminMutation(
    ({ id, input }: { id: number; input: Record<string, unknown> }) =>
      contentService.updateTestimonial(id, input),
    [qk.testimonials, qk.landing],
  )

export const useDeleteTestimonial = () =>
  useAdminMutation(contentService.deleteTestimonial, [qk.testimonials, qk.landing])

// ---------------------------------------------------------------- Configuración

export const useSettings = () =>
  useQuery({ queryKey: qk.settings, queryFn: settingsService.get })

export const useUpdateSettings = () =>
  useAdminMutation(settingsService.update, [qk.settings, qk.landing])

// ---------------------------------------------------------------- Precios

export const usePricing = () => useQuery({ queryKey: qk.pricing, queryFn: pricingService.list })

export const useCreatePricingRule = () =>
  useAdminMutation(pricingService.create, [qk.pricing])

export const useUpdatePricingRule = () =>
  useAdminMutation(
    ({ id, input }: { id: number; input: Record<string, unknown> }) =>
      pricingService.update(id, input),
    [qk.pricing],
  )

export const useDeletePricingRule = () => useAdminMutation(pricingService.remove, [qk.pricing])

// ---------------------------------------------------------------- Usuarios

export const useUsers = () => useQuery({ queryKey: qk.users, queryFn: userService.list })
export const useRoles = () => useQuery({ queryKey: qk.roles, queryFn: userService.roles })

export const useCreateUser = () => useAdminMutation(userService.create, [qk.users])

export const useUpdateUser = () =>
  useAdminMutation(
    ({ id, input }: { id: number; input: Record<string, unknown> }) =>
      userService.update(id, input),
    [qk.users],
  )

export const useDeleteUser = () => useAdminMutation(userService.remove, [qk.users])
