import { createContext, useContext } from 'react'
import type { GalleryImage, Ranch } from '@/types'

/*
 * Idiomas del sitio público. El español es el principal y vive en `/`; el
 * inglés, en `/en`, para quien viene de afuera. El panel administrativo
 * queda siempre en español: no pone proveedor y toma el valor por defecto.
 *
 * Los textos fijos de la página están acá abajo. Los que carga el propietario
 * (descripción, servicios, fotos…) vienen de la API con su traducción al
 * lado, y se eligen con `useTr`.
 */
export type Lang = 'es' | 'en'

const LangContext = createContext<Lang>('es')
export const LangProvider = LangContext.Provider
export const useLang = () => useContext(LangContext)

/** Ruta de la portada en cada idioma. */
export const HOME_PATH: Record<Lang, string> = { es: '/', en: '/en' }

const es = {
  meta: {
    title: 'Rancho Montecristo | Alquiler para eventos en Nicoya',
    description:
      'Alquilá el Rancho Montecristo completo en Nicoya, Guanacaste: cumpleaños, bodas, reuniones familiares y eventos de empresa. Rancho techado, áreas verdes y parqueo privado.',
  },
  idioma: {
    grupo: 'Idioma',
    es: 'Español',
    en: 'English',
  },
  nav: {
    links: {
      'sobre-el-rancho': 'El lugar',
      galeria: 'Fotos',
      servicios: 'Lo que hay',
      disponibilidad: 'Fechas',
      ubicacion: 'Cómo llegar',
    } as Record<string, string>,
    alInicio: 'ir al inicio',
    apartar: 'Apartar fecha',
    menu: 'Menú',
    abrirMenu: 'Abrir menú',
    cerrarMenu: 'Cerrar menú',
    llamar: 'o llamá al',
  },
  whatsapp: {
    consulta: 'Hola, quisiera consultar por una fecha en el rancho.',
    apartar: 'Hola, quisiera apartar una fecha en el rancho.',
    disponibilidad: 'Hola, quisiera consultar la disponibilidad del rancho.',
  },
  hero: {
    tagline: 'Un rancho entero, solo para tu gente.',
    description:
      'Alquilamos el Rancho Montecristo completo para cumpleaños, bodas, reuniones familiares y paseos. Ese día no hay otros grupos: el lugar es de ustedes.',
    altFoto: 'Vista del rancho',
    cta: 'Ver fechas libres',
    escribinos: 'o escribinos al',
  },
  about: {
    titulo: 'El lugar',
    capacidad: 'Capacidad',
    hasta: (n: number) => `Hasta ${n} personas`,
    horario: (desde: string, hasta: string) => `De ${desde} a ${hasta}`,
    espacio: 'Espacio cómodo para grupos grandes.',
    ubicacion: 'Ubicación',
    usos: 'Para qué se usa',
    tiposEvento: (n: number) => `${n} tipos de evento`,
    areas: 'Áreas',
    nAreas: (n: number) => `${n} áreas`,
  },
  gallery: {
    titulo: 'Así se ve',
    categorias: {
      todas: 'Todas',
      'areas-verdes': 'Áreas verdes',
      rancho: 'Rancho',
      eventos: 'Eventos',
      parrilla: 'Parrilla',
      cocina: 'Cocina',
    } as Record<string, string>,
    filtrar: 'Filtrar fotos',
    tocar: 'Tocá una foto para verla en grande',
    ampliar: 'Ampliar foto',
    rancho: 'rancho',
    altFoto: 'Fotografía del rancho',
    de: 'de',
    anterior: 'Foto anterior',
    siguiente: 'Foto siguiente',
  },
  services: {
    titulo: 'Lo que hay',
    intro: 'Todo viene con el alquiler. Durante el día el rancho es solo de tu grupo.',
  },
  availability: {
    titulo: 'Fechas libres',
    intro:
      'Tocá un día en blanco para ver cuánto sale. La fecha queda apartada cuando la confirmamos con vos por teléfono o WhatsApp.',
    elegida: 'Fecha elegida',
    personas: '¿Cuántas personas, más o menos?',
    calculando: 'Calculando…',
    total: 'Total estimado',
    notaAntes: 'Es un precio de referencia. La fecha se aparta con un adelanto de',
    notaDespues: 'y el precio final lo confirmamos al hablar con vos.',
    moneda: '',
    pedir: 'Pedir esta fecha',
    elegi: 'Elegí un día en el calendario',
    elegiDetalle: 'Te mostramos al momento cuánto sale para la cantidad de personas que vengan.',
    politicas: 'Cómo se aparta la fecha',
  },
  calendario: {
    anterior: 'Mes anterior',
    siguiente: 'Mes siguiente',
    dias: ['L', 'M', 'M', 'J', 'V', 'S', 'D'],
    diaAria: "d 'de' MMMM",
    estados: {
      available: 'Libre',
      pending: 'Pendiente',
      reserved: 'Reservado',
      blocked: 'No disponible',
      past: 'Pasado',
    },
  },
  fechas: {
    larga: "d 'de' MMMM, yyyy",
    corta: 'd MMM yyyy',
    mesAnio: 'MMM yyyy',
  },
  booking: {
    titulo: 'Apartá tu fecha',
    intro1:
      'Llená la solicitud y te llamamos o escribimos para confirmar el precio y cómo apartar el día.',
    intro2: 'Nada queda confirmado hasta que hablemos con vos.',
    directo: '¿Preferís escribir directo?',
    whatsappAl: 'WhatsApp al',
    solicitud: 'Solicitud de fecha',
    para: (fecha: string) => `Para el ${fecha}`,
    sinFecha: 'Fecha por definir',
    senuelo: 'No completar este campo',
    nombre: 'Nombre completo',
    telefono: 'Teléfono',
    telefonoHint: undefined as string | undefined,
    correo: 'Correo (opcional)',
    correoHint: 'Solo si querés la confirmación por escrito.',
    fecha: 'Fecha',
    llegada: 'Llegada',
    salida: 'Salida',
    personas: 'Personas',
    celebran: 'Qué celebran',
    elegiOpcion: 'Elegí una opción',
    otro: 'Otro',
    notas: 'Algo más que debamos saber',
    notasHint: 'Si llevan comida, música, decoración o necesitan llegar más temprano.',
    pendienteAntes: 'Al enviarla, la fecha queda',
    pendiente: 'pendiente',
    pendienteDespues: ', no confirmada.',
    enviar: 'Enviar solicitud',
    errores: {
      nombre: 'Escribí tu nombre completo.',
      telefono: 'Necesitamos un teléfono de al menos 8 dígitos.',
      correo: 'Revisá el formato del correo.',
      fecha: 'Elegí la fecha del evento.',
      entrada: 'Indicá la hora de entrada.',
      salidaFalta: 'Indicá la hora de salida.',
      personas: 'Indicá al menos una persona.',
      salida: 'La salida debe ser después de la entrada.',
    },
    /** En español se muestran tal cual los mensajes del servidor. */
    servidor: null as null | {
      campo: string
      fecha: string
      general: string
      enviada: string
    },
    recibida: 'Recibida',
    recibidaTitulo: 'Ya tenemos tu solicitud',
    recibidaAntes: 'La fecha queda como',
    recibidaDespues:
      'hasta que hablemos. Te escribimos o llamamos pronto para confirmar el precio y coordinar el adelanto.',
    otra: 'Enviar otra solicitud',
  },
  location: {
    titulo: 'Cómo llegar',
    mapa: (nombre: string) => `Mapa de la ubicación de ${nombre}`,
    sinUbicacion: 'La ubicación todavía no está configurada.',
    direccion: 'Dirección',
    abrirMaps: 'Abrir en Maps',
    horarios: 'Horarios',
  },
  testimonials: {
    titulo: 'Lo que nos han dicho',
    traducido: 'Traducido del español',
  },
  cierre: {
    titulo: '¿Qué fecha tenés en mente?',
    intro:
      'Contanos qué están celebrando y cuántos vienen. Te decimos al momento si la fecha está libre.',
    whatsapp: 'Escribinos por WhatsApp',
    cta: 'Ver fechas libres',
  },
  footer: {
    resumen: (ciudad: string) =>
      `Rancho para eventos y reuniones en ${ciudad}, Guanacaste. Se alquila completo, un grupo por día.`,
    logo: (nombre: string) => `Logo de ${nombre}`,
    contacto: 'Contacto',
    dondeEstamos: 'Dónde estamos',
    admin: 'Acceso administrativo',
  },
  estado: {
    cargando: 'Cargando',
    errorTitulo: 'No pudimos cargar la información',
    reintentar: 'Reintentar',
  },
}

