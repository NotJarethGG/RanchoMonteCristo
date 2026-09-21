import {
  Waves, Home, Flame, ChefHat, CarFront, Trees, ShowerHead, Wifi, Sparkles,
  Music, Utensils, Tent, Sun, Dog, ParkingCircle, Baby, Armchair, Mountain,
  type LucideIcon,
} from 'lucide-react'

/**
 * Los servicios guardan el nombre del icono en la base de datos.
 * Este mapa lo traduce a un componente concreto sin importar todo lucide.
 */
const icons: Record<string, LucideIcon> = {
  waves: Waves,
  home: Home,
  flame: Flame,
  'chef-hat': ChefHat,
  'car-front': CarFront,
  trees: Trees,
  'shower-head': ShowerHead,
  wifi: Wifi,
  music: Music,
  utensils: Utensils,
  tent: Tent,
  sun: Sun,
  dog: Dog,
  parking: ParkingCircle,
  baby: Baby,
  armchair: Armchair,
  mountain: Mountain,
  sparkles: Sparkles,
}

/** Catálogo para el selector de iconos del dashboard. */
export const iconOptions = Object.keys(icons)

export function ServiceIcon({ name, className }: { name: string; className?: string }) {
  const Component = icons[name] ?? Sparkles
  return <Component className={className} strokeWidth={1.5} />
}