export type Textos = typeof es

const en: Textos = {
  meta: {
    title: 'Rancho Montecristo | Event venue rental in Nicoya, Costa Rica',
    description:
      'Rent all of Rancho Montecristo in Nicoya, Guanacaste, Costa Rica: birthdays, weddings, family gatherings and company events. Covered pavilion, green areas and private parking.',
  },
  idioma: {
    grupo: 'Language',
    es: 'Español',
    en: 'English',
  },
  nav: {
    links: {
      // Cortos a propósito: en inglés la barra tiene que caber en 1024 px.
      'sobre-el-rancho': 'About',
      galeria: 'Photos',
      servicios: 'Amenities',
      disponibilidad: 'Dates',
      ubicacion: 'Location',
    },
    alInicio: 'back to top',
    apartar: 'Book a date',
    menu: 'Menu',
    abrirMenu: 'Open menu',
    cerrarMenu: 'Close menu',
    llamar: 'or call',
  },
  whatsapp: {
    consulta: "Hi! I'd like to ask about a date at the ranch.",
    apartar: "Hi! I'd like to book a date at the ranch.",
    disponibilidad: "Hi! I'd like to check the ranch's availability.",
  },
  hero: {
    tagline: 'A whole ranch, just for your group.',
    description:
      'We rent out all of Rancho Montecristo for birthdays, weddings, family gatherings and day trips. No other groups that day: the place is all yours.',
    altFoto: 'View of the ranch',
    cta: 'See open dates',
    escribinos: 'or message us at',
  },
  about: {
    titulo: 'The place',
    capacidad: 'Capacity',
    hasta: (n) => `Up to ${n} guests`,
    horario: (desde, hasta) => `From ${desde} to ${hasta}`,
    espacio: 'Plenty of room for large groups.',
    ubicacion: 'Location',
    usos: "What it's for",
    tiposEvento: (n) => `${n} kinds of events`,
    areas: 'Areas',
    nAreas: (n) => `${n} areas`,
  },
  gallery: {
    titulo: 'Take a look',
    categorias: {
      todas: 'All',
      'areas-verdes': 'Green areas',
      rancho: 'Ranch',
      eventos: 'Events',
      parrilla: 'Grill',
      cocina: 'Kitchen',
    },
    filtrar: 'Filter photos',
    tocar: 'Tap a photo to see it larger',
    ampliar: 'Enlarge photo',
    rancho: 'ranch',
    altFoto: 'Photo of the ranch',
    de: 'of',
    anterior: 'Previous photo',
    siguiente: 'Next photo',
  },
  services: {
    titulo: "What's included",
    intro: 'It all comes with the rental. For the day, the ranch belongs to your group alone.',
  },
  availability: {
    titulo: 'Open dates',
    intro:
      "Tap a white day to see the price. Your date is held once we've confirmed it with you by phone or WhatsApp.",
    elegida: 'Selected date',
    personas: 'About how many guests?',
    calculando: 'Calculating…',
    total: 'Estimated total',
    notaAntes: 'This is a reference price. The date is held with a deposit of',
    notaDespues: "and we'll confirm the final price when we talk.",
    moneda: 'Prices are in Costa Rican colones (₡).',
    pedir: 'Request this date',
    elegi: 'Pick a day on the calendar',
    elegiDetalle: "We'll show you the price right away for the number of guests coming.",
    politicas: 'How to hold your date',
  },
  calendario: {
    anterior: 'Previous month',
    siguiente: 'Next month',
    dias: ['M', 'T', 'W', 'T', 'F', 'S', 'S'],
    diaAria: 'MMMM d',
    estados: {
      available: 'Available',
      pending: 'Pending',
      reserved: 'Booked',
      blocked: 'Unavailable',
      past: 'Past',
    },
  },
  fechas: {
    larga: 'MMMM d, yyyy',
    corta: 'MMM d, yyyy',
    mesAnio: 'MMM yyyy',
  },
  booking: {
    titulo: 'Book your date',
    intro1:
      "Fill out the request and we'll call or message you to confirm the price and how to hold the day.",
    intro2: "Nothing is confirmed until we've talked with you.",
    directo: 'Rather message us directly?',
    whatsappAl: 'WhatsApp',
    solicitud: 'Date request',
    para: (fecha) => `For ${fecha}`,
    sinFecha: 'Date to be decided',
    senuelo: 'Leave this field empty',
    nombre: 'Full name',
    telefono: 'Phone',
    telefonoHint: "Include your country code if you're outside Costa Rica.",
    correo: 'Email (optional)',
    correoHint: "Only if you'd like the confirmation in writing.",
    fecha: 'Date',
    llegada: 'Arrival',
    salida: 'Departure',
    personas: 'Guests',
    celebran: "What's the occasion?",
    elegiOpcion: 'Choose one',
    otro: 'Other',
    notas: 'Anything else we should know?',
    notasHint: "Whether you're bringing food, music or decorations, or need to arrive earlier.",
    pendienteAntes: 'Once sent, the date is',
    pendiente: 'pending',
    pendienteDespues: ', not confirmed.',
    enviar: 'Send request',
    errores: {
      nombre: 'Please enter your full name.',
      telefono: 'We need a phone number with at least 8 digits.',
      correo: 'Please check the email format.',
      fecha: 'Please choose the event date.',
      entrada: 'Please enter the arrival time.',
      salidaFalta: 'Please enter the departure time.',
      personas: 'Please enter at least one guest.',
      salida: 'Departure must be after arrival.',
    },
    // El servidor contesta en español: en inglés se muestran estos.
    servidor: {
      campo: 'Please check this field.',
      fecha: 'That date is no longer available. Please choose another one.',
      general: "We couldn't send your request. Please try again or message us on WhatsApp.",
      enviada: "We got your request. We'll contact you to confirm the date.",
    },
    recibida: 'Received',
    recibidaTitulo: 'We got your request',
    recibidaAntes: 'The date stays',
    recibidaDespues:
      "until we talk. We'll message or call you soon to confirm the price and arrange the deposit.",
    otra: 'Send another request',
  },
  location: {
    titulo: 'Getting there',
    mapa: (nombre) => `Map showing the location of ${nombre}`,
    sinUbicacion: "The location hasn't been set yet.",
    direccion: 'Address',
    abrirMaps: 'Open in Maps',
    horarios: 'Hours',
  },
  testimonials: {
    titulo: 'What guests say',
    traducido: 'Translated from Spanish',
  },
  cierre: {
    titulo: 'What date do you have in mind?',
    intro:
      "Tell us what you're celebrating and how many are coming. We'll let you know right away if the date is open.",
    whatsapp: 'Message us on WhatsApp',
    cta: 'See open dates',
  },
  footer: {
    resumen: (ciudad) =>
      `A ranch for events and gatherings in ${ciudad}, Guanacaste, Costa Rica. Rented whole, one group per day.`,
    logo: (nombre) => `${nombre} logo`,
    contacto: 'Contact',
    dondeEstamos: 'Where we are',
    admin: 'Admin access',
  },
  estado: {
    cargando: 'Loading',
    errorTitulo: "We couldn't load the page",
    reintentar: 'Try again',
  },
}

const TEXTOS: Record<Lang, Textos> = { es, en }

export const useT = () => TEXTOS[useLang()]

type ConTraducciones = { translations?: { en?: object } }

/**
 * Elige el texto de un campo de la base según el idioma. Si la traducción
 * falta o está vacía, queda el español.
 */
export function traducir<T extends ConTraducciones, K extends keyof T & string>(
  item: T,
  campo: K,
  lang: Lang,
): T[K] {
  if (lang === 'es') return item[campo]
  const valor = (item.translations?.en as Record<string, unknown> | undefined)?.[campo]
  const vacio = valor == null || valor === '' || (Array.isArray(valor) && valor.length === 0)
  return vacio ? item[campo] : (valor as T[K])
}

/** `traducir` atado al idioma de la página. */
export function useTr() {
  const lang = useLang()
  return <T extends ConTraducciones, K extends keyof T & string>(item: T, campo: K) =>
    traducir(item, campo, lang)
}

/** Si el campo se está mostrando traducido (para avisar en los testimonios). */
export function estaTraducido(item: ConTraducciones, campo: string, lang: Lang) {
  if (lang === 'es') return false
  const valor = (item.translations?.en as Record<string, unknown> | undefined)?.[campo]
  return typeof valor === 'string' && valor.trim() !== ''
}

/** La dirección está anidada en `location`, así que no sirve `traducir`. */
export function direccion(ranch: Ranch, lang: Lang) {
  return (lang === 'en' && ranch.translations?.en?.address) || ranch.location.address
}

/**
 * Texto alternativo de una foto. En inglés, si falta el alt traducido se usa
 * el título traducido antes que el alt en español.
 */
export function altDeFoto(image: GalleryImage, lang: Lang) {
  if (lang === 'en') {
    const en = image.translations?.en
    if (en?.alt || en?.title) return en.alt || en.title
  }
  return image.alt ?? image.title
}
